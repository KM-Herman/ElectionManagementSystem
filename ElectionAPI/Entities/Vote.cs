namespace ElectionAPI.Entities
{
    public class Vote
    {
        public int Id { get; set; }
        public int VoterUserId { get; set; }
        public int CandidateId { get; set; }
        public int PositionId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public virtual User? VoterUser { get; set; }
        public virtual Candidate? Candidate { get; set; }
        public virtual Position? Position { get; set; }
    }
}
