namespace Childsafenet.Api.Dtos;

public record ScanRequest(string Url, string? Title, string? Text, string Source);

public record ScanResult(
    string RiskLevel,
    string Label,
    double Score,
    string Action,
    List<string> Explanation,
    Dictionary<string, object>? Meta
);
