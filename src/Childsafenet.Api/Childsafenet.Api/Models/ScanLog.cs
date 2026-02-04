using System.ComponentModel.DataAnnotations;

namespace Childsafenet.Api.Models;

public class ScanLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    [MaxLength(2048)]
    public string Url { get; set; } = default!;

    [MaxLength(512)]
    public string? Title { get; set; }

    [MaxLength(64)]
    public string Label { get; set; } = "";

    [MaxLength(16)]
    public string RiskLevel { get; set; } = "";

    public double Score { get; set; }

    [MaxLength(16)]
    public string Action { get; set; } = "WARN"; // ALLOW/WARN/BLOCK

    public string ExplanationJson { get; set; } = "[]";

    [MaxLength(16)]
    public string Source { get; set; } = "Web"; // Web/Extension

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
