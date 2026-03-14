namespace Childsafenet.Api.Dtos;

public record AssistantChatRequest(
    string Message,
    string? Url,
    int? ChildAge
);

public record AssistantAnswerBlock(
    string? Conclusion,
    List<string>? Reasons,
    string? Recommendation
);

public record AssistantChatResponse(
    string Summary,
    AssistantAnswerBlock Blocks,
    Dictionary<string, object>? Context
);