using System.ComponentModel.DataAnnotations;

namespace Childsafenet.Api.Dtos;

public record SettingsResponse(
    int ChildAge,
    string Mode,
    List<string> Whitelist,
    List<string> Blacklist,
    bool BlockAdult,
    bool BlockGambling,
    bool BlockPhishing,
    bool WarnSuspicious
);

public class UpdateSettingsRequest
{
    [Range(1, 18)]
    public int ChildAge { get; set; } = 10;

    [Required]
    [MaxLength(20)]
    public string Mode { get; set; } = "Balanced"; // Strict/Balanced/Relaxed

    public List<string> Whitelist { get; set; } = new();
    public List<string> Blacklist { get; set; } = new();

    public bool BlockAdult { get; set; } = true;
    public bool BlockGambling { get; set; } = true;
    public bool BlockPhishing { get; set; } = true;
    public bool WarnSuspicious { get; set; } = true;
}