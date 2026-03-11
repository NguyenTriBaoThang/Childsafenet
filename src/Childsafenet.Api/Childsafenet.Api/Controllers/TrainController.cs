using Childsafenet.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Childsafenet.Api.Controllers;

[Authorize(Roles = "admin")]
[ApiController]
[Route("api/train")]
public class TrainController : ControllerBase
{
    private readonly AppDbContext _db;

    public TrainController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("jobs")]
    public IActionResult GetJobs()
    {
        // For now, return an empty array until backend ML scheduling is fully built
        return Ok(new object[] { });
    }

    [HttpPost("trigger")]
    public IActionResult TriggerTrain()
    {
        // Return a mocked success response
        return Ok(new { jobId = "mock_train_job_" + DateTime.UtcNow.Ticks, status = "Queued" });
    }
}
