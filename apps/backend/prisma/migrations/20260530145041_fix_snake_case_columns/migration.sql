/*
  Warnings:

  - You are about to drop the column `createdAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_projectId_fkey";

-- DropIndex
DROP INDEX "tasks_dueDate_idx";

-- DropIndex
DROP INDEX "tasks_projectId_idx";

-- DropIndex
DROP INDEX "tasks_projectId_status_idx";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "createdAt",
DROP COLUMN "dueDate",
DROP COLUMN "projectId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "due_date" DATE,
ADD COLUMN     "project_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL;

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_project_id_status_idx" ON "tasks"("project_id", "status");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
