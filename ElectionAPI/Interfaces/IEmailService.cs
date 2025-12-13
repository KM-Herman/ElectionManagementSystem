namespace ElectionAPI.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toIndex, string subject, string body);
    }
}