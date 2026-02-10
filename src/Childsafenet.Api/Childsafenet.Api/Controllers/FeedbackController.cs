using System.Security.Claims;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Childsafenet.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Childsafenet.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/feedback")]
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _db;
    public FeedbackController(AppDbContext db) => _db = db;

    private Guid UserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FeedbackRequest req, CancellationToken ct)
    {
        var uid = UserId();
        _db.UrlFeedbacks.Add(new UrlFeedback
        {
            UserId = uid,
            Url = req.Url.Trim(),
            FeedbackLabel = req.FeedbackLabel.Trim().ToLower(),
            IsCorrect = req.IsCorrect,
            Note = req.Note
        });

        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }
}