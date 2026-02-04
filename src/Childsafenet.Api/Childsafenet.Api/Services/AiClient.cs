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
        var baseUrl = _cfg["AiService:BaseUrl"]!.TrimEnd('/');
        var endpoint = $"{baseUrl}/predict";

        var payload = new
        {
            url,
            title = title ?? "",
            text = text ?? "",
            child_age = childAge
        };

        var res = await _http.PostAsJsonAsync(endpoint, payload, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new Exception($"AI error {(int)res.StatusCode}: {raw}");

        var data = JsonSerializer.Deserialize<ScanResult>(
            raw,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        if (data is null) throw new Exception("AI returned invalid JSON");
        return data;
    }
}
