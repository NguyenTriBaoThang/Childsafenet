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
            return new Uri(url).Host.ToLower();
        }
        catch { return ""; }
    }

    [HttpPost]
    public async Task<ActionResult<ScanResult>> Scan([FromBody] ScanRequest req, CancellationToken ct)
    {
        var uid = UserId();

        var settings = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == uid, ct);
        if (settings is null) return BadRequest(new { message = "Missing user settings" });

        var host = GetHost(req.Url);

        List<string> whitelist = [];
        List<string> blacklist = [];
        try { whitelist = JsonSerializer.Deserialize<List<string>>(settings.WhitelistJson) ?? []; } catch { }
        try { blacklist = JsonSerializer.Deserialize<List<string>>(settings.BlacklistJson) ?? []; } catch { }

        // blacklist/whitelist override
        if (!string.IsNullOrEmpty(host) && blacklist.Any(d => host.EndsWith(d.ToLower())))
        {
            var forced = new ScanResult("HIGH", "blacklist", 1.0, "BLOCK",
                new List<string> { "Blocked by blacklist" },
                new Dictionary<string, object> { ["host"] = host });

            await SaveLog(uid, req, forced, ct);
            return Ok(forced);
        }

        if (!string.IsNullOrEmpty(host) && whitelist.Any(d => host.EndsWith(d.ToLower())))
        {
            var forced = new ScanResult("LOW", "whitelist", 1.0, "ALLOW",
                new List<string> { "Allowed by whitelist" },
                new Dictionary<string, object> { ["host"] = host });

            await SaveLog(uid, req, forced, ct);
            return Ok(forced);
        }

        // call AI
        var aiRes = await _ai.PredictAsync(req.Url, req.Title, req.Text, settings.ChildAge, ct);

        // apply toggles (demo-level)
        var labelLower = (aiRes.Label ?? "").ToLower();
        var finalAction = aiRes.Action;

        if ((labelLower.Contains("adult") || labelLower.Contains("porn")) && settings.BlockAdult) finalAction = "BLOCK";
        if (labelLower.Contains("gambling") && settings.BlockGambling) finalAction = "BLOCK";
        if (labelLower.Contains("phishing") && settings.BlockPhishing) finalAction = "BLOCK";

        var finalRes = aiRes with { Action = finalAction };

        await SaveLog(uid, req, finalRes, ct);
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
}
