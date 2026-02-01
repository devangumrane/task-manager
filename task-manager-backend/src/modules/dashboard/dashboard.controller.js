import prisma from "../../core/database/prisma.js";
import ApiError from "../../core/errors/ApiError.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // 1. Projects user is a member of
        const projectCount = await prisma.project.count({
            where: {
                members: {
                    some: { userId },
                },
            },
        });

        // 2. Pending tasks (assigned to user)
        const pendingTaskCount = await prisma.task.count({
            where: {
                assigneeId: userId,
                status: { in: ["TODO", "IN_PROGRESS"] },
            },
        });

        // 3. Completed tasks (assigned to user)
        const completedTaskCount = await prisma.task.count({
            where: {
                assigneeId: userId,
                status: "DONE",
            },
        });

        res.json({
            projects: projectCount,
            pendingTasks: pendingTaskCount,
            completedTasks: completedTaskCount
        });
    } catch (error) {
        next(error);
    }
};
