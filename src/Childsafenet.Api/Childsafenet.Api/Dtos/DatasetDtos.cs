namespace Childsafenet.Api.Dtos;

public record DatasetItemDto(
    Guid Id, string Url, string Host,
    string PredictedLabel, double PredictedScore,
    string Status, string? FinalLabel,
    int SeenCount, DateTime LastSeenAt, string Source
);

public record ApproveDatasetRequest(Guid Id, string FinalLabel);
public record RejectDatasetRequest(Guid Id, string? Note);
public record FeedbackRequest(string Url, string FeedbackLabel, bool IsCorrect, string? Note);