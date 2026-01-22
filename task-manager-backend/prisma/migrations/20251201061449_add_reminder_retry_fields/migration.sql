-- DropForeignKey
ALTER TABLE "TaskReminder" DROP CONSTRAINT "TaskReminder_taskId_fkey";

-- AlterTable
ALTER TABLE "TaskReminder" ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
