using System.Security.Claims;
using System.Text;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Childsafenet.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Controllers;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/dataset")]
public class DatasetController : ControllerBase
{
    private readonly AppDbContext _db;
    public DatasetController(AppDbContext db) => _db = db;

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("pending")]
    public async Task<ActionResult<List<DatasetItemDto>>> Pending([FromQuery] int take = 50, CancellationToken ct = default)
    {
        var items = await _db.UrlDatasets
            .Where(x => x.Status == "Pending")
            .OrderByDescending(x => x.LastSeenAt)
            .Take(Math.Clamp(take, 1, 200))
            .Select(x => new DatasetItemDto(
                x.Id, x.Url, x.Host, x.PredictedLabel, x.PredictedScore,
                x.Status, x.FinalLabel, x.SeenCount, x.LastSeenAt, x.Source
            ))
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost("approve")]
    public async Task<IActionResult> Approve([FromBody] ApproveDatasetRequest req, CancellationToken ct)
    {
        var uid = UserId();
        var item = await _db.UrlDatasets.FirstOrDefaultAsync(x => x.Id == req.Id, ct);
        if (item is null) return NotFound();

        item.FinalLabel = req.FinalLabel.Trim().ToLower();
        item.Status = "Verified";
        item.VerifiedByUserId = uid;
        item.VerifiedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }

    [HttpPost("reject")]
    public async Task<IActionResult> Reject([FromBody] RejectDatasetRequest req, CancellationToken ct)
    {
        var item = await _db.UrlDatasets.FirstOrDefaultAsync(x => x.Id == req.Id, ct);
        if (item is null) return NotFound();

        item.Status = "Rejected";
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export([FromQuery] int limit = 500000, CancellationToken ct = default)
    {
        var rows = await _db.UrlDatasets
            .Where(x => x.Status == "Verified" && x.FinalLabel != null)
            .OrderByDescending(x => x.VerifiedAt)
            .Take(Math.Clamp(limit, 1, 1_000_000))
            .Select(x => new { x.Url, Label = x.FinalLabel! })
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("url,label");
        foreach (var r in rows)
        {
            var url = r.Url.Replace("\"", "\"\"");
            var label = r.Label.Replace("\"", "\"\"");
            sb.AppendLine($"\"{url}\",\"{label}\"");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv; charset=utf-8", $"childsafenet_verified_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv");
    }
}