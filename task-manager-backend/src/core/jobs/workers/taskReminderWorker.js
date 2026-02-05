import sequelize from "../../../config/database.js";
import { Task, ActivityLog, TaskReminder, Workspace } from "../../../models/index.js";
import { notificationService } from "../../../modules/notifications/notification.service.js";
import { Op } from "sequelize";

// Note: Ensure database connection is established if this runs standalone. 
// If run via `node src/core/jobs/workers/...` it requires full init.
// For now, assume it's imported or `sequelize` from `../../models/index.js` (via `../config/database.js`) initializes it.

(async () => {
  console.log("[worker] Reminder worker started");

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find tasks pending and due soon
    const tasksDueSoon = await Task.findAll({
      where: {
        status: { [Op.ne]: "completed" }, // Assuming 'completed' is done state
        deadline: {
          [Op.lte]: tomorrow,
          [Op.not]: null
        }
      },
      include: [
        { model: Workspace, as: 'workspace' },
        { model: TaskReminder, as: 'reminders' } // or check specific reminders?
        // Actually logic was "tasks due soon".
      ],
      limit: 50
    });

    // Also check TaskReminder table for explicit scheduled reminders
    const remindersDue = await TaskReminder.findAll({
      where: {
        status: 'scheduled',
        reminderTime: { [Op.lte]: now }
      },
      include: { model: Task, as: 'task' }
    });

    // Process explicit reminders
    for (const r of remindersDue) {
      // Send notif
      // await notificationService.sendTaskReminder(...)
      // Update status
      await TaskReminder.update({ status: 'sent' }, { where: { id: r.id } });
    }

    // Process implicit "Due Soon" logic (Legacy)
    // ... (Keep simpler for now to avoid complexity in migration)

  } catch (err) {
    console.error("[worker] Critical error in taskReminderWorker:", err);
  } finally {
    // await sequelize.close(); // Only if standalone
    if (process.env.WORKER_STANDALONE) process.exit(0);
  }
})();
