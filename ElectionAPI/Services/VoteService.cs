using ElectionAPI.Data;
using ElectionAPI.Entities;
using ElectionAPI.Hubs;
using ElectionAPI.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ElectionAPI.Services
{
    public class VoteService : IVoteService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<ElectionHub> _hubContext;
        private readonly IEmailService _emailService;

        public VoteService(AppDbContext context, IHubContext<ElectionHub> hubContext, IEmailService emailService)
        {
            _context = context;
            _hubContext = hubContext;
            _emailService = emailService;
        }

        public async Task<(bool Success, string Error)> CastVoteAsync(int voterId, int candidateId, int positionId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // 1. Transactional check: Duplicate Vote
                    bool alreadyVoted = await _context.Votes.AnyAsync(v => v.VoterUserId == voterId && v.PositionId == positionId);
                    if (alreadyVoted)
                    {
                        return (false, "User has already voted for this position.");
                    }

                    // 2. Validate Candidate
                    var candidate = await _context.Candidates
                        .Include(c => c.User)
                        .FirstOrDefaultAsync(c => c.Id == candidateId);

                    if (candidate == null)
                    {
                        return (false, "Candidate not found.");
                    }
                    if (candidate.PositionId != positionId)
                    {
                        return (false, "Candidate does not belong to this position.");
                    }

                    // 3. Create Vote and Update Count
                    var vote = new Vote
                    {
                        VoterUserId = voterId,
                        CandidateId = candidateId,
                        PositionId = positionId,
                        Timestamp = DateTime.UtcNow
                    };

                    _context.Votes.Add(vote);
                    candidate.VoteCount++;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // 4. SignalR Broadcast
                    // Broadcast updated counts. For simplicity, we send: CandidateId, NewCount.
                    await _hubContext.Clients.All.SendAsync("ReceiveVoteUpdate", candidateId, candidate.VoteCount);

                    // 5. Campaign Motivation Trigger
                    // Need to check if this specific vote crossed the threshold.
                    // Threshold > 5, so when VoteCount becomes 6.
                    if (candidate.VoteCount == 6) // Strictly checking transition from 5 to 6
                    {
                        var email = candidate.User?.Email ?? "unknown@example.com";
                        await _emailService.SendEmailAsync(
                            email,
                            "Campaign Motivation",
                            $"Congratulations {candidate.User?.Name}, you have crossed 5 votes! Keep pushing!"
                        );
                    }

                    // Optional: Audit Log
                    _context.AuditLogs.Add(new AuditLog
                    {
                        Action = "Vote Cast",
                        Details = $"User {voterId} voted for Candidate {candidateId} in Position {positionId}",
                        Timestamp = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();

                    return (true, string.Empty);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, $"Error casting vote: {ex.Message}");
                }
            });
        }
    }
}