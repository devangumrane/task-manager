/*
  Warnings:

  - Added the required column `icon` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `metadata` on table `ActivityLog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "metadata" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
