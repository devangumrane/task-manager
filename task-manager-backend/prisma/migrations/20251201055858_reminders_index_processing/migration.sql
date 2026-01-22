-- AlterEnum
ALTER TYPE "ReminderStatus" ADD VALUE 'processing';

-- CreateIndex
CREATE INDEX "TaskReminder_reminderTime_idx" ON "TaskReminder"("reminderTime");
