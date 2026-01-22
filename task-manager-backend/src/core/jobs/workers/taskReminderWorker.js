import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

import { notificationService } from "../../../modules/notifications/notification.service.js";

const MAX_RETRIES = 3;

(async () => {
  console.log("[worker] Reminder worker started");

  const due = await prisma.taskReminder.findMany({
    where: { status: "scheduled", reminderTime: { lte: new Date() } },
    take: 100,
    orderBy: { reminderTime: "asc" },
    select: { id: true },
  });

  if (!due.length) {
    await prisma.$disconnect();
    process.exit(0);
  }

  for (const { id } of due) {
    try {
      const lock = await prisma.taskReminder.updateMany({
        where: { id, status: "scheduled" },
        data: { status: "processing" },
      });

      if (lock.count !== 1) continue;

      const reminder = await prisma.taskReminder.findUnique({
        where: { id },
        include: {
          task: {
            include: {
              project: true,
              assigned: true,
              creator: true,
            },
          },
        },
      });

      if (!reminder) continue;

      const user = reminder.task.assigned || reminder.task.creator;

      await notificationService.sendTaskReminder({
        reminder,
        task: reminder.task,
        user,
      });

      await prisma.activityLog.create({
        data: {
          workspaceId: reminder.task.project.workspaceId,
          projectId: reminder.task.projectId,
          taskId: reminder.taskId,
          userId: user?.id ?? null,
          type: "reminder.fired",
          metadata: { reminderId: id },
        },
      });

      // NO realtime emits here — worker cannot emit

      await prisma.taskReminder.update({
        where: { id },
        data: { status: "completed", executedAt: new Date() },
      });

    } catch (err) {
      console.error("[worker] reminder error", id, err);

      const r = await prisma.taskReminder.findUnique({ where: { id } });

      if (r.retryCount + 1 >= MAX_RETRIES) {
        await prisma.taskReminder.update({
          where: { id },
          data: {
            status: "failed",
            lastError: err.message,
            retryCount: r.retryCount + 1,
          },
        });

        // Worker CANNOT emit realtime events

      } else {
        await prisma.taskReminder.update({
          where: { id },
          data: {
            status: "scheduled",
            retryCount: r.retryCount + 1,
            lastError: err.message,
          },
        });
      }
    }
  }

  await prisma.$disconnect();
  process.exit(0);
})();
