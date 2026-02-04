using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Childsafenet.Api.Models;

public class UserSettings
{
    [Key, ForeignKey(nameof(User))]
    public Guid UserId { get; set; }

    public int ChildAge { get; set; } = 10;

    [MaxLength(20)]
    public string Mode { get; set; } = "Balanced"; // Strict/Balanced/Relaxed

    public string WhitelistJson { get; set; } = "[]";
    public string BlacklistJson { get; set; } = "[]";

    public bool BlockAdult { get; set; } = true;
    public bool BlockGambling { get; set; } = true;
    public bool BlockPhishing { get; set; } = true;
    public bool WarnSuspicious { get; set; } = true;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
