using System.Security.Claims;
using System.Text.Json;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Childsafenet.Api.Models;
using Childsafenet.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/scan")]
public class ScanController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AiClient _ai;

    private const bool ENABLE_FALLBACK_WHEN_AI_FAILS = true;

    public ScanController(AppDbContext db, AiClient ai)
    {
        _db = db;
        _ai = ai;
    }

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static string GetHost(string url)
    {
        try
        {
            if (!url.Contains("://")) url = "http://" + url;
            var uri = new Uri(url);

            return (uri.Host ?? "").ToLower();
        }
        catch
        {
            return "";
        }
    }

    private static List<string> ParseDomainsJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            var arr = JsonSerializer.Deserialize<List<string>>(json) ?? [];
            return arr
                .Select(x => (x ?? "").Trim().ToLower())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x =>
                {
                    try
                    {
                        if (x.Contains("://"))
                            return new Uri(x).Host.ToLower();
                    }
                    catch { }
                    return x.Replace("www.", "");
                })
                .Distinct()
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    private static bool DomainMatch(string host, string domain)
    {
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(domain)) return false;

        host = host.ToLower();
        domain = domain.ToLower().Trim();
        domain = domain.StartsWith(".") ? domain[1..] : domain;
        domain = domain.Replace("www.", "");

        return host == domain || host.EndsWith("." + domain) || host.EndsWith(domain);
    }

    [HttpPost]
    public async Task<ActionResult<ScanResult>> Scan([FromBody] ScanRequest req, CancellationToken ct)
    {
        var uid = UserId();

        var settings = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == uid, ct);
        if (settings is null)
            return BadRequest(new { message = "Missing user settings" });

        var host = GetHost(req.Url);

        var whitelist = ParseDomainsJson(settings.WhitelistJson);
        var blacklist = ParseDomainsJson(settings.BlacklistJson);

        if (!string.IsNullOrEmpty(host) && blacklist.Any(d => DomainMatch(host, d)))
        {
            var forced = new ScanResult(
                RiskLevel: "HIGH",
                Label: "blacklist",
                Score: 1.0,
                Action: "BLOCK",
                Explanation: new List<string> { "Blocked by blacklist" },
                Meta: new Dictionary<string, object> { ["host"] = host }
            );

            await SaveLog(uid, req, forced, ct);
            await UpsertDataset(uid, req, forced, host, ct);
            return Ok(forced);
        }

        if (!string.IsNullOrEmpty(host) && whitelist.Any(d => DomainMatch(host, d)))
        {
            var forced = new ScanResult(
                RiskLevel: "LOW",
                Label: "whitelist",
                Score: 1.0,
                Action: "ALLOW",
                Explanation: new List<string> { "Allowed by whitelist" },
                Meta: new Dictionary<string, object> { ["host"] = host }
            );

            await SaveLog(uid, req, forced, ct);
            await UpsertDataset(uid, req, forced, host, ct);
            return Ok(forced);
        }

        ScanResult aiRes;
        try
        {
            aiRes = await _ai.PredictAsync(req.Url, req.Title, req.Text, settings.ChildAge, ct);
        }
        catch (Exception ex)
        {
            if (!ENABLE_FALLBACK_WHEN_AI_FAILS)
            {
                return StatusCode(500, new
                {
                    message = "AI service error",
                    error_type = ex.GetType().Name,
                    error = ex.Message
                });
            }

            aiRes = new ScanResult(
                RiskLevel: "MEDIUM",
                Label: "ai_error",
                Score: 0.0,
                Action: "WARN",
                Explanation: new List<string>
                {
                    "AI service failed. Fallback to WARN for demo.",
                    ex.Message
                },
                Meta: new Dictionary<string, object>
                {
                    ["fallback"] = true,
                    ["host"] = host
                }
            );
        }

        var labelLower = (aiRes.Label ?? "").ToLower();
        var finalAction = aiRes.Action;

        if ((labelLower.Contains("adult") || labelLower.Contains("porn")) && settings.BlockAdult)
            finalAction = "BLOCK";

        if (labelLower.Contains("gambling") && settings.BlockGambling)
            finalAction = "BLOCK";

        if (labelLower.Contains("phishing") && settings.BlockPhishing)
            finalAction = "BLOCK";

        var finalRes = aiRes with { Action = finalAction };

        await SaveLog(uid, req, finalRes, ct);
        await UpsertDataset(uid, req, finalRes, host, ct);

        return Ok(finalRes);
    }

    private async Task SaveLog(Guid uid, ScanRequest req, ScanResult res, CancellationToken ct)
    {
        var log = new ScanLog
        {
            UserId = uid,
            Url = req.Url,
            Title = req.Title,
            Label = res.Label,
            RiskLevel = res.RiskLevel,
            Score = res.Score,
            Action = res.Action,
            ExplanationJson = JsonSerializer.Serialize(res.Explanation ?? new List<string>()),
            Source = string.IsNullOrWhiteSpace(req.Source) ? "Web" : req.Source,
            CreatedAt = DateTime.UtcNow
        };

        _db.ScanLogs.Add(log);
        await _db.SaveChangesAsync(ct);
    }

    private async Task UpsertDataset(Guid uid, ScanRequest req, ScanResult res, string host, CancellationToken ct)
    {
        var url = (req.Url ?? "").Trim();
        if (string.IsNullOrWhiteSpace(url)) return;

        var existing = await _db.UrlDatasets.FirstOrDefaultAsync(x => x.Url == url, ct);

        if (existing is null)
        {
            _db.UrlDatasets.Add(new UrlDataset
            {
                Url = url,
                Host = host,
                PredictedLabel = res.Label ?? "",
                PredictedScore = res.Score,
                Status = "Pending",
                Source = string.IsNullOrWhiteSpace(req.Source) ? "Web" : req.Source,
                FirstSeenAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow,
                SeenCount = 1
            });
        }
        else
        {
            existing.LastSeenAt = DateTime.UtcNow;
            existing.SeenCount += 1;

            if (existing.Status == "Pending")
            {
                existing.PredictedLabel = res.Label ?? existing.PredictedLabel;
                existing.PredictedScore = res.Score;
                existing.Host = string.IsNullOrWhiteSpace(existing.Host) ? host : existing.Host;
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}