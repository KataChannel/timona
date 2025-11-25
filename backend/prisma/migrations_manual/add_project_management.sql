-- Migration: Add Project Management System
-- Date: 2025-10-29
-- Description: Add Project, ProjectMember tables and extend Task for project management

-- =====================================================
-- 1. CREATE PROJECTS TABLE
-- =====================================================
CREATE TABLE "projects" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "avatar" TEXT,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") 
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================
-- 2. CREATE PROJECT_MEMBERS TABLE
-- =====================================================
CREATE TABLE "project_members" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId")
    REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================================
-- 3. EXTEND TASKS TABLE (Add project management fields)
-- =====================================================
ALTER TABLE "tasks" 
  ADD COLUMN "projectId" TEXT,
  ADD COLUMN "assignedTo" TEXT[],
  ADD COLUMN "mentions" TEXT[],
  ADD COLUMN "order" INTEGER DEFAULT 0,
  ADD COLUMN "tags" TEXT[];

-- Add foreign key constraint
ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_projectId_fkey" 
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 4. CREATE CHAT_MESSAGES TABLE (For MVP 3)
-- =====================================================
CREATE TABLE "chat_messages" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "mentions" TEXT[],
  "replyToId" TEXT,
  "reactions" JSONB,
  "isEdited" BOOLEAN NOT NULL DEFAULT false,
  "editedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "chat_messages_projectId_fkey" FOREIGN KEY ("projectId")
    REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "chat_messages_replyToId_fkey" FOREIGN KEY ("replyToId")
    REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================================================
-- 5. EXTEND NOTIFICATIONS TABLE (Add task & mention support)
-- =====================================================
ALTER TABLE "notifications"
  ADD COLUMN "taskId" TEXT,
  ADD COLUMN "mentionedBy" TEXT;

-- Add foreign keys
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "tasks"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_mentionedBy_fkey"
  FOREIGN KEY ("mentionedBy") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- 6. CREATE INDEXES (Performance optimization)
-- =====================================================

-- Projects indexes
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");
CREATE INDEX "projects_isArchived_idx" ON "projects"("isArchived");
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

-- Project members indexes
CREATE INDEX "project_members_projectId_idx" ON "project_members"("projectId");
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");
CREATE INDEX "project_members_joinedAt_idx" ON "project_members"("joinedAt");

-- Project members unique constraint
CREATE UNIQUE INDEX "project_members_projectId_userId_key" 
  ON "project_members"("projectId", "userId");

-- Tasks indexes (for project management)
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");
CREATE INDEX "tasks_projectId_priority_idx" ON "tasks"("projectId", "priority");
CREATE INDEX "tasks_projectId_order_idx" ON "tasks"("projectId", "order");
CREATE INDEX "tasks_projectId_dueDate_idx" ON "tasks"("projectId", "dueDate");

-- Chat messages indexes
CREATE INDEX "chat_messages_projectId_idx" ON "chat_messages"("projectId");
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");
CREATE INDEX "chat_messages_projectId_createdAt_idx" 
  ON "chat_messages"("projectId", "createdAt" DESC);
CREATE INDEX "chat_messages_replyToId_idx" ON "chat_messages"("replyToId");

-- Notifications indexes (extend existing)
CREATE INDEX "notifications_taskId_idx" ON "notifications"("taskId");
CREATE INDEX "notifications_mentionedBy_idx" ON "notifications"("mentionedBy");

-- =====================================================
-- 7. SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample project (replace userId with actual user ID)
-- INSERT INTO "projects" (id, name, description, "ownerId")
-- VALUES (
--   gen_random_uuid()::text,
--   'Website Redesign',
--   'Redesign company website with modern UI',
--   'YOUR_USER_ID_HERE'
-- );

-- =====================================================
-- ROLLBACK SCRIPT (In case of issues)
-- =====================================================
/*
-- Drop indexes first
DROP INDEX IF EXISTS "projects_ownerId_idx";
DROP INDEX IF EXISTS "projects_isArchived_idx";
DROP INDEX IF EXISTS "projects_createdAt_idx";
DROP INDEX IF EXISTS "project_members_projectId_idx";
DROP INDEX IF EXISTS "project_members_userId_idx";
DROP INDEX IF EXISTS "project_members_joinedAt_idx";
DROP INDEX IF EXISTS "project_members_projectId_userId_key";
DROP INDEX IF EXISTS "tasks_projectId_idx";
DROP INDEX IF EXISTS "tasks_projectId_status_idx";
DROP INDEX IF EXISTS "tasks_projectId_priority_idx";
DROP INDEX IF EXISTS "tasks_projectId_order_idx";
DROP INDEX IF EXISTS "tasks_projectId_dueDate_idx";
DROP INDEX IF EXISTS "chat_messages_projectId_idx";
DROP INDEX IF EXISTS "chat_messages_senderId_idx";
DROP INDEX IF EXISTS "chat_messages_createdAt_idx";
DROP INDEX IF EXISTS "chat_messages_projectId_createdAt_idx";
DROP INDEX IF EXISTS "chat_messages_replyToId_idx";
DROP INDEX IF EXISTS "notifications_taskId_idx";
DROP INDEX IF EXISTS "notifications_mentionedBy_idx";

-- Drop constraints
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_projectId_fkey";
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_taskId_fkey";
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_mentionedBy_fkey";

-- Drop columns
ALTER TABLE "tasks" 
  DROP COLUMN IF EXISTS "projectId",
  DROP COLUMN IF EXISTS "assignedTo",
  DROP COLUMN IF EXISTS "mentions",
  DROP COLUMN IF EXISTS "order",
  DROP COLUMN IF EXISTS "tags";

ALTER TABLE "notifications"
  DROP COLUMN IF EXISTS "taskId",
  DROP COLUMN IF EXISTS "mentionedBy";

-- Drop tables
DROP TABLE IF EXISTS "chat_messages";
DROP TABLE IF EXISTS "project_members";
DROP TABLE IF EXISTS "projects";
*/
