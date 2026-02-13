using System.Security.Claims;
using System.Text.Json;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Childsafenet.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SettingsController(AppDbContext db) => _db = db;

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ===== Helpers =====
    private static string NormalizeDomain(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "";
        var s = input.Trim().ToLowerInvariant();

        // remove scheme
        s = s.Replace("https://", "").Replace("http://", "");
        // remove path/query
        var slash = s.IndexOf('/');
        if (slash >= 0) s = s[..slash];
        // remove port
        var colon = s.IndexOf(':');
        if (colon >= 0) s = s[..colon];

        // remove leading www.
        if (s.StartsWith("www.")) s = s[4..];

        return s;
    }

    private static List<string> CleanDomains(IEnumerable<string> domains)
    {
        return domains
            .Select(NormalizeDomain)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .Take(500) // tránh spam
            .ToList();
    }

    private static (bool blockAdult, bool blockGambling, bool blockPhishing, bool warnSuspicious) PresetByMode(string mode)
    {
        mode = (mode ?? "").Trim();
        return mode switch
        {
            "Strict" => (true, true, true, true),
            "Relaxed" => (true, true, true, true), // Có thể nới: warn=false
            _ => (true, true, true, true), // Balanced default
        };
    }

    private async Task<UserSettings> GetOrCreate(Guid uid)
    {
        var s = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == uid);
        if (s != null) return s;

        // create default
        s = new UserSettings
        {
            UserId = uid,
            ChildAge = 10,
            Mode = "Balanced",
            WhitelistJson = "[]",
            BlacklistJson = "[]",
            BlockAdult = true,
            BlockGambling = true,
            BlockPhishing = true,
            WarnSuspicious = true,
            UpdatedAt = DateTime.UtcNow
        };

        _db.UserSettings.Add(s);
        await _db.SaveChangesAsync();
        return s;
    }

    private static SettingsResponse ToResponse(UserSettings s)
    {
        List<string> whitelist = new();
        List<string> blacklist = new();

        try { whitelist = JsonSerializer.Deserialize<List<string>>(s.WhitelistJson) ?? new(); } catch { }
        try { blacklist = JsonSerializer.Deserialize<List<string>>(s.BlacklistJson) ?? new(); } catch { }

        return new SettingsResponse(
            s.ChildAge,
            s.Mode,
            whitelist,
            blacklist,
            s.BlockAdult,
            s.BlockGambling,
            s.BlockPhishing,
            s.WarnSuspicious
        );
    }

    // ===== Endpoints =====
    [HttpGet]
    public async Task<ActionResult<SettingsResponse>> Get()
    {
        var uid = UserId();
        var s = await GetOrCreate(uid);
        return Ok(ToResponse(s));
    }

    [HttpPut]
    public async Task<ActionResult<SettingsResponse>> Update([FromBody] UpdateSettingsRequest req)
    {
        var uid = UserId();
        var s = await GetOrCreate(uid);

        // normalize + validate
        var mode = (req.Mode ?? "Balanced").Trim();
        if (mode != "Strict" && mode != "Balanced" && mode != "Relaxed")
            mode = "Balanced";

        s.ChildAge = Math.Clamp(req.ChildAge, 1, 18);
        s.Mode = mode;

        // whitelist/blacklist clean
        var wl = CleanDomains(req.Whitelist ?? new());
        var bl = CleanDomains(req.Blacklist ?? new());

        s.WhitelistJson = JsonSerializer.Serialize(wl);
        s.BlacklistJson = JsonSerializer.Serialize(bl);

        // nếu muốn Mode auto-set toggles khi user chọn mode:
        // - bạn có thể override theo preset
        // - hoặc giữ các checkbox user chọn
        // Mình chọn: Mode preset chỉ set nếu user không gửi gì (nhưng FE luôn gửi).
        // => giữ checkbox theo req.
        s.BlockAdult = req.BlockAdult;
        s.BlockGambling = req.BlockGambling;
        s.BlockPhishing = req.BlockPhishing;
        s.WarnSuspicious = req.WarnSuspicious;

        // (Nếu muốn strict preset override checkbox, bật dòng này)
        // var preset = PresetByMode(mode);
        // s.BlockAdult = preset.blockAdult;
        // s.BlockGambling = preset.blockGambling;
        // s.BlockPhishing = preset.blockPhishing;
        // s.WarnSuspicious = preset.warnSuspicious;

        s.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(s));
    }
}