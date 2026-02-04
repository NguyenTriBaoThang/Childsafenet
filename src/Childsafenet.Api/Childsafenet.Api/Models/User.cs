using System.ComponentModel.DataAnnotations;

namespace Childsafenet.Api.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(256)]
    public string Email { get; set; } = default!;

    [Required, MaxLength(512)]
    public string PasswordHash { get; set; } = default!;

    [MaxLength(200)]
    public string FullName { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserSettings? Settings { get; set; }
}
