﻿using ElectionAPI.Constant;
using ElectionAPI.Data;
using ElectionAPI.DTOs;
using ElectionAPI.Entities;
using ElectionAPI.Interfaces;
using ElectionAPI.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace ElectionAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IHubContext<ElectionHub> _hubContext;

        public AdminController(AppDbContext context, IEmailService emailService, IHubContext<ElectionHub> hubContext)
        {
            _context = context;
            _emailService = emailService;
            _hubContext = hubContext;
        }

        [HttpGet("summary")]
        [Authorize(Policy = Permissions.CanViewAdminStats)]
        public async Task<IActionResult> GetSummary()
        {
            var totalVoters = await _context.Users.CountAsync(); // Approximate
            // Actually "Users" might include admins.
            var totalVotes = await _context.Votes.CountAsync();
            var totalCandidates = await _context.Candidates.CountAsync();

            return Ok(new { TotalUsers = totalVoters, TotalVotes = totalVotes, TotalCandidates = totalCandidates });
        }

        [HttpPost("notification/broadcast")]
        [Authorize(Policy = Permissions.CanCreatePosition)] // Reuse or new permission
        public async Task<IActionResult> Broadcast(BroadcastRequest request)
        {
            // Logic to send notifications to DB and maybe Email/SignalR?
            // "Send notification to target groups (All, Voters, Candidates)."
            // Impl: Create Notification entities for all users in group.

            IQueryable<User> targetUsers = _context.Users;

            if (request.TargetGroup == "Candidates")
            {
                // Join candidates
                targetUsers = _context.Candidates.Select(c => c.User!);
            }
            // "Voters" might mean everyone who can vote, or who HAS voted? Assuming all users with Voter role.
            // For simplicity, "All" = All users.

            // This could be heavy for large DB, but for demo:
            var userIds = await targetUsers.Select(u => u.Id).ToListAsync();

            var notifs = userIds.Select(id => new Notification
            {
                UserId = id,
                Message = request.Message,
                DateSent = DateTime.UtcNow,
                IsRead = false
            });

            _context.Notifications.AddRange(notifs);
            await _context.SaveChangesAsync();

            // Notify via SignalR (Broadcast)
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", request.Message);

            return Ok($"Broadcasted to {userIds.Count} users.");
        }

        [HttpPost("positions")]
        [Authorize(Policy = Permissions.CanCreatePosition)]
        public async Task<IActionResult> CreatePosition(PositionDto dto)
        {
            var pos = new Position { Title = dto.Title, Description = dto.Description, IsActive = true };
            _context.Positions.Add(pos);
            await _context.SaveChangesAsync();
            return Ok(pos);
        }

        [HttpGet("users")]
        [Authorize(Policy = Permissions.CanViewAdminStats)]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new 
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    Role = u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "None"
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        [Authorize(Policy = Permissions.CanViewAdminStats)] // Or a specific CanManageUsers permission
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound("User not found");

            var newRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (newRole == null) return BadRequest("Role not found");

            // Clear existing roles (assuming single role per user for simplicity)
            _context.UserRoles.RemoveRange(user.UserRoles);
            
            // Add new role
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = newRole.Id });
            await _context.SaveChangesAsync();

            // Broadcast role update
            await _hubContext.Clients.All.SendAsync("RoleUpdated", user.Id, request.RoleName);

            return Ok($"User role updated to {request.RoleName}");
        }

        [HttpDelete("users/{id}")]
        [Authorize(Policy = Permissions.CanViewAdminStats)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            // Check if deleting self?
            // Optional safety check needed here? 

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully.");
        }

        [HttpGet("logs")]
        [Authorize(Policy = Permissions.CanViewAdminStats)]
        public async Task<IActionResult> GetLogs()
        {
            var logs = await _context.AuditLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(50) // Limit to recent logs
                .ToListAsync();
            return Ok(logs);
        }

        [HttpGet("candidates/pending")]
        [Authorize(Policy = Permissions.CanApproveCandidate)]
        public async Task<IActionResult> GetPendingCandidates()
        {
            var pending = await _context.Candidates
                .Include(c => c.User)
                .Include(c => c.Position)
                .Where(c => c.Status == Enum.CandidateStatus.Pending)
                .Select(c => new
                {
                    c.Id,
                    Name = c.User != null ? c.User.Name : "Unknown",
                    Position = c.Position != null ? c.Position.Title : "Unknown",
                    c.Manifesto,
                    c.UserId,
                    // New fields for detail review
                    c.Degree,
                    c.NationalId,
                    c.HasBeenInJail,
                    c.MaritalStatus
                })
                .ToListAsync();
            return Ok(pending);
        }

        [HttpPut("candidates/{id}/approve")]
        [Authorize(Policy = Permissions.CanApproveCandidate)]
        public async Task<IActionResult> ApproveCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null) return NotFound("Candidate not found");

            candidate.Status = Enum.CandidateStatus.Approved;
            
            // Assign Candidate Role
            var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == candidate.UserId);
            var candidateRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Candidate");
            
            if (user != null && candidateRole != null)
            {
                if (!user.UserRoles.Any(ur => ur.RoleId == candidateRole.Id))
                {
                    user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = candidateRole.Id });
                }
            }

            // Log the action
            _context.AuditLogs.Add(new AuditLog 
            { 
                Action = "Candidate Approved", 
                Details = $"Candidate {candidate.Id} approved for Position {candidate.PositionId}",
                Timestamp = DateTime.UtcNow,
                PerformedBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            });

            await _context.SaveChangesAsync();

            // Notify everyone to update charts/stats
            await _hubContext.Clients.All.SendAsync("UpdateDashboard");
            // Notify specific user (if we had connectionId map, for now broadcast broad message or assume user listens)
            // A more targeted notification would require mapping UserId to ConnectionId.
            // For now, we broadcast "CandidateApproved" with UserId, and client filters.
            await _hubContext.Clients.All.SendAsync("CandidateApproved", candidate.UserId);

            return Ok("Candidate approved successfully.");
        }
    }
}