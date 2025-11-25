import React, { useState, useEffect, useRef } from 'react';
import { useTaskMutations } from '../../hooks/useTodos';
import { TaskCategory, TaskPriority, CreateTaskInput } from '../../types/todo';
import { MediaUpload } from './MediaUpload';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    category: TaskCategory.PERSONAL,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
  });

  const { createTask, loading } = useTaskMutations();
  const {
    mediaFiles,
    uploading,
    uploadProgress,
    addMediaFiles,
    removeMediaFile,
    clearMediaFiles,
    uploadMedia,
  } = useMediaUpload({
    maxFiles: 5,
    maxFileSize: 10, // 10MB for task creation
  });

  // Reset form function
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: TaskCategory.PERSONAL,
      priority: TaskPriority.MEDIUM,
      dueDate: '',
    });
    clearMediaFiles();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề task');
      return;
    }

    try {
      const taskData: CreateTaskInput = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      };

      // Create task first
      const createdTask = await createTask(taskData);
      
      // Upload media if any
      if (mediaFiles.length > 0 && createdTask?.id) {
        try {
          await uploadMedia(createdTask.id);
          toast.success(`Tạo task thành công với ${mediaFiles.length} file đính kèm!`);
        } catch (uploadError) {
          toast.success('Tạo task thành công nhưng có lỗi khi upload file');
          console.error('Media upload error:', uploadError);
        }
      } else {
        toast.success('Tạo task thành công!');
      }

      resetForm();
      onClose();
      onTaskCreated?.();
    } catch (error: any) {
      console.error('Create task error:', error);
      toast.error(error.message || 'Lỗi khi tạo task');
    }
  };

  const handleInputChange = (field: keyof CreateTaskInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Tạo Task Mới</DialogTitle>
        </DialogHeader>
        
        {/* Scrollable Form Container */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tiêu đề task..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả chi tiết..."
                rows={3}
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value as TaskCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskCategory.WORK}>Công việc</SelectItem>
                    <SelectItem value={TaskCategory.PERSONAL}>Cá nhân</SelectItem>
                    <SelectItem value={TaskCategory.STUDY}>Học tập</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskPriority.LOW}>Thấp</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Trung bình</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Hạn chót</Label>
              <Input
                type="datetime-local"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>File đính kèm</Label>
              <MediaUpload
                onMediaAdd={addMediaFiles}
                onMediaRemove={removeMediaFile}
                existingMedia={mediaFiles}
                maxFiles={5}
                maxFileSize={10}
                disabled={loading.creating || uploading}
              />
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Đang upload... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end space-x-3 pt-6 border-t bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading.creating}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading.creating || !formData.title.trim()}
          >
            {loading.creating ? 'Đang tạo...' : 'Tạo Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
