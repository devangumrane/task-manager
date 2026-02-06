
import { parentPort } from "worker_threads";
import parser from "cron-parser";
import { Op } from "sequelize";
import { RecurringTask, Task, Project, TaskTag, TaskSkill } from "../../../models/index.js";
import sequelize from "../../../config/database.js";

// Ensure DB connection for worker
// (Sequelize usually handles pool, but worker might need explicit connect if not shared)
// For simplicity, we assume models import initializes the instance.

(async () => {
    try {
        // 1. Find due tasks
        const now = new Date();
        const dueRules = await RecurringTask.findAll({
            where: {
                is_active: true,
                next_run: {
                    [Op.lte]: now,
                }
            },
            include: [
                {
                    model: Task,
                    as: 'templateTask',
                    include: ['tags', 'skills', 'project'] // Clone tags and skills too
                }
            ]
        });

        if (dueRules.length === 0) {
            if (parentPort) parentPort.postMessage("done");
            else process.exit(0);
            return;
        }

        console.log(`[RecurringWorker] Found ${dueRules.length} due recurring tasks.`);

        for (const rule of dueRules) {
            const t = await sequelize.transaction();
            try {
                const template = rule.templateTask;
                if (!template) {
                    console.warn(`[RecurringWorker] Template task ${rule.original_task_id} not found.`);
                    continue;
                }

                // 2. Clone Task
                // Strip ID, timestamps, etc.
                const newTaskData = template.toJSON();
                delete newTaskData.id;
                delete newTaskData.createdAt;
                delete newTaskData.updatedAt;
                delete newTaskData.completedAt;

                // Set status to todo/pending
                newTaskData.status = 'pending';
                newTaskData.title = `${newTaskData.title} (Recurring)`; // Optional: distinctive title?

                // Create
                const newTask = await Task.create({
                    ...newTaskData,
                    created_by: template.created_by, // Or system user?
                }, { transaction: t });

                // Clone associations if needed (tags, skills)
                // Manual logic generally needed for M:N
                if (template.tags && template.tags.length > 0) {
                    await newTask.setTags(template.tags.map(tag => tag.id), { transaction: t });
                }
                if (template.skills && template.skills.length > 0) {
                    await newTask.setSkills(template.skills.map(skill => skill.id), { transaction: t });
                }

                // 3. Update Next Run
                const interval = parser.parseExpression(rule.cron_expression);
                const nextRun = interval.next().toDate();

                rule.last_run = now;
                rule.next_run = nextRun;
                await rule.save({ transaction: t });

                await t.commit();
                console.log(`[RecurringWorker] Spawned task ${newTask.id} from rule ${rule.id}. Next run: ${nextRun}`);
            } catch (err) {
                console.error(`[RecurringWorker] Failed to process rule ${rule.id}:`, err);
                await t.rollback();
            }
        }

        if (parentPort) parentPort.postMessage("done");
        else process.exit(0);

    } catch (err) {
        console.error("[RecurringWorker] Error:", err);
        if (parentPort) parentPort.postMessage("error");
        else process.exit(1);
    }
})();
