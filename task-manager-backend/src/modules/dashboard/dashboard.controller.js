import { Workspace, Project, Task } from "../../models/index.js";
import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";

export const dashboardController = {
    // -------------------------------------------------------------
    // GET /dashboard/stats?workspaceId=...
    // -------------------------------------------------------------
    async getStats(req, res, next) {
        try {
            const userId = req.user.id;
            // Default to first workspace if not provided? 
            // Actually usually dashboard is workspace specific or global. 
            // The current implementation seems to require workspaceId or maybe it aggregates?
            // Let's check previous implementation logic from grep: "workspace.count", "project.count".
            // It seems to return counts.

            // If workspaceId is provided, scoped to that.
            // If not, maybe global? 
            // Let's assume global for the user for now if workspaceId is missing, OR restrict it.

            // But wait, the previous code was:
            // const workspaceCount = await prisma.workspace.count(...)

            // Let's rebuild it.

            // Global stats for user:
            // 1. Workspaces count (owned or member)
            // 2. Projects count (in those workspaces? or created by user?)
            // 3. Tasks assigned to user

            const workspaceCount = await Workspace.count({
                include: [{
                    model: Workspace, // helper to join? No.
                    association: 'members', // uses alias defined in index.js? index.js says Workspace.hasMany(WorkspaceMember, as: 'members')
                }],
                // This count is tricky with associations in Sequelize.
                // Simpler: Count User's workspaces via User accessor or WorkspaceMember.
            });

            // Let's use simpler queries.

            // 1. Workspaces user is member of
            // See workspace.service listUserWorkspaces logic.
            const workspaces = await Workspace.findAll({
                include: [{
                    association: 'members',
                    where: { user_id: userId },
                    required: true
                }]
            });
            const wsCount = workspaces.length;

            // 2. Projects in those workspaces
            const wsIds = workspaces.map(w => w.id);
            const projectCount = await Project.count({
                where: { workspace_id: wsIds }
            });

            // 3. Tasks assigned to user (across all workspaces)
            const tasksAssignedCount = await Task.count({
                where: { assigned_to: userId }
            });

            // 5. Recent Activity (across user's workspaces)
            // We already have `wsIds` from step 2 (list of workspaces user is in)

            // We need to import ActivityLog and User models at the top (User is likely already imported or needed)
            const { ActivityLog, User, Project, Task, Workspace } = await import("../../models/index.js");
            // Better to import at top level, but for now I will fix imports in a separate edit or use what is available.
            // Wait, models are imported at line 1. Let's ensure ActivityLog is there.

            const recentActivity = await ActivityLog.findAll({
                where: { workspace_id: wsIds },
                limit: 10,
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'profile_image'] // Confirm profile_image/profileImage field.
                    },
                    {
                        model: Project,
                        as: 'project',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Task,
                        as: 'task',
                        attributes: ['id', 'title']
                    },
                    {
                        model: Workspace,
                        as: 'workspace',
                        attributes: ['id', 'name']
                    }
                ]
            });

            res.json({
                success: true,
                data: {
                    workspaces: wsCount,
                    projects: projectCount,
                    tasks: {
                        total: tasksAssignedCount,
                        pending: tasksPendingCount,
                        completed: tasksCompletedCount
                    },
                    activities: recentActivity
                },
            });
        } catch (err) {
            next(err);
        }
    },
};
