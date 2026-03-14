using System.Security.Claims;
using Childsafenet.Api.Data;
using Childsafenet.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Childsafenet.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/assistant")]
public class AssistantController : ControllerBase
{
    private readonly AppDbContext _db;

    public AssistantController(AppDbContext db)
    {
        _db = db;
    }

    private Guid UserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AssistantChatResponse>> Chat(
        [FromBody] AssistantChatRequest req,
        CancellationToken ct)
    {
        var userId = UserId();
        var message = (req.Message ?? "").Trim();
        var url = (req.Url ?? "").Trim();
        var domain = GetDomain(url);

        if (string.IsNullOrWhiteSpace(message) && string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { message = "Message or Url is required." });
        }

        var settings = await _db.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);

        var relatedLogs = await _db.ScanLogs
            .AsNoTracking()
            .Where(x =>
                x.UserId == userId &&
                (!string.IsNullOrWhiteSpace(url)
                    ? x.Url == url || x.Url.Contains(domain)
                    : false))
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .ToListAsync(ct);

        var latestLog = relatedLogs.FirstOrDefault();

        var childAge = req.ChildAge
            ?? settings?.ChildAge
            ?? 10;

        var answer = BuildParentAssistantAnswer(
            message,
            url,
            domain,
            childAge,
            latestLog,
            settings
        );

        var context = new Dictionary<string, object>
        {
            ["url"] = url,
            ["domain"] = domain,
            ["childAge"] = childAge,
            ["latestAction"] = latestLog?.Action ?? "",
            ["latestLabel"] = latestLog?.Label ?? "",
            ["latestRiskLevel"] = latestLog?.RiskLevel ?? "",
            ["latestScore"] = latestLog?.Score ?? 0,
            ["logCount"] = relatedLogs.Count
        };

        return Ok(new AssistantChatResponse(
            Summary: answer.Summary,
            Blocks: new AssistantAnswerBlock(
                Conclusion: answer.Conclusion,
                Reasons: answer.Reasons,
                Recommendation: answer.Recommendation
            ),
            Context: context
        ));
    }

    private static string GetDomain(string? rawUrl)
    {
        if (string.IsNullOrWhiteSpace(rawUrl)) return "";

        try
        {
            var candidate = rawUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? rawUrl
                : $"http://{rawUrl}";

            var uri = new Uri(candidate);
            return uri.Host.Replace("www.", "", StringComparison.OrdinalIgnoreCase).ToLowerInvariant();
        }
        catch
        {
            return rawUrl
                .Replace("https://", "", StringComparison.OrdinalIgnoreCase)
                .Replace("http://", "", StringComparison.OrdinalIgnoreCase)
                .Split('/')[0]
                .Replace("www.", "", StringComparison.OrdinalIgnoreCase)
                .ToLowerInvariant();
        }
    }

    private static ParentAssistantAnswer BuildParentAssistantAnswer(
        string message,
        string url,
        string domain,
        int childAge,
        dynamic? latestLog,
        dynamic? settings)
    {
        var msg = (message ?? "").ToLowerInvariant();

        var latestAction = ((string?)latestLog?.Action ?? "").ToUpperInvariant();
        var latestLabel = ((string?)latestLog?.Label ?? "").ToLowerInvariant();
        var latestRisk = ((string?)latestLog?.RiskLevel ?? "").ToUpperInvariant();
        var latestScore = (double?)(latestLog?.Score) ?? 0;

        var blockAdult = (bool?)(settings?.BlockAdult) ?? true;
        var blockGambling = (bool?)(settings?.BlockGambling) ?? true;
        var blockPhishing = (bool?)(settings?.BlockPhishing) ?? true;
        var warnSuspicious = (bool?)(settings?.WarnSuspicious) ?? true;

        var reasons = new List<string>();

        bool isEducation =
            domain.Contains("edu") ||
            domain.Contains("school") ||
            domain.Contains("hutech") ||
            msg.Contains("trường") ||
            msg.Contains("giáo dục");

        bool isAdult =
            latestLabel.Contains("adult") ||
            latestLabel.Contains("porn") ||
            domain.Contains("xxx") ||
            domain.Contains("porn");

        bool isGambling =
            latestLabel.Contains("gambling") ||
            domain.Contains("bet") ||
            domain.Contains("casino");

        bool isPhishing =
            latestLabel.Contains("phishing") ||
            domain.Contains("login") ||
            domain.Contains("verify") ||
            domain.Contains("secure-account");

        bool askingWhyBlocked =
            msg.Contains("tại sao bị chặn") ||
            msg.Contains("vì sao bị chặn") ||
            msg.Contains("why blocked");

        bool askingShouldBlock =
            msg.Contains("nên block") ||
            msg.Contains("nên chặn") ||
            msg.Contains("should block") ||
            msg.Contains("block hay warn") ||
            msg.Contains("chặn hay cảnh báo");

        if (isEducation)
        {
            reasons.Add("Tên miền hoặc ngữ cảnh cho thấy website thuộc nhóm giáo dục.");
            reasons.Add("Không thấy tín hiệu mạnh cho nội dung độc hại trong dữ liệu hiện tại.");
            reasons.Add($"Với trẻ {childAge} tuổi, website giáo dục thường phù hợp hơn nếu dùng đúng mục đích.");

            return new ParentAssistantAnswer(
                Summary: "Website này có vẻ thuộc nhóm giáo dục và nhìn chung an toàn hơn cho trẻ.",
                Conclusion: "Có thể cho phép truy cập nếu mục đích là học tập.",
                Reasons: reasons,
                Recommendation: "Phụ huynh có thể allow website này, nhưng vẫn nên hướng dẫn trẻ chỉ truy cập các nội dung học tập cần thiết."
            );
        }

        if (askingWhyBlocked || latestAction == "BLOCK")
        {
            if (isAdult && blockAdult)
            {
                reasons.Add("Website có dấu hiệu liên quan đến nội dung người lớn.");
                reasons.Add("Nhóm nội dung này không phù hợp với trẻ em.");
                reasons.Add("Chính sách hiện tại của phụ huynh đang bật chặn nội dung người lớn.");

                return new ParentAssistantAnswer(
                    Summary: "Website này bị chặn vì có dấu hiệu nội dung người lớn và không phù hợp với trẻ.",
                    Conclusion: "Không nên cho trẻ truy cập website này.",
                    Reasons: reasons,
                    Recommendation: "Nên tiếp tục block website này và giải thích cho trẻ rằng đây là nội dung không phù hợp với lứa tuổi."
                );
            }

            if (isGambling && blockGambling)
            {
                reasons.Add("Website có dấu hiệu liên quan đến cờ bạc hoặc cá cược.");
                reasons.Add("Đây là nhóm nội dung rủi ro cao với trẻ em.");
                reasons.Add("Chính sách hiện tại của phụ huynh đang bật chặn cờ bạc.");

                return new ParentAssistantAnswer(
                    Summary: "Website này bị chặn vì có dấu hiệu cờ bạc hoặc cá cược.",
                    Conclusion: "Nên tiếp tục chặn website này.",
                    Reasons: reasons,
                    Recommendation: "Phụ huynh nên giữ block và đặt quy tắc rõ ràng với trẻ về các website betting hoặc casino."
                );
            }

            if (isPhishing && blockPhishing)
            {
                reasons.Add("Website có dấu hiệu giả mạo hoặc lừa đảo.");
                reasons.Add("Trẻ có thể bị dụ nhập thông tin cá nhân hoặc tài khoản.");
                reasons.Add("Chính sách hiện tại của phụ huynh đang bật chặn phishing.");

                return new ParentAssistantAnswer(
                    Summary: "Website này bị chặn vì có dấu hiệu giả mạo hoặc lừa đảo.",
                    Conclusion: "Đây là nhóm website nguy hiểm và nên tránh hoàn toàn.",
                    Reasons: reasons,
                    Recommendation: "Nên block website này và hướng dẫn trẻ không nhập mật khẩu hoặc thông tin cá nhân vào các website lạ."
                );
            }

            reasons.Add("Hệ thống đã đưa ra hành động BLOCK dựa trên phân tích rủi ro.");
            if (!string.IsNullOrWhiteSpace(latestLabel))
                reasons.Add($"AI label hiện tại là '{latestLabel}'.");
            if (!string.IsNullOrWhiteSpace(latestRisk))
                reasons.Add($"Mức rủi ro ghi nhận là '{latestRisk}'.");
            if (latestScore > 0)
                reasons.Add($"Điểm tin cậy hiện tại là {latestScore:0.0000}.");

            return new ParentAssistantAnswer(
                Summary: "Website này hiện đang bị hệ thống chặn do mức rủi ro cao hoặc không phù hợp với trẻ.",
                Conclusion: "Phụ huynh nên giữ trạng thái chặn cho đến khi xác minh rõ hơn.",
                Reasons: reasons,
                Recommendation: "Nếu phụ huynh tin rằng đây là website an toàn, hãy kiểm tra lại nội dung trang và chỉ allow khi chắc chắn."
            );
        }

        if (askingShouldBlock)
        {
            if (latestAction == "BLOCK")
            {
                reasons.Add("Hệ thống hiện đã đánh giá website ở mức nên chặn.");
                if (!string.IsNullOrWhiteSpace(latestLabel))
                    reasons.Add($"AI label hiện tại: {latestLabel}.");
                if (!string.IsNullOrWhiteSpace(latestRisk))
                    reasons.Add($"Risk level hiện tại: {latestRisk}.");

                return new ParentAssistantAnswer(
                    Summary: "Hệ thống nghiêng về phương án BLOCK cho website này.",
                    Conclusion: "Nên chặn website này nếu trẻ chưa đủ khả năng tự đánh giá rủi ro.",
                    Reasons: reasons,
                    Recommendation: "Giữ BLOCK nếu website có nội dung nguy hiểm, giả mạo, cờ bạc hoặc không phù hợp. Chỉ WARN hoặc ALLOW khi phụ huynh đã xác minh rõ."
                );
            }

            if (latestAction == "WARN" && warnSuspicious)
            {
                reasons.Add("Website hiện ở mức cảnh báo, chưa đủ cơ sở để kết luận an toàn tuyệt đối.");
                reasons.Add("Cảnh báo phù hợp khi phụ huynh muốn theo dõi thêm trước khi block.");
                reasons.Add($"Độ tuổi hiện tại của trẻ là {childAge}.");

                return new ParentAssistantAnswer(
                    Summary: "Website này phù hợp với hướng WARN hơn là ALLOW ngay lập tức.",
                    Conclusion: "Nên cảnh báo và theo dõi thêm.",
                    Reasons: reasons,
                    Recommendation: "Phụ huynh có thể dùng WARN trước. Nếu website tiếp tục có dấu hiệu rủi ro, hãy chuyển sang BLOCK."
                );
            }

            reasons.Add("Hiện chưa có tín hiệu quá mạnh để buộc phải block.");
            reasons.Add("Website có thể vẫn cần phụ huynh xem nội dung chính trước khi cho trẻ dùng.");
            reasons.Add($"Độ tuổi của trẻ là {childAge}, nên quyết định nên dựa thêm vào mức trưởng thành khi dùng Internet.");

            return new ParentAssistantAnswer(
                Summary: "Website này cần được xem xét thêm trước khi quyết định chặn hoàn toàn.",
                Conclusion: "Có thể WARN trước, chưa nhất thiết BLOCK ngay.",
                Reasons: reasons,
                Recommendation: "Nếu website phục vụ học tập hoặc giải trí lành mạnh thì có thể allow có giám sát. Nếu vẫn nghi ngờ, nên warn hoặc block tạm thời."
            );
        }

        reasons.Add("Trợ lý đang trả lời theo góc nhìn an toàn Internet cho trẻ em.");
        if (!string.IsNullOrWhiteSpace(url))
            reasons.Add($"Website đang được hỏi là {domain}.");
        if (!string.IsNullOrWhiteSpace(latestAction))
            reasons.Add($"Hành động gần nhất ghi nhận từ hệ thống là {latestAction}.");
        if (!string.IsNullOrWhiteSpace(latestLabel))
            reasons.Add($"AI label gần nhất là {latestLabel}.");

        return new ParentAssistantAnswer(
            Summary: "Website này cần được đánh giá thêm trong ngữ cảnh sử dụng của trẻ.",
            Conclusion: "Phụ huynh nên xem nội dung, độ tuổi và mục đích sử dụng trước khi quyết định.",
            Reasons: reasons,
            Recommendation: "Bạn có thể hỏi cụ thể hơn như: 'Tại sao website này bị chặn?', 'Trẻ 10 tuổi có nên truy cập không?', hoặc 'Tôi nên block hay warn website này?'."
        );
    }

    private record ParentAssistantAnswer(
        string Summary,
        string Conclusion,
        List<string> Reasons,
        string Recommendation
    );
}