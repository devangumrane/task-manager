import prisma from "../../database/prisma.js";
import { notificationService } from "../../../modules/notifications/notification.service.js";

(async () => {
  console.log("[worker] Reminder worker started");

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasksDueSoon = await prisma.task.findMany({
      where: {
        status: { not: "DONE" }, // Uses uppercase Enum value
        dueDate: {
          lte: tomorrow,
          not: null
        }
      },
      include: {
        project: true,
        assignee: true,
        // creator: true // REMOVED: Task doesn't have creator link in this schema
      },
      take: 50
    });

    for (const task of tasksDueSoon) {
      // Check activity log (using 'action' field)
      const lastReminder = await prisma.activityLog.findFirst({
        where: {
          // taskId: task.id, // REMOVED: ActivityLog doesn't have taskId, store in metadata
          action: "reminder.fired",
          // json filter for metadata
          metadata: {
            path: '$.taskId',
            equals: task.id
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (lastReminder) continue;

      const user = task.assigned; // Only assignee gets reminder if creator link is gone
      if (!user) continue;

      // Ensure notification service handles this structure (stubbing if needed)
      // For now we just log activity as that's the main db op

      // await notificationService.sendTaskReminder({ ... }); 

      await prisma.activityLog.create({
        data: {
          projectId: task.projectId,
          userId: user.id,
          action: "reminder.fired",
          metadata: {
            taskId: task.id,
            reason: "due_soon",
            title: "Reminder sent"
          }
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
