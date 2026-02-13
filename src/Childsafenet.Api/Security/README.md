# Security Headers Middleware

Cách dùng trong `Program.cs`:

```csharp
using Childsafenet.Api.Security;

app.UseSecurityHeaders();
```

Nếu Swagger bị lỗi do CSP, hãy nới lỏng CSP cho môi trường dev.
