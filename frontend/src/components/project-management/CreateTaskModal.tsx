'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateProjectTask } from '@/hooks/useTasks.dynamic';
import { useProjectMembers } from '@/hooks/useProjects.dynamic';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

interface CreateTaskForm {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER';
  dueDate?: Date;
}

export default function CreateTaskModal({
  open,
  onOpenChange,
  projectId,
}: CreateTaskModalProps) {
  const { user } = useAuth();
  const [createTask, { loading }] = useCreateProjectTask(projectId);
  const { data: membersData } = useProjectMembers(projectId);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateTaskForm>({
    defaultValues: {
      priority: 'MEDIUM',
      category: 'OTHER',
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const onSubmit = async (data: CreateTaskForm) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      await createTask({
        variables: {
          projectId,
          input: {
            title: data.title,
            description: data.description || '',
            priority: data.priority,
            category: data.category,
            dueDate: selectedDate?.toISOString(),
            assignedTo: selectedAssignees,
            tags,
            userId: user.id, // Current user is the creator
          },
        },
      });

      // Reset form
      reset();
      setSelectedDate(undefined);
      setSelectedAssignees([]);
      setTags([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const members = membersData?.projectMembers || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] p-0">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a task to your project (like posting on Facebook)
          </DialogDescription>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Task Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Design homepage mockup"
                {...register('title', { required: 'Title is required' })}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the task in detail..."
                rows={4}
                {...register('description')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use @username to mention team members
              </p>
            </div>

            {/* Priority & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  defaultValue="MEDIUM"
                  onValueChange={(value) => setValue('priority', value as any)}
                >
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

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  defaultValue="OTHER"
                  onValueChange={(value) => setValue('category', value as 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH' | 'OTHER')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORK">💼 Work</SelectItem>
                    <SelectItem value="PERSONAL">👤 Personal</SelectItem>
                    <SelectItem value="SHOPPING">🛒 Shopping</SelectItem>
                    <SelectItem value="HEALTH">🏥 Health</SelectItem>
                    <SelectItem value="OTHER">📌 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assign to */}
            <div className="space-y-2">
              <Label>Assign to (optional)</Label>
              <Select onValueChange={(userId) => {
                if (!selectedAssignees.includes(userId)) {
                  setSelectedAssignees([...selectedAssignees, userId]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member: any) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.firstName} {member.user.lastName} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Assignees */}
              {selectedAssignees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAssignees.map((userId) => {
                    const member = members.find((m: any) => m.userId === userId);
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                      >
                        <span>{member?.user.firstName}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAssignees(selectedAssignees.filter((id) => id !== userId))
                          }
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag (e.g., urgent, backend)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>

              {/* Tag List */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedDate(undefined);
                setSelectedAssignees([]);
                setTags([]);
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="create-task-form"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
