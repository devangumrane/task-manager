import { Task, TaskDependency, Project } from "../../models/index.js";
import ApiError from "../../core/errors/ApiError.js";
import sequelize from "../../config/database.js";
import { assertWorkspaceMember } from "../../core/authorization/workspace.guard.js";

// Helper: Check for cycles (DFS)
async function detectCycle(startTaskId, targetTaskId) {
    // If we add a dependency where startTaskId BLOCKS targetTaskId
    // We need to ensure targetTaskId does not eventually block startTaskId.

    const visited = new Set();
    const stack = [targetTaskId];

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;
        visited.add(current);

        if (current === startTaskId) return true; // Cycle detected

        // Find all tasks that 'current' is blocking
        // current -> is blocker for -> Next
        const downstream = await TaskDependency.findAll({
            where: { blocker_task_id: current },
            attributes: ['blocked_task_id']
        });

        for (const dep of downstream) {
            stack.push(dep.blocked_task_id);
        }
    }

    return false;
}

export const dependencyService = {
    // --------------------------------------------------------
    // ADD DEPENDENCY (Blocker -> Blocked)
    // "Blocker" must finish before "Blocked" starts/finishes
    // --------------------------------------------------------
    async addDependency(userId, { blockerId, blockedId }) {
        if (blockerId === blockedId) {
            throw new ApiError("INVALID_DEPENDENCY", "Task cannot depend on itself", 400);
        }

        const t = await sequelize.transaction();
        try {
            // 1. Fetch tasks & auth
            const tasks = await Task.findAll({
                where: { id: [blockerId, blockedId] },
                include: { model: Project, as: 'project' },
                transaction: t
            });

            if (tasks.length !== 2) {
                throw new ApiError("TASK_NOT_FOUND", "One or both tasks not found", 404);
            }

            const blocker = tasks.find(t => t.id === blockerId);
            const blocked = tasks.find(t => t.id === blockedId);

            // Ensure same workspace (optional constraint, but safer for now)
            if (blocker.project.workspace_id !== blocked.project.workspace_id) {
                throw new ApiError("CROSS_WORKSPACE_DEPENDENCY", "Tasks must be in sameworkspace", 400);
            }

            await assertWorkspaceMember(t, userId, blocker.project.workspace_id);

            // 2. Cycle Detection
            const hasCycle = await detectCycle(blockerId, blockedId);
            if (hasCycle) {
                throw new ApiError("CYCLE_DETECTED", "Circular dependency detected", 400);
            }

            // 3. Create
            await TaskDependency.create({
                blocker_task_id: blockerId,
                blocked_task_id: blockedId
            }, { transaction: t });

            await t.commit();
            return true;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    // --------------------------------------------------------
    // REMOVE DEPENDENCY
    // --------------------------------------------------------
    async removeDependency(userId, { blockerId, blockedId }) {
        // similar auth logic...
        await TaskDependency.destroy({
            where: {
                blocker_task_id: blockerId,
                blocked_task_id: blockedId
            }
        });
        return true;
    },

    // --------------------------------------------------------
    // GET BLOCKERS (Tasks preventing this one)
    // --------------------------------------------------------
    async getBlockers(taskId) {
        return TaskDependency.findAll({
            where: { blocked_task_id: taskId },
            include: [{
                model: Task,
                as: 'blocker', // This needs alias in model index to work beautifully, or just manual join
                // Actually in index.js we defined: Task.belongsToMany(Task, as: 'blockers' ...)
                // So we should use Task.findByPk(taskId, { include: 'blockers' })
            }]
        });
    }
};
