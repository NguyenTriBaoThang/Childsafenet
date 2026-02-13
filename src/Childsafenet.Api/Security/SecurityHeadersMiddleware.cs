using Microsoft.AspNetCore.Http;

namespace Childsafenet.Api.Security;

public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext ctx)
    {
        // Basic security headers for demo/prod hardening
        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Response.Headers["X-Frame-Options"] = "DENY";
        ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        ctx.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";

        // CSP (tune if you host Swagger/UI)
        // For dev Swagger: you may need to relax script-src. Keep simple for now.
        if (!ctx.Response.Headers.ContainsKey("Content-Security-Policy"))
        {
            ctx.Response.Headers["Content-Security-Policy"] =
                "default-src 'self'; " +
                "img-src 'self' data:; " +
                "style-src 'self' 'unsafe-inline'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "connect-src 'self' https: http:; " +
                "frame-ancestors 'none';";
        }

        await _next(ctx);
    }
}

public static class SecurityHeadersExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        => app.UseMiddleware<SecurityHeadersMiddleware>();
}
