import { UserSkill, Task, TaskSkill, Skill } from "../../models/index.js";
import sequelize from "../../config/database.js";

export const analyticsService = {
    /**
     * Updates user skill proficiency based on a completed task.
     * Increments 'tasks_completed' for each skill associated with the task.
     */
    async recordTaskCompletion(userId, taskId) {
        if (!userId || !taskId) return;

        try {
            // 1. Get task with its skills
            const task = await Task.findByPk(taskId, {
                include: {
                    model: Skill,
                    as: 'skills',
                },
            });

            if (!task || !task.skills || task.skills.length === 0) {
                return; // No skills to record
            }

            // 2. Update UserSkill for each skill
            for (const skill of task.skills) {
                const [userSkill, created] = await UserSkill.findOrCreate({
                    where: { user_id: userId, skill_id: skill.id },
                    defaults: { tasks_completed: 0 },
                });

                await userSkill.increment('tasks_completed', { by: 1 });
                await userSkill.update({ last_used_at: new Date() });
            }

            console.log(`[ANALYTICS] Updated skills for user ${userId} from task ${taskId}`);
        } catch (err) {
            console.error("[ANALYTICS] Failed to record task completion:", err);
        }
    },

    /**
     * Get user's skill profile
     */
    async getUserSkills(userId) {
        return UserSkill.findAll({
            where: { user_id: userId },
            include: {
                model: Skill,
                as: 'skill',
                attributes: ['id', 'name', 'category'],
            },
            order: [['tasks_completed', 'DESC']],
        });
    }
};
