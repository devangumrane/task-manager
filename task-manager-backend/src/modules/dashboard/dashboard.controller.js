import { Workspace, Project, Task, ActivityLog, User, UserSkill, TimeEntry } from "../../models/index.js";
import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";

export const dashboardController = {
    async getStats(req, res, next) {
        try {
            const userId = req.user.id;

            // 1. Get workspaces user is a member of
            // Use the User model association to fetch workspaces
            const user = await User.findByPk(userId, {
                include: [{
                    model: Workspace,
                    as: 'workspaces',
                    through: { attributes: [] } // explicit through table attributes if needed
                }]
            });

            const workspaces = user ? user.workspaces : [];
            const wsCount = workspaces.length;
            const wsIds = workspaces.map(w => w.id);

            // 2. Count projects in those workspaces
            const projectCount = wsIds.length > 0 ? await Project.count({
                where: { workspace_id: wsIds }
            }) : 0;

            // 3. Task counts (assigned to user)
            const tasksAssignedCount = await Task.count({
                where: { assigned_to: userId }
            });

            const tasksPendingCount = await Task.count({
                where: {
                    assigned_to: userId,
                    status: ['todo', 'in_progress'] // Corrected status enums
                }
            });

            const tasksCompletedCount = await Task.count({
                where: {
                    assigned_to: userId,
                    status: 'done' // Corrected status enums
                }
            });

            // 4. Recent Activity
            // Ensure we have correct aliases and fields
            let recentActivity = [];
            if (wsIds.length > 0) {
                recentActivity = await ActivityLog.findAll({
                    where: { workspace_id: wsIds },
                    limit: 10,
                    order: [["createdAt", "DESC"]],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'email', 'profile_image'] // Changed 'name' to 'username'
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
            }

            // 5. Skills & Focus
            const skillsCount = await UserSkill.count({
                where: { user_id: userId }
            });

            const totalDurationMinutes = await TimeEntry.sum('duration', {
                where: { user_id: userId }
            });
            const focusHours = totalDurationMinutes ? (totalDurationMinutes / 60).toFixed(1) : 0;

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
                    skills: skillsCount,
                    focusHours: focusHours,
                    activities: recentActivity
                },
            });
        } catch (err) {
            console.error("Dashboard Stats Error:", err); // Added logging
            next(err);
        }
    },
};
