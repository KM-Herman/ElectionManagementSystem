using ElectionAPI.Entities;

public interface IAuthService
    {
        Task<(bool Success, string Token, bool RequiresOtp, string Error)> LoginAsync(string email, string password);
        Task<(bool Success, User? User, string Error)> RegisterAsync(string name, string email, string password);
        Task<(bool Success, string Token, string Error)> RefreshTokenAsync(int userId);
        Task<(bool Success, string Token, string Error)> VerifyOtpAsync(string email, string otp);
    }