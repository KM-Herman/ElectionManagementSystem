using Microsoft.AspNetCore.Routing.Matching;

namespace ElectionAPI.Entities
{
    public class Candidate
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PositionId { get; set; }
        public string Manifesto { get; set; } = string.Empty;
        public CandidateStatus Status { get; set; } = CandidateStatus.Pending;
        public int VoteCount { get; set; } = 0;

        // New Profile Fields
        public string Degree { get; set; } = string.Empty;
        public bool HasBeenInJail { get; set; } = false;
        public string MaritalStatus { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;

        public virtual User? User { get; set; }
        public virtual Position? Position { get; set; }
    }
}
