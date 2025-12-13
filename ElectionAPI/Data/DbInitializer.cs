using ElectionAPI.Constant;
using ElectionAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectionAPI.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            var existingPerms = await context.Permissions.Select(p => p.Name).ToListAsync();
            var missingPerms = Permissions.All.Except(existingPerms).ToList();

            if (missingPerms.Any())
            {
                var newPerms = missingPerms.Select(p => new Permission { Name = p }).ToList();
                context.Permissions.AddRange(newPerms);
                await context.SaveChangesAsync();
            }

            if (!await context.Roles.AnyAsync())
            {
                var adminRole = new Role { Name = "Admin" };
                var voterRole = new Role { Name = "Voter" };

                context.Roles.AddRange(adminRole, voterRole);
                await context.SaveChangesAsync();

                var allPerms = await context.Permissions.ToListAsync();

                foreach (var p in allPerms)
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id });
                }

                var voterPerms = allPerms.Where(p =>
                    p.Name == Permissions.CanVote ||
                    p.Name == Permissions.CanViewDashboard ||
                    p.Name == Permissions.CanApplyForCandidacy
                ).ToList();

                foreach (var p in voterPerms)
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = voterRole.Id, PermissionId = p.Id });
                }

                await context.SaveChangesAsync();
            }

            var candidateRole = await context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Name == "Candidate");
            if (candidateRole == null)
            {
                candidateRole = new Role { Name = "Candidate" };
                context.Roles.Add(candidateRole);
                await context.SaveChangesAsync();
            }

            var allPermissions = await context.Permissions.ToListAsync();
            var candidatePerms = allPermissions.Where(p =>
                p.Name == Permissions.CanVote ||
                p.Name == Permissions.CanViewDashboard ||
                p.Name == Permissions.CanAccessCandidateDashboard
            ).ToList();

            foreach (var p in candidatePerms)
            {
                if (!context.RolePermissions.Any(rp => rp.RoleId == candidateRole.Id && rp.PermissionId == p.Id))
                {
                    context.RolePermissions.Add(new RolePermission { RoleId = candidateRole.Id, PermissionId = p.Id });
                }
            }
            await context.SaveChangesAsync();

            if (!await context.Users.AnyAsync(u => u.Email == "admin@yopmail.com"))
            {
                var adminUser = new User
                {
                    Name = "Admin User",
                    Email = "adminelect@yopmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();

                var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
                context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
                await context.SaveChangesAsync();
            }
        }
    }
}