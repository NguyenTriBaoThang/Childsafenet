using System.Net.Http.Json;
using System.Text.Json;
using Childsafenet.Api.Dtos;

namespace Childsafenet.Api.Services;

public class AiClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;

    public AiClient(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _cfg = cfg;
    }

    public async Task<ScanResult> PredictAsync(string url, string? title, string? text, int childAge, CancellationToken ct)
    {
        var baseUrl = _cfg["AiService:BaseUrl"] ?? "http://localhost:8000";
        baseUrl = baseUrl.TrimEnd('/');

        var endpoint = $"{baseUrl}/predict";

        var payload = new
        {
            url = url,
            title = title ?? "",
            text = text ?? "",
            child_age = childAge
        };

        using var res = await _http.PostAsJsonAsync(endpoint, payload, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new Exception($"AI error {(int)res.StatusCode}: {raw}");

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var result = JsonSerializer.Deserialize<ScanResult>(raw, options);

        if (result == null) throw new Exception("AI returned empty response");
        return result;
    }
}
