'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateProject } from '@/hooks/useProjects.dynamic';
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
import { useToast } from '@/hooks/use-toast';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreateProjectForm {
  name: string;
  description?: string;
  avatar?: string;
}

export default function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const { toast } = useToast();
  const [createProject, { loading }] = useCreateProject();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProjectForm>();

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      await createProject({
        variables: {
          input: {
            name: data.name,
            description: data.description || undefined,
            avatar: data.avatar || undefined,
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Project created successfully',
        type: 'success',
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Create project error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
        type: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh] p-0">
        {/* Header - Fixed */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a project to collaborate with your team
          </DialogDescription>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign"
                {...register('name', { 
                  required: 'Project name is required'
                })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                rows={4}
                {...register('description')}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('avatar')}
              />
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
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="create-project-form"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
