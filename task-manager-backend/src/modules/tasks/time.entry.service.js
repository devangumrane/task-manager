import { TimeEntry, Task } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import sequelize from "../../config/database.js";
import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";

export const timeTrackingService = {
    // --------------------------------------------------------
    // START TIMER
    // --------------------------------------------------------
    async startTimer(userId, taskId) {
        const t = await sequelize.transaction();
        try {
            // 1. Validation
            const task = await Task.findByPk(taskId, {
                include: 'project'
            });
            if (!task) throw new ApiError("TASK_NOT_FOUND", "Task not found", 404);

            await assertWorkspaceMember(t, userId, task.project.workspace_id);

            // 2. Check if already running
            const activeEntry = await TimeEntry.findOne({
                where: {
                    user_id: userId,
                    end_time: null
                },
                transaction: t
            });

            if (activeEntry) {
                // Option: Auto-stop previous, or error.
                // Let's error to be explicit.
                throw new ApiError("TIMER_RUNNING", "You already have an active timer running", 400);
            }

            // 3. Create entry
            const entry = await TimeEntry.create({
                user_id: userId,
                task_id: taskId,
                start_time: new Date(),
            }, { transaction: t });

            await t.commit();
            return entry;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    // --------------------------------------------------------
    // STOP TIMER
    // --------------------------------------------------------
    async stopTimer(userId) {
        const t = await sequelize.transaction();
        try {
            const activeEntry = await TimeEntry.findOne({
                where: {
                    user_id: userId,
                    end_time: null
                },
                include: { model: Task, as: 'task' },
                transaction: t
            });

            if (!activeEntry) {
                throw new ApiError("NO_TIMER", "No active timer found", 404);
            }

            const endTime = new Date();
            const startTime = new Date(activeEntry.start_time);
            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            activeEntry.end_time = endTime;
            activeEntry.duration = durationSeconds;
            await activeEntry.save({ transaction: t });

            await t.commit();
            return activeEntry;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    // --------------------------------------------------------
    // GET ACTIVE TIMER
    // --------------------------------------------------------
    async getActiveTimer(userId) {
        return TimeEntry.findOne({
            where: { user_id: userId, end_time: null },
            include: { model: Task, as: 'task' }
        });
    },

    // --------------------------------------------------------
    // LOG MANUAL ENTRY
    // --------------------------------------------------------
    async logManualEntry(userId, taskId, { startTime, endTime, description }) {
        // Basic validation...
        const start = new Date(startTime);
        const end = new Date(endTime);
        const duration = Math.floor((end - start) / 1000);

        return TimeEntry.create({
            user_id: userId,
            task_id: taskId,
            start_time: start,
            end_time: end,
            duration,
            description
        });
    }
};
