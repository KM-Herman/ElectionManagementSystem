using ElectionAPI.DTOs;
using ElectionAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ElectionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            if (!result.Success)
            {
                return Unauthorized(new { error = result.Error });
            }

            if (result.RequiresOtp)
            {
                return Ok(new { requiresOtp = true, message = result.Error });
            }

            return Ok(new AuthResponse(result.Token, string.Empty));
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
        {
            var result = await _authService.VerifyOtpAsync(request.Email, request.Otp);
            if (!result.Success)
            {
                return Unauthorized(new { error = result.Error });
            }
            return Ok(new AuthResponse(result.Token, string.Empty));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request.Name, request.Email, request.Password);
            if (!result.Success)
            {
                return BadRequest(new { error = result.Error });
            }
            return Ok("User registered successfully");
        }

        [HttpPost("refresh-token")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> RefreshToken()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var result = await _authService.RefreshTokenAsync(userId);
            
            if (!result.Success)
                return Unauthorized(new { error = result.Error });

            return Ok(new AuthResponse(result.Token, string.Empty));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var (success, error) = await _authService.ForgotPasswordAsync(request.Email);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Password reset OTP sent to email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var (success, error) = await _authService.ResetPasswordAsync(request.Email, request.Otp, request.NewPassword);
            if (!success) return BadRequest(new { error });
            return Ok(new { message = "Password reset successfully." });
        }
    }
}