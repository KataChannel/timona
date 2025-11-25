'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOnboardingChecklist, useEmployeeProfiles } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { OnboardingTask } from '@/types/hr';

export default function NewOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { employees, loading: loadingEmployees } = useEmployeeProfiles({ take: 100 });
  const { createOnboardingChecklist, loading: creating } = useCreateOnboardingChecklist();

  const [formData, setFormData] = useState({
    employeeProfileId: '',
    userId: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    assignedTo: '',
    buddyId: '',
    hrNotes: '',
  });

  const [tasks, setTasks] = useState<Partial<OnboardingTask>[]>([
    { title: 'Nhận tài khoản email và các công cụ làm việc', description: '', completed: false },
    { title: 'Hoàn thành các giấy tờ nhân sự', description: '', completed: false },
    { title: 'Tham gia buổi định hướng công ty', description: '', completed: false },
    { title: 'Gặp gỡ và làm quen với đội ngũ', description: '', completed: false },
    { title: 'Thiết lập môi trường làm việc', description: '', completed: false },
  ]);

  const handleEmployeeChange = (value: string) => {
    const employee = employees.find((e) => e.id === value);
    if (employee) {
      setFormData({
        ...formData,
        employeeProfileId: value,
        userId: employee.userId,
      });
    }
  };

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', description: '', completed: false }]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, field: keyof OnboardingTask, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeProfileId || !formData.userId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn nhân viên',
        type: 'error',
      });
      return;
    }

    if (tasks.filter((t) => t.title).length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng thêm ít nhất một công việc',
        type: 'error',
      });
      return;
    }

    try {
      const validTasks = tasks.filter((t) => t.title) as OnboardingTask[];
      await createOnboardingChecklist({
        ...formData,
        tasks: validTasks,
        totalTasks: validTasks.length,
      });

      toast({
        title: 'Thành công',
        description: 'Đã tạo onboarding checklist mới',
        type: 'success',
      });

      router.push('/admin/hr/onboarding');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo onboarding checklist',
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/hr/onboarding">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserPlus className="mr-3 h-8 w-8" />
            Tạo Onboarding Mới
          </h1>
          <p className="text-muted-foreground">Thiết lập quy trình nhập môn cho nhân viên mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
            <CardDescription>Chọn nhân viên cần onboarding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Nhân viên *</Label>
              <Select
                value={formData.employeeProfileId}
                onValueChange={handleEmployeeChange}
                disabled={loadingEmployees}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.fullName} - {employee.employeeCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Thời gian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Ngày mục tiêu hoàn thành</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Phân công</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Người phụ trách</Label>
                <Input
                  id="assignedTo"
                  placeholder="Tên người phụ trách..."
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buddyId">Buddy (người hướng dẫn)</Label>
                <Input
                  id="buddyId"
                  placeholder="Tên buddy..."
                  value={formData.buddyId}
                  onChange={(e) => setFormData({ ...formData, buddyId: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách công việc</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTask}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm công việc
              </Button>
            </CardTitle>
            <CardDescription>
              Tạo danh sách các công việc cần hoàn thành trong quá trình onboarding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Công việc #{index + 1}</h4>
                  {tasks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`task-title-${index}`}>Tiêu đề *</Label>
                  <Input
                    id={`task-title-${index}`}
                    placeholder="Nhập tiêu đề công việc..."
                    value={task.title}
                    onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`task-description-${index}`}>Mô tả</Label>
                  <Textarea
                    id={`task-description-${index}`}
                    placeholder="Mô tả chi tiết công việc..."
                    value={task.description}
                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú HR</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="hrNotes"
              rows={4}
              placeholder="Ghi chú cho quá trình onboarding..."
              value={formData.hrNotes}
              onChange={(e) => setFormData({ ...formData, hrNotes: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={creating}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={creating}>
            <Save className="mr-2 h-4 w-4" />
            {creating ? 'Đang tạo...' : 'Tạo Onboarding'}
          </Button>
        </div>
      </form>
    </div>
  );
}
