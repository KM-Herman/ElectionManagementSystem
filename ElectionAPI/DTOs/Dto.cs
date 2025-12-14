namespace ElectionAPI.DTOs
{
    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string Name, string Email, string Password);
    public record AuthResponse(string Token, string Error);
    public record VerifyOtpRequest(string Email, string Otp);
    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string Email, string Otp, string NewPassword);

    public record VoteRequest(int CandidateId, int PositionId);

    public record CandidateApplicationRequest(
        int PositionId,
        string Manifesto,
        string Degree,
        bool HasBeenInJail,
        string MaritalStatus,
        string NationalId
    );

    public record UpdateProfileRequest(string Name, string ProfileDetails);
    public record UpdateManifestoRequest(string Manifesto);

    public record CandidateStatsResponse(int Rank, int VoteCount);

    public record PositionDto(int Id, string Title, string Description);
    public record CandidateDto(int Id, string Name, string Manifesto, int VoteCount);
    public record DashboardResponse(List<PositionDto> Positions, Dictionary<int, List<CandidateDto>> CandidatesByPosition, List<int> UserVotedPositionIds);

    public record BroadcastRequest(string Message, string TargetGroup);
}
