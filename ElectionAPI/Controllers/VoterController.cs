using ElectionAPI.Constant;
using ElectionAPI.Data;
using ElectionAPI.DTOs;
using ElectionAPI.Enum;
using ElectionAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElectionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VoterController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IVoteService _voteService;

        public VoterController(AppDbContext context, IVoteService voteService)
        {
            _context = context;
            _voteService = voteService;
        }

        private int GetUserId() => int.Parse(User.FindFirst("id")?.Value ?? "0");

        [HttpGet("dashboard")]
        [Authorize(Policy = Permissions.CanViewDashboard)]
        public async Task<IActionResult> GetDashboard()
        {
            var positions = await _context.Positions.Where(p => p.IsActive).ToListAsync();
            var candidates = await _context.Candidates
                .Include(c => c.User)
                .Where(c => c.Status == CandidateStatus.Approved)
                .ToListAsync();

            var posDtos = positions.Select(p => new PositionDto(p.Id, p.Title, p.Description)).ToList();
            var candDic = candidates.GroupBy(c => c.PositionId)
                .ToDictionary(g => g.Key, g => g.Select(c => new CandidateDto(c.Id, c.User?.Name ?? "Unknown", c.Manifesto, c.VoteCount)).ToList());

            var userId = GetUserId();
            var userVotedPositionIds = await _context.Votes
                .Where(v => v.VoterUserId == userId)
                .Select(v => v.PositionId)
                .ToListAsync();

            return Ok(new DashboardResponse(posDtos, candDic, userVotedPositionIds));
        }

        [HttpPost("vote")]
        [Authorize(Policy = Permissions.CanVote)]
        public async Task<IActionResult> Vote(VoteRequest request)
        {
            var userId = GetUserId();
            var result = await _voteService.CastVoteAsync(userId, request.CandidateId, request.PositionId);

            if (!result.Success)
            {
                return BadRequest(result.Error);
            }
            return Ok("Vote cast successfully.");
        }

        [HttpGet("trends")]
        public async Task<IActionResult> GetTrends()
        {
            var candidates = await _context.Candidates
                .Include(c => c.User)
                .Where(c => c.Status == CandidateStatus.Approved)
                .OrderByDescending(c => c.VoteCount)
                .Take(10) // Top 10
                .Select(c => new 
                { 
                    Id = c.Id, 
                    Name = c.User != null ? c.User.Name : "Unknown", 
                    Votes = c.VoteCount 
                })
                .ToListAsync();

            return Ok(candidates);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var notifs = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.DateSent)
                .ToListAsync();
            return Ok(notifs);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.Name = request.Name;
            user.ProfileDetails = request.ProfileDetails;
            
            await _context.SaveChangesAsync();
            return Ok("Profile updated successfully");
        }
    }
}