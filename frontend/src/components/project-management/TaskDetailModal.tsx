/**
 * ============================================================================
 * TASK DETAIL MODAL - MVP 3 COMPLETE
 * ============================================================================
 * 
 * Full task view with:
 * - Task details with inline editing
 * - Real-time Comments with threaded replies
 * - Subtasks with progress tracking
 * - Activity history timeline
 * - Assignee management
 * - All using Dynamic GraphQL
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3 Complete
 */

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  useTask, 
  useUpdateTask, 
  useDeleteTask 
} from '@/hooks/useTasks.dynamic';
import CommentsSection from './CommentsSection';
import SubtasksSection from './SubtasksSection';
import ActivityTimeline from './ActivityTimeline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Calendar,
  MessageSquare,
  CheckSquare,
  Clock,
  User,
  Tag,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailModalProps {
  taskId: string | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailModal({
  taskId,
  projectId,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  const { toast } = useToast();
  const { data, loading, error, refetch } = useTask(taskId);
  const [updateTask, { loading: updating }] = useUpdateTask();
  const [deleteTask, { loading: deleting }] = useDeleteTask(projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const task = data?.task;

  // Initialize edit fields when task loads
  React.useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    }
  }, [task]);

  if (!open || !taskId) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Loading task details</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] p-0">
          <VisuallyHidden>
            <DialogTitle>Error loading task</DialogTitle>
          </VisuallyHidden>
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load task details</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSave = async () => {
    try {
      await updateTask({
        variables: {
          id: taskId,
          input: {
            title: editedTitle,
            description: editedDescription,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Task updated successfully',
        type: 'success',
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask({
        variables: { id: taskId },
      });

      toast({
        title: 'Success',
        description: 'Task deleted successfully',
        type: 'success',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask({
        variables: {
          id: taskId,
          input: {
            status: newStatus as any,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Status updated',
        type: 'success',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateTask({
        variables: {
          id: taskId,
          input: {
            priority: newPriority as any,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Priority updated',
        type: 'success',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] p-0">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-lg font-semibold"
                  placeholder="Task title"
                />
              ) : (
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={updating}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Task Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">📋 Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">⚡ In Progress</SelectItem>
                    <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                    <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">🟢 Low</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="HIGH">🟠 High</SelectItem>
                    <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={5}
                  placeholder="Task description..."
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                  {task.description || (
                    <span className="text-muted-foreground italic">No description</span>
                  )}
                </div>
              )}
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Due Date</div>
                    <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {task.dueDate ? (
                        <>
                          {format(new Date(task.dueDate), 'PPP')}
                          {isOverdue && (
                            <AlertCircle className="inline h-3 w-3 ml-1" />
                          )}
                        </>
                      ) : (
                        'No due date'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Created By</div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={task.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {task.user?.firstName?.[0]}{task.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {task.user?.firstName} {task.user?.lastName}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm font-medium">
                      {format(new Date(task.createdAt), 'PPp')}
                    </div>
                  </div>
                </div>

                {task.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                      <div className="text-sm font-medium">
                        {format(new Date(task.completedAt), 'PPp')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Assignees */}
            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {task.assignedTo.length} member(s) assigned
                </div>
              </div>
            )}

            <Separator />

            {/* Tabs: Comments, Subtasks, Activity */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Comments</span>
                  <span className="sm:hidden">💬</span>
                  <span className="ml-1">({task._count?.comments || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="subtasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Subtasks</span>
                  <span className="sm:hidden">✓</span>
                  <span className="ml-1">({task._count?.subtasks || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Activity</span>
                  <span className="sm:hidden">⏱</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4 pt-4">
                <CommentsSection taskId={taskId} />
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4 pt-4">
                <SubtasksSection taskId={taskId} />
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 pt-4">
                <ActivityTimeline taskId={taskId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Last updated {format(new Date(task.updatedAt), 'PPp')}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
