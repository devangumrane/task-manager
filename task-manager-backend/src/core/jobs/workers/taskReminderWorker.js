import prisma from "../../database/prisma.js";
import { notificationService } from "../../../modules/notifications/notification.service.js";

(async () => {
  console.log("[worker] Reminder worker started");

  try {
    // 1. Find tasks that are pending and have a due date in the near future (e.g., next 24 hours) or are overdue
    // And ensure we haven't already sent a reminder today.

    // This is a simplified logic. Ideally we'd have a 'nextReminderAt' field.
    // For now, let's just find tasks due in the next 24h that are NOT done.

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasksDueSoon = await prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: {
          lte: tomorrow,
          not: null
        }
      },
      include: {
        project: true,
        assigned: true,
        creator: true
      },
      take: 50 // Limit batch
    });

    for (const task of tasksDueSoon) {
      // Check if we already sent a reminder for this task RECENTLY (e.g. in the last 24h)
      // We use ActivityLog for this state tracking to avoid schema changes.
      const lastReminder = await prisma.activityLog.findFirst({
        where: {
          taskId: task.id,
          type: "reminder.fired",
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (lastReminder) continue;

      // Send Reminder
      const user = task.assigned || task.creator;
      if (!user) continue;

      await notificationService.sendTaskReminder({
        task,
        user,
        type: "DUE_SOON"
      });

      // Log it so we don't spam
      await prisma.activityLog.create({
        data: {
          workspaceId: task.project.workspaceId,
          projectId: task.projectId,
          taskId: task.id,
          userId: user.id,
          type: "reminder.fired",
          title: "Reminder sent",
          icon: "bell",
          metadata: { reason: "due_soon" }
        }
      });

      console.log(`[worker] Sent reminder for task ${task.id}`);
    }

  } catch (err) {
    console.error("[worker] Critical error in taskReminderWorker:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
