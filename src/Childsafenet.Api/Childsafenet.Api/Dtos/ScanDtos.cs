using System.Text.Json.Serialization;

namespace Childsafenet.Api.Dtos;

public record ScanRequest(
    [property: JsonPropertyName("url")] string Url,
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("text")] string? Text,
    [property: JsonPropertyName("source")] string Source
);

public record ScanResult(
    [property: JsonPropertyName("risk_level")] string RiskLevel,
    [property: JsonPropertyName("label")] string Label,
    [property: JsonPropertyName("score")] double Score,
    [property: JsonPropertyName("action")] string Action,
    [property: JsonPropertyName("explanation")] List<string> Explanation,
    [property: JsonPropertyName("meta")] Dictionary<string, object>? Meta
);
