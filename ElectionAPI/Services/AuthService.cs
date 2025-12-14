using ElectionAPI.Data;
using ElectionAPI.Entities;
using ElectionAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ElectionAPI.Services
{
    public class AuthService(AppDbContext context, ITokenService tokenService, IEmailService emailService) : IAuthService
    {
        private readonly AppDbContext _context = context;
        private readonly ITokenService _tokenService = tokenService;
        private readonly IEmailService _emailService = emailService;

        public async Task<(bool Success, string Token, bool RequiresOtp, string Error)> LoginAsync(string email, string password)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return (false, string.Empty, false, "Invalid credentials");
            }

            if (!user.IsActive)
                return (false, string.Empty, false, "Account is inactive");

            // Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            // Send Email
            await _emailService.SendEmailAsync(user.Email, "Login OTP", $"Your OTP Code is: {otp}");

            return (true, string.Empty, true, "OTP sent to email");
        }

        public async Task<(bool Success, string Token, string Error)> VerifyOtpAsync(string email, string otp)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return (false, string.Empty, "User not found");

            if (user.OtpCode != otp || user.OtpExpiry < DateTime.UtcNow)
                return (false, string.Empty, "Invalid or Expired OTP");

            // Clear OTP
            user.OtpCode = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();

            // Generate Token
            var permissions = user.UserRoles
                .SelectMany(ur => ur.Role!.RolePermissions)
                .Select(rp => rp.Permission!.Name)
                .Distinct()
                .ToList();

            var token = _tokenService.GenerateToken(user, permissions);
            return (true, token, string.Empty);
        }

        public async Task<(bool Success, User? User, string Error)> RegisterAsync(string name, string email, string password)
        {
            if (await _context.Users.AnyAsync(u => u.Email == email))
            {
                return (false, null, "Email already exists");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = passwordHash,
                IsActive = true,
                ProfileDetails = string.Empty
            };

            _context.Users.Add(user);

            // Assign default "Voter" role if exists, logic can be added here.
            // Assuming we have a "Voter" role seeded with Id 2 or Name "Voter".
            // Implementation: Find role by name "Voter", add to UserRoles.
            var voterRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Voter");
            if (voterRole != null)
            {
                user.UserRoles.Add(new UserRole { Role = voterRole });
            }

            await _context.SaveChangesAsync();

            return (true, user, string.Empty);
        }

        public async Task<(bool Success, string Token, string Error)> RefreshTokenAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.IsActive)
                return (false, string.Empty, "User not found or inactive");

            // Aggregate fresh permissions
            var permissions = user.UserRoles
                .SelectMany(ur => ur.Role!.RolePermissions)
                .Select(rp => rp.Permission!.Name)
                .Distinct()
                .ToList();

            var token = _tokenService.GenerateToken(user, permissions);

            return (true, token, string.Empty);
        }

        public async Task<(bool Success, string Error)> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return (false, "User not found");

            // Generate OTP
            var otp = new Random().Next(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiry = DateTime.UtcNow.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Send Email
            await _emailService.SendEmailAsync(user.Email, "Reset Password OTP", $"Your OTP for password reset is: {otp}");

            return (true, string.Empty);
        }

        public async Task<(bool Success, string Error)> ResetPasswordAsync(string email, string otp, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return (false, "User not found");

            if (user.OtpCode != otp || user.OtpExpiry < DateTime.UtcNow)
                return (false, "Invalid or Expired OTP");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.OtpCode = null;
            user.OtpExpiry = null;
            
            await _context.SaveChangesAsync();
            return (true, string.Empty);
        }
    }
}