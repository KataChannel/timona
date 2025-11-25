'use client';

import React from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Share,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types/todo';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task & {
    isShared?: boolean;
    sharedBy?: {
      username: string;
      avatar?: string;
    };
  };
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

const priorityConfig = {
  [TaskPriority.HIGH]: {
    label: 'High',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  [TaskPriority.LOW]: {
    label: 'Low',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Circle,
  },
};

const statusConfig = {
  [TaskStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-800',
    icon: Circle,
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  [TaskStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
};

const categoryConfig = {
  [TaskCategory.WORK]: {
    label: 'Work',
    className: 'bg-purple-100 text-purple-800',
  },
  [TaskCategory.PERSONAL]: {
    label: 'Personal',
    className: 'bg-green-100 text-green-800',
  },
  [TaskCategory.STUDY]: {
    label: 'Study',
    className: 'bg-indigo-100 text-indigo-800',
  },
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const StatusIcon = statusConfig[task.status]?.icon || Circle;
  const PriorityIcon = priorityConfig[task.priority]?.icon || Circle;

  // Safe category access with fallback
  const taskCategory = (task.category && task.category in TaskCategory 
    ? task.category as TaskCategory 
    : TaskCategory.PERSONAL) as TaskCategory;
  const CategoryInfo = categoryConfig[taskCategory];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200",
      isOverdue && "border-red-300"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg leading-none tracking-tight">
                {task.title}
              </h3>
              {task.isShared && (
                <Badge variant="outline" className="gap-1">
                  <Share className="h-3 w-3" />
                  Shared
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusChange?.(task.id, TaskStatus.PENDING)}
                disabled={task.status === TaskStatus.PENDING}
              >
                <Circle className="mr-2 h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(task.id, TaskStatus.IN_PROGRESS)}
                disabled={task.status === TaskStatus.IN_PROGRESS}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange?.(task.id, TaskStatus.COMPLETED)}
                disabled={task.status === TaskStatus.COMPLETED}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn("gap-1", statusConfig[task.status]?.className || "bg-gray-100 text-gray-800")}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig[task.status]?.label || "Unknown"}
          </Badge>

          <Badge
            variant="outline"
            className={cn("gap-1", priorityConfig[task.priority]?.className || "bg-gray-100 text-gray-800")}
          >
            <PriorityIcon className="h-3 w-3" />
            {priorityConfig[task.priority]?.label || "Unknown"}
          </Badge>

          <Badge
            variant="outline"
            className={CategoryInfo.className}
          >
            {CategoryInfo.label}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
        <div className="flex items-center gap-4">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-600 font-medium"
            )}>
              <Calendar className="h-4 w-4" />
              {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              {isOverdue && <span className="text-xs">(Overdue)</span>}
            </div>
          )}

          {task.isShared && task.sharedBy && (
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.sharedBy.avatar} />
                <AvatarFallback className="text-xs">
                  {task.sharedBy.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{task.sharedBy.username}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {format(new Date(task.createdAt), 'MMM dd')}
        </div>
      </CardFooter>
    </Card>
  );
}
