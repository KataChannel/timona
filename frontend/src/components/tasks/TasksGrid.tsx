'use client';

import React from 'react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task, TaskStatus } from '@/types/todo';
import { Loader2, Inbox } from 'lucide-react';

interface TasksGridProps {
  tasks: (Task & {
    isShared?: boolean;
    sharedBy?: {
      username: string;
      avatar?: string;
    };
  })[];
  loading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  emptyMessage?: string;
}

export function TasksGrid({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  emptyMessage = 'No tasks found',
}: TasksGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium text-muted-foreground">
              {emptyMessage}
            </p>
            <p className="text-sm text-muted-foreground/70">
              Create a new task to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
