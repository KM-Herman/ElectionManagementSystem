using ElectionAPI.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace ElectionAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _config;

        public EmailService(ILogger<EmailService> logger, IConfiguration config)
        {
            _logger = logger;
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var emailSettings = _config.GetSection("EmailSettings");
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(emailSettings["SenderName"], emailSettings["SenderEmail"]));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                message.Body = new TextPart("plain")
                {
                    Text = body
                };

                using var client = new SmtpClient();
                // Accept all SSL certificates (for development)
                client.ServerCertificateValidationCallback = (s, c, h, e) => true; 
                
                await client.ConnectAsync(emailSettings["SmtpServer"], int.Parse(emailSettings["SmtpPort"]!), false);
                
                // Note: Authenticate only if password is provided
                var pass = emailSettings["Password"];
                if (!string.IsNullOrEmpty(pass))
                {
                    await client.AuthenticateAsync(emailSettings["SenderEmail"], pass.Replace(" ", ""));
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation($"Email sent to {to}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email");
                _logger.LogWarning($"[Fallback Mock] To: {to} | Code: {body}");
            }
        }
    }
}