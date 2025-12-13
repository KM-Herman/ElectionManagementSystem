using ElectionAPI.Entities;

namespace ElectionAPI.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user, List<string> permissions);
    }
}