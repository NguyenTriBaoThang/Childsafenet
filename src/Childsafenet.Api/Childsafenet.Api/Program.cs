using System.Security.Claims;
using System.Text;
using Childsafenet.Api.Data;
using Childsafenet.Api.Models;
using Childsafenet.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"))
);

builder.Services.AddScoped<JwtService>();
builder.Services.AddHttpClient<AiClient>();

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),

            // ensure role claim mapping is ok
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

// Role-based authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
    options.AddPolicy("ParentOnly", p => p.RequireRole("parent", "admin"));
});

builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowAnyOrigin()
    );
});

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed admin user (demo)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var adminEmail = "admin@childsafenet.local";
    var hasAdmin = db.Users.Any(u => u.Email.ToLower() == adminEmail.ToLower());

    if (!hasAdmin)
    {
        var admin = new User
        {
            Email = adminEmail,
            FullName = "System Admin",
            Role = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345")
        };
        db.Users.Add(admin);

        db.UserSettings.Add(new UserSettings
        {
            UserId = admin.Id,
            ChildAge = 10,
            BlockAdult = true,
            BlockGambling = true,
            BlockPhishing = true,
            WhitelistJson = "[]",
            BlacklistJson = "[]"
        });

        db.SaveChanges();
    }
}

app.Run();
