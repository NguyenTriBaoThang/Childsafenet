using System.ComponentModel.DataAnnotations;

namespace Childsafenet.Api.Models;

public class ModelRegistry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(64)]
    public string ModelName { get; set; } = "childsafenet_pipeline";

    [MaxLength(64)]
    public string Version { get; set; } = "v1";

    [MaxLength(256)]
    public string ArtifactPathOrUrl { get; set; } = "";

    public bool IsActive { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(512)]
    public string? Notes { get; set; }
}