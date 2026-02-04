using System.Security.Claims;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
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

    [HttpGet]
    public async Task<ActionResult<SettingsResponse>> Get()
    {
        var uid = UserId();
        var s = await _db.UserSettings.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == uid);
        if (s is null) return NotFound();

        return Ok(new SettingsResponse(
            s.ChildAge, s.Mode, s.WhitelistJson, s.BlacklistJson,
            s.BlockAdult, s.BlockGambling, s.BlockPhishing, s.WarnSuspicious
        ));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateSettingsRequest req)
    {
        var uid = UserId();
        var s = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserId == uid);
        if (s is null) return NotFound();

        s.ChildAge = req.ChildAge;
        s.Mode = req.Mode;
        s.WhitelistJson = string.IsNullOrWhiteSpace(req.WhitelistJson) ? "[]" : req.WhitelistJson;
        s.BlacklistJson = string.IsNullOrWhiteSpace(req.BlacklistJson) ? "[]" : req.BlacklistJson;
        s.BlockAdult = req.BlockAdult;
        s.BlockGambling = req.BlockGambling;
        s.BlockPhishing = req.BlockPhishing;
        s.WarnSuspicious = req.WarnSuspicious;
        s.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Updated" });
    }
}
