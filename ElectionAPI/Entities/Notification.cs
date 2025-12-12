namespace ElectionAPI.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime DateSent { get; set; } = DateTime.UtcNow;

        public virtual User? User { get; set; }
    }
}
