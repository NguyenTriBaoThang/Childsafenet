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
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var email = req.Email.Trim().ToLower();

        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists) return BadRequest(new { message = "Email already exists" });

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName ?? "",
            Role = "parent"
        };

        _db.Users.Add(user);

        _db.UserSettings.Add(new UserSettings
        {
            UserId = user.Id,
            ChildAge = 10,
            BlockAdult = true,
            BlockGambling = true,
            BlockPhishing = true,
            WhitelistJson = "[]",
            BlacklistJson = "[]"
        });

        await _db.SaveChangesAsync();

        return Ok(new
        {
            token = _jwt.CreateToken(user),
            role = user.Role
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var email = req.Email.Trim().ToLower();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return Unauthorized(new { message = "Invalid credentials" });

        return Ok(new
        {
            token = _jwt.CreateToken(user),
            role = user.Role
        });
    }
}