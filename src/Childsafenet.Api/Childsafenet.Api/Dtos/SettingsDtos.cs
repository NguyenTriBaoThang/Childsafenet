namespace Childsafenet.Api.Dtos;

public record SettingsResponse(
    int ChildAge,
    string Mode,
    string WhitelistJson,
    string BlacklistJson,
    bool BlockAdult,
    bool BlockGambling,
    bool BlockPhishing,
    bool WarnSuspicious
);

public record UpdateSettingsRequest(
    int ChildAge,
    string Mode,
    string WhitelistJson,
    string BlacklistJson,
    bool BlockAdult,
    bool BlockGambling,
    bool BlockPhishing,
    bool WarnSuspicious
);
