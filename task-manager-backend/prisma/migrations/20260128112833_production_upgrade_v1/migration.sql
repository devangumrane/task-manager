/*
  Warnings:

  - You are about to drop the `Mission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserMissionProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSkillProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStats` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkspaceRole" ADD VALUE 'guest';
ALTER TYPE "WorkspaceRole" ADD VALUE 'viewer';

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_skillId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_parentId_fkey";

-- DropForeignKey
ALTER TABLE "UserMissionProgress" DROP CONSTRAINT "UserMissionProgress_missionId_fkey";

-- DropForeignKey
ALTER TABLE "UserMissionProgress" DROP CONSTRAINT "UserMissionProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkillProgress" DROP CONSTRAINT "UserSkillProgress_skillId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkillProgress" DROP CONSTRAINT "UserSkillProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserStats" DROP CONSTRAINT "UserStats_userId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "viewParams" JSONB;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "WorkspaceMember" ALTER COLUMN "role" SET DEFAULT 'member';

-- DropTable
DROP TABLE "Mission";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "UserMissionProgress";

-- DropTable
DROP TABLE "UserSkillProgress";

-- DropTable
DROP TABLE "UserStats";

-- CreateTable
CREATE TABLE "TaskLabel" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#808080',

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskToTaskLabel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskToTaskLabel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskToTaskLabel_B_index" ON "_TaskToTaskLabel"("B");

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToTaskLabel" ADD CONSTRAINT "_TaskToTaskLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToTaskLabel" ADD CONSTRAINT "_TaskToTaskLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "TaskLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
