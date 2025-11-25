/**
 * ============================================================================
 * SUBTASKS SECTION COMPONENT - MVP 3
 * ============================================================================
 * 
 * Subtask management with progress tracking
 * Features:
 * - Create, complete, delete subtasks
 * - Progress bar with percentage
 * - Nested subtasks support (one level deep)
 * - Quick toggle completion
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  useSubtasks,
  useSubtaskProgress,
  useCreateSubtask,
  useToggleSubtask,
  useDeleteSubtask,
} from '@/hooks/useSubtasks.dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SubtasksSectionProps {
  taskId: string;
}

export default function SubtasksSection({ taskId }: SubtasksSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: subtasks, loading, refetch } = useSubtasks(taskId);
  const progress = useSubtaskProgress(taskId);
  const [createSubtask, { loading: creating }] = useCreateSubtask();

  const [newSubtask, setNewSubtask] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
        type: 'error',
      });
      return;
    }

    try {
      await createSubtask({
        variables: {
          input: {
            title: newSubtask,
            parentId: taskId,
            userId: user.id,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Subtask created',
        type: 'success',
      });

      setNewSubtask('');
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create subtask',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {progress && subtasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {progress.completed} / {progress.total} completed
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress.percentage.toFixed(0)}% complete
          </p>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No subtasks yet</p>
            <p className="text-sm">Break this task into smaller steps</p>
          </div>
        ) : (
          subtasks.map((subtask: any) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onUpdate={refetch}
              isExpanded={expandedIds.has(subtask.id)}
              onToggleExpanded={() => toggleExpanded(subtask.id)}
            />
          ))
        )}
      </div>

      {/* Create Subtask Form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1"
        />
        <Button type="submit" disabled={creating || !newSubtask.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>
    </div>
  );
}

// ==================== SUBTASK ITEM COMPONENT ====================

interface SubtaskItemProps {
  subtask: any;
  onUpdate: () => void;
  depth?: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

function SubtaskItem({
  subtask,
  onUpdate,
  depth = 0,
  isExpanded = false,
  onToggleExpanded,
}: SubtaskItemProps) {
  const { toast } = useToast();
  const [toggleSubtask, { loading: toggling }] = useToggleSubtask();
  const [deleteSubtask, { loading: deleting }] = useDeleteSubtask();

  const handleToggle = async () => {
    try {
      const newCompleted = subtask.status !== 'COMPLETED';
      await toggleSubtask({
        variables: { 
          id: subtask.id,
          completed: newCompleted 
        },
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subtask',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this subtask?')) return;

    try {
      await deleteSubtask({
        variables: { id: subtask.id },
      });

      toast({
        title: 'Success',
        description: 'Subtask deleted',
        type: 'success',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subtask',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const isCompleted = subtask.status === 'COMPLETED';
  const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-6 mt-1' : ''}`}>
      <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        {/* Expand Toggle (if has nested subtasks) */}
        {hasNestedSubtasks && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={toggling}
          className="flex-shrink-0"
        />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm truncate',
              isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {subtask.title}
          </p>
          {subtask.dueDate && (
            <p className="text-xs text-muted-foreground">
              Due: {format(new Date(subtask.dueDate), 'MMM dd')}
            </p>
          )}
        </div>

        {/* Completion Icon */}
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        {/* Nested Subtasks Count */}
        {hasNestedSubtasks && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {subtask.subtasks.length}
          </span>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      {/* Nested Subtasks */}
      {hasNestedSubtasks && isExpanded && (
        <div className="mt-1 space-y-1">
          {subtask.subtasks.map((nested: any) => (
            <SubtaskItem
              key={nested.id}
              subtask={nested}
              onUpdate={onUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
