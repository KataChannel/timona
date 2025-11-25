'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useOnboardingChecklist, useUpdateOnboardingChecklist, useCompleteOnboardingTask } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  XCircle,
  Edit,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { OnboardingStatus } from '@/types/hr';

export default function OnboardingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { onboardingChecklist, loading, refetch } = useOnboardingChecklist(id);
  const { updateOnboardingChecklist, loading: updating } = useUpdateOnboardingChecklist();
  const { completeOnboardingTask, loading: completingTask } = useCompleteOnboardingTask();

  const checklist = onboardingChecklist;

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const result = await completeOnboardingTask(id, taskId);
      if (result) {
        toast({
          title: 'Thành công',
          description: completed ? 'Đã đánh dấu công việc hoàn thành' : 'Đã hủy hoàn thành',
          type: 'success',
        });
        refetch();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái công việc',
        type: 'error',
      });
    }
  };

  const handleUpdateStatus = async (newStatus: OnboardingStatus) => {
    try {
      await updateOnboardingChecklist(id, { status: newStatus });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái onboarding',
        type: 'success',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái',
        type: 'error',
      });
    }
  };

  const handleSaveFeedback = async () => {
    try {
      await updateOnboardingChecklist(id, { hrNotes: feedback });
      toast({
        title: 'Thành công',
        description: 'Đã lưu ghi chú',
        type: 'success',
      });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu ghi chú',
        type: 'error',
      });
    }
  };

  const getStatusBadge = (status: OnboardingStatus) => {
    const statusConfig: Record<OnboardingStatus, { variant: 'secondary' | 'default' | 'destructive', icon: any, label: string, className?: string }> = {
      [OnboardingStatus.PENDING]: { variant: 'secondary', icon: AlertCircle, label: 'Chờ xử lý' },
      [OnboardingStatus.IN_PROGRESS]: { variant: 'default', icon: Clock, label: 'Đang thực hiện' },
      [OnboardingStatus.COMPLETED]: { variant: 'default', icon: CheckCircle2, label: 'Hoàn thành', className: 'bg-green-500' },
      [OnboardingStatus.CANCELLED]: { variant: 'destructive', icon: XCircle, label: 'Đã hủy' },
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserPlus className="mx-auto h-12 w-12 mb-2" />
            <p>Không tìm thấy thông tin onboarding</p>
            <Link href="/admin/hr/onboarding">
              <Button variant="outline" className="mt-4">
                Quay lại danh sách
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/hr/onboarding">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Onboarding - {checklist.employeeProfile?.fullName || 'N/A'}
            </h1>
            <p className="text-muted-foreground">
              {checklist.employeeProfile?.employeeCode || '-'}
            </p>
          </div>
        </div>
        <div>{getStatusBadge(checklist.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Overview */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{checklist.progressPercentage}%</div>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
              </div>
              <Progress value={checklist.progressPercentage} className="w-full" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng công việc:</span>
                  <span className="font-medium">{checklist.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đã hoàn thành:</span>
                  <span className="font-medium text-green-600">{checklist.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Còn lại:</span>
                  <span className="font-medium text-orange-600">
                    {checklist.totalTasks - checklist.completedTasks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</p>
                <p className="text-sm">
                  {new Date(checklist.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {checklist.targetDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày mục tiêu</p>
                  <p className="text-sm">
                    {new Date(checklist.targetDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
              {checklist.actualCompletionDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày hoàn thành</p>
                  <p className="text-sm">
                    {new Date(checklist.actualCompletionDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Phân công
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.assignedTo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Người phụ trách</p>
                  <p className="text-sm">{checklist.assignedTo}</p>
                </div>
              )}
              {checklist.buddyId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Buddy</p>
                  <p className="text-sm">{checklist.buddyId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist.status === OnboardingStatus.PENDING && (
                <Button
                  className="w-full"
                  onClick={() => handleUpdateStatus(OnboardingStatus.IN_PROGRESS)}
                  disabled={updating}
                >
                  Bắt đầu onboarding
                </Button>
              )}
              {checklist.status === OnboardingStatus.IN_PROGRESS && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleUpdateStatus(OnboardingStatus.COMPLETED)}
                    disabled={updating || checklist.progressPercentage < 100}
                  >
                    Hoàn thành onboarding
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleUpdateStatus(OnboardingStatus.CANCELLED)}
                    disabled={updating}
                  >
                    Hủy onboarding
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tasks & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách công việc</CardTitle>
              <CardDescription>
                Đánh dấu hoàn thành các công việc trong quá trình onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.tasks && checklist.tasks.length > 0 ? (
                  checklist.tasks.map((task: any, index: number) => (
                    <div
                      key={task.id || index}
                      className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`task-${index}`}
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          handleToggleTask(task.id, checked as boolean)
                        }
                        disabled={completingTask || checklist.status === OnboardingStatus.COMPLETED}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`task-${index}`}
                          className={`text-sm font-medium cursor-pointer ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </label>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          {task.completedAt && (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có công việc nào được gán
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ghi chú & Phản hồi</span>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setFeedback(checklist.hrNotes || '');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.employeeFeedback && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Phản hồi từ nhân viên
                  </p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{checklist.employeeFeedback}</p>
                </div>
              )}

              {checklist.managerFeedback && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Phản hồi từ quản lý
                  </p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{checklist.managerFeedback}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Ghi chú HR</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      placeholder="Nhập ghi chú..."
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveFeedback} disabled={updating}>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {checklist.hrNotes || 'Chưa có ghi chú'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee Link */}
          {checklist.employeeProfile && (
            <Link href={`/admin/hr/employee/${checklist.employeeProfileId}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Xem hồ sơ nhân viên</h3>
                        <p className="text-sm text-muted-foreground">
                          {checklist.employeeProfile.fullName}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost">Xem chi tiết</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
