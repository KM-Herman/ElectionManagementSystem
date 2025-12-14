using ElectionAPI.Entities;
using ElectionAPI.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ElectionAPI.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user, List<string> permissions)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "5c2f3c9b8f2e4a1d7a6e0b9c4f8d3a7e6c5e9f1a4b2d8c7e0a9b6f3d2c1e8";
            var issuer = _configuration["Jwt:Issuer"] ?? "ElectionMGT";
            var audience = _configuration["Jwt:Audience"] ?? "ElectionMGTUsers";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("id", user.Id.ToString())
            };

            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permissions", permission));
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}