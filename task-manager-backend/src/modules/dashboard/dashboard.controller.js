import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. Workspaces the user is a member of
        const workspaceCount = await prisma.workspace.count({
            where: {
                members: {
                    some: { userId },
                },
            },
        });

        // 2. Projects in those workspaces (accessible projects)
        const projectCount = await prisma.project.count({
            where: {
                workspace: {
                    members: {
                        some: { userId },
                    },
                },
            },
        });

        // 3. Pending tasks assigned to user (todo or in_progress)
        const pendingTaskCount = await prisma.task.count({
            where: {
                assignedTo: userId,
                status: { in: ["todo", "in_progress"] },
            },
        });

        // 4. Completed tasks assigned to user
        const completedTaskCount = await prisma.task.count({
            where: {
                assignedTo: userId,
                status: "done",
            },
        });

        res.json({
            workspaces: workspaceCount,
            projects: projectCount,
            pendingTasks: pendingTaskCount,
            completedTasks: completedTaskCount
        });
    } catch (error) {
        next(error);
    }
};
