using BCrypt.Net;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Childsafenet.Api.Models;
using Childsafenet.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var email = req.Email.Trim().ToLower();

        if (await _db.Users.AnyAsync(x => x.Email == email))
            return BadRequest(new { message = "Email already exists" });

        var user = new User
        {
            Email = email,
            FullName = req.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        _db.UserSettings.Add(new UserSettings { UserId = user.Id });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registered" });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);

        if (user is null) return Unauthorized(new { message = "Invalid credentials" });

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return Unauthorized(new { message = "Invalid credentials" });

        var token = _jwt.Generate(user);
        return Ok(new AuthResponse(token));
    }
}
