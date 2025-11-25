'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateTaskStatus } from '@/hooks/useTasks.dynamic';

interface TaskCardProps {
  task: any;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const [updateStatus] = useUpdateTaskStatus();

  const handleStatusChange = async (checked: boolean) => {
    const newStatus = checked ? 'COMPLETED' : 'IN_PROGRESS';
    
    try {
      await updateStatus({
        variables: {
          input: {
            id: task.id,
            status: newStatus,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-green-500 bg-green-50';
      case 'IN_PROGRESS':
        return 'border-blue-500 bg-blue-50';
      case 'PENDING':
        return 'border-gray-300 bg-white';
      case 'CANCELLED':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all cursor-pointer
        hover:shadow-md hover:border-primary/50
        ${getStatusColor(task.status)}
        ${task.status === 'COMPLETED' ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.status === 'COMPLETED'}
          onCheckedChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`font-medium mb-1 ${
              task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {task.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {/* Priority */}
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-medium' : ''
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
              </div>
            )}

            {/* Comments Count */}
            {task._count?.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task._count.comments}</span>
              </div>
            )}

            {/* Subtasks Count */}
            {task._count?.subtasks > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>{task._count.subtasks}</span>
              </div>
            )}

            {/* Created Time */}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(task.createdAt), 'MMM dd, HH:mm')}</span>
            </div>
          </div>
        </div>

        {/* Priority Indicator */}
        <div className={`w-1 h-full rounded-full ${getPriorityColor(task.priority)}`} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        {/* Assigned Users */}
        <div className="flex items-center gap-2">
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {task.assignedTo.length} assigned
              </span>
              {/* TODO: Show avatars */}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No assignees</span>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.user?.avatar} />
            <AvatarFallback className="text-xs">
              {task.user?.firstName?.[0]}{task.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {task.user?.firstName} {task.user?.lastName}
          </span>
        </div>
      </div>
    </div>
  );
}
