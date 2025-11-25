'use client';

import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useProjectTasks } from '@/hooks/useTasks.dynamic';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

interface TaskFeedProps {
  projectId: string | null;
}

export default function TaskFeed({ projectId }: TaskFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data, loading, error } = useProjectTasks(projectId, {
    search: searchQuery || undefined,
    status: statusFilter || undefined,
  });

  if (!projectId) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a project from the sidebar to view and manage tasks
          </p>
        </div>
      </div>
    );
  }

  const tasks = data?.projectTasks || [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Feed</h2>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={!statusFilter ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter(null)}
          >
            All Tasks
          </Badge>
          <Badge
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            In Progress
          </Badge>
          <Badge
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </Badge>
          <Badge
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed
          </Badge>
        </div>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">Failed to load tasks</p>
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first task to get started
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          )}

          {/* Task Cards */}
          {!loading && !error && tasks.length > 0 && (
            <>
              {tasks.map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => setSelectedTaskId(task.id)} 
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={projectId}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        projectId={projectId!}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      />
    </div>
  );
}
