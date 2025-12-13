namespace ElectionAPI.Constant
{
    public class Permissions
    {
        public const string CanVote = "Permissions.CanVote";
        public const string CanCreatePosition = "Permissions.CanCreatePosition";
        public const string CanApplyForCandidacy = "Permissions.CanApplyForCandidacy";
        public const string CanApproveCandidate = "Permissions.CanApproveCandidate";
        public const string CanViewDashboard = "Permissions.CanViewDashboard";
        public const string CanViewAdminStats = "Permissions.CanViewAdminStats";
        public const string CanAccessCandidateDashboard = "Permissions.CanAccessCandidateDashboard";

        public static List<string> All = new List<string>
        {
            CanVote,
            CanCreatePosition,
            CanApplyForCandidacy,
            CanApproveCandidate,
            CanViewDashboard,
            CanViewAdminStats,
            CanAccessCandidateDashboard
        };
    }
}
