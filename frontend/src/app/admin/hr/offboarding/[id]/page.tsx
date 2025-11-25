'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useOffboardingProcess, useUpdateOffboardingProcess, useCompleteOffboarding } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  UserMinus,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Key,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { OffboardingStatus, ClearanceStatus } from '@/types/hr';

export default function OffboardingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { offboardingProcess, loading, refetch } = useOffboardingProcess(id);
  const { updateOffboardingProcess, loading: updating } = useUpdateOffboardingProcess();
  const { completeOffboarding, loading: completing } = useCompleteOffboarding();

  const process = offboardingProcess;

  const handleUpdateStatus = async (newStatus: OffboardingStatus) => {
    try {
      await updateOffboardingProcess(id, { status: newStatus });
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái offboarding',
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

  const handleComplete = async () => {
    try {
      await completeOffboarding(id);
      toast({
        title: 'Thành công',
        description: 'Đã hoàn thành offboarding',
        type: 'success',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể hoàn thành offboarding',
        type: 'error',
      });
    }
  };

  const getStatusBadge = (status: OffboardingStatus) => {
    const statusConfig: Record<OffboardingStatus, { variant: 'secondary' | 'default' | 'destructive', icon: any, label: string, className?: string }> = {
      [OffboardingStatus.INITIATED]: { variant: 'secondary', icon: AlertCircle, label: 'Khởi tạo' },
      [OffboardingStatus.IN_PROGRESS]: { variant: 'default', icon: Clock, label: 'Đang xử lý' },
      [OffboardingStatus.PENDING_APPROVAL]: { variant: 'default', icon: AlertTriangle, label: 'Chờ phê duyệt', className: 'bg-yellow-500' },
      [OffboardingStatus.APPROVED]: { variant: 'default', icon: CheckCircle2, label: 'Đã phê duyệt', className: 'bg-blue-500' },
      [OffboardingStatus.COMPLETED]: { variant: 'default', icon: CheckCircle2, label: 'Hoàn thành', className: 'bg-green-500' },
      [OffboardingStatus.CANCELLED]: { variant: 'destructive', icon: XCircle, label: 'Đã hủy' },
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

  const getClearanceBadge = (status: ClearanceStatus) => {
    const clearanceConfig: Record<ClearanceStatus, { variant: 'secondary' | 'default', label: string, className?: string }> = {
      [ClearanceStatus.PENDING]: { variant: 'secondary', label: 'Chưa hoàn tất' },
      [ClearanceStatus.PARTIAL]: { variant: 'default', label: 'Một phần', className: 'bg-orange-500' },
      [ClearanceStatus.COMPLETE]: { variant: 'default', label: 'Hoàn tất', className: 'bg-green-500' },
    };
    const config = clearanceConfig[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
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

  if (!process) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserMinus className="mx-auto h-12 w-12 mb-2" />
            <p>Không tìm thấy thông tin offboarding</p>
            <Link href="/admin/hr/offboarding">
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
          <Link href="/admin/hr/offboarding">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Offboarding - {process.employeeProfile?.fullName || 'N/A'}
            </h1>
            <p className="text-muted-foreground">
              {process.employeeProfile?.employeeCode || '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(process.status)}
          {getClearanceBadge(process.clearanceStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Overview */}
        <div className="space-y-6">
          {/* Exit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nghỉ việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lý do</p>
                <p className="text-sm">{process.exitReason}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loại</p>
                <p className="text-sm">
                  {process.exitType === 'RESIGNATION' ? 'Từ chức' :
                   process.exitType === 'TERMINATION' ? 'Chấm dứt HĐ' :
                   process.exitType === 'RETIREMENT' ? 'Nghỉ hưu' :
                   process.exitType === 'CONTRACT_END' ? 'Hết hợp đồng' :
                   'Thỏa thuận chung'}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày cuối làm việc</p>
                <p className="text-sm flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(process.lastWorkingDay).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {process.effectiveDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày có hiệu lực</p>
                  <p className="text-sm flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(process.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exit Interview */}
          {process.exitInterviewScheduled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Phỏng vấn nghỉ việc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {process.exitInterviewDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày phỏng vấn</p>
                    <p className="text-sm">
                      {new Date(process.exitInterviewDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {process.exitInterviewBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Người phỏng vấn</p>
                    <p className="text-sm">{process.exitInterviewBy}</p>
                  </div>
                )}
                {process.exitInterviewNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Ghi chú</p>
                    <p className="text-sm p-3 bg-muted rounded-lg">{process.exitInterviewNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rehire Eligibility */}
          {process.eligibleForRehire !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Tái tuyển dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={process.eligibleForRehire} disabled />
                  <span className="text-sm">
                    {process.eligibleForRehire ? 'Đủ điều kiện tái tuyển dụng' : 'Không đủ điều kiện'}
                  </span>
                </div>
                {process.rehireNotes && (
                  <p className="text-sm text-muted-foreground mt-2">{process.rehireNotes}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {process.status === OffboardingStatus.INITIATED && (
                <Button
                  className="w-full"
                  onClick={() => handleUpdateStatus(OffboardingStatus.IN_PROGRESS)}
                  disabled={updating}
                >
                  Bắt đầu xử lý
                </Button>
              )}
              {process.status === OffboardingStatus.IN_PROGRESS && (
                <Button
                  className="w-full"
                  onClick={() => handleUpdateStatus(OffboardingStatus.PENDING_APPROVAL)}
                  disabled={updating}
                >
                  Gửi phê duyệt
                </Button>
              )}
              {process.status === OffboardingStatus.PENDING_APPROVAL && (
                <Button
                  className="w-full"
                  onClick={() => handleUpdateStatus(OffboardingStatus.APPROVED)}
                  disabled={updating}
                >
                  Phê duyệt
                </Button>
              )}
              {process.status === OffboardingStatus.APPROVED && (
                <Button
                  className="w-full"
                  onClick={handleComplete}
                  disabled={completing || process.clearanceStatus !== ClearanceStatus.COMPLETE}
                >
                  Hoàn thành offboarding
                </Button>
              )}
              {[OffboardingStatus.INITIATED, OffboardingStatus.IN_PROGRESS].includes(process.status) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleUpdateStatus(OffboardingStatus.CANCELLED)}
                  disabled={updating}
                >
                  Hủy offboarding
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Asset Return Checklist */}
          {process.assetReturnChecklist && process.assetReturnChecklist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Danh sách tài sản cần trả
                </CardTitle>
                <CardDescription>Theo dõi việc trả lại tài sản công ty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {process.assetReturnChecklist.map((asset: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <Checkbox checked={asset.returned} disabled />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{asset.asset}</p>
                        <p className="text-xs text-muted-foreground">{asset.category}</p>
                        {asset.returned && asset.returnedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Đã trả: {new Date(asset.returnedDate).toLocaleDateString('vi-VN')}
                            {asset.returnedTo && ` - Người nhận: ${asset.returnedTo}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Knowledge Transfer */}
          {process.knowledgeTransferPlan && process.knowledgeTransferPlan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Kế hoạch bàn giao công việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {process.knowledgeTransferPlan.map((item: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.task}</p>
                          <p className="text-xs text-muted-foreground">{item.area}</p>
                          <p className="text-xs mt-1">Bàn giao cho: {item.assignedTo}</p>
                        </div>
                        <Badge
                          variant={
                            item.status === 'Completed' ? 'default' :
                            item.status === 'In Progress' ? 'default' : 'secondary'
                          }
                          className={
                            item.status === 'Completed' ? 'bg-green-500' :
                            item.status === 'In Progress' ? 'bg-blue-500' : ''
                          }
                        >
                          {item.status === 'Completed' ? 'Hoàn thành' :
                           item.status === 'In Progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Access Revocation */}
          {process.accessRevocationList && process.accessRevocationList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Thu hồi quyền truy cập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {process.accessRevocationList.map((access: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={access.revoked} disabled />
                        <span className="text-sm">{access.system}</span>
                      </div>
                      {access.revoked && access.revokedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(access.revokedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Settlement */}
          {process.finalSalaryAmount !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Quyết toán cuối cùng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {process.finalSalaryAmount && (
                    <div>
                      <p className="text-muted-foreground">Lương cuối:</p>
                      <p className="font-medium">{process.finalSalaryAmount.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  )}
                  {process.unusedLeaveDays && (
                    <div>
                      <p className="text-muted-foreground">Ngày phép chưa dùng:</p>
                      <p className="font-medium">{process.unusedLeaveDays} ngày</p>
                    </div>
                  )}
                  {process.leavePayoutAmount && (
                    <div>
                      <p className="text-muted-foreground">Thanh toán phép:</p>
                      <p className="font-medium">{process.leavePayoutAmount.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  )}
                  {process.bonusAmount && (
                    <div>
                      <p className="text-muted-foreground">Thưởng:</p>
                      <p className="font-medium">{process.bonusAmount.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  )}
                </div>
                <Separator />
                {process.totalSettlement && (
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{process.totalSettlement.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                {process.paymentDate && (
                  <div className="text-sm text-muted-foreground">
                    Ngày thanh toán: {new Date(process.paymentDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú & Nhận xét</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.hrNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Ghi chú HR</p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{process.hrNotes}</p>
                </div>
              )}
              {process.managerComments && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Nhận xét của quản lý</p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{process.managerComments}</p>
                </div>
              )}
              {process.employeeComments && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Nhận xét của nhân viên</p>
                  <p className="text-sm p-3 bg-muted rounded-lg">{process.employeeComments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Link */}
          {process.employeeProfile && (
            <Link href={`/admin/hr/employee/${process.employeeProfileId}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Xem hồ sơ nhân viên</h3>
                        <p className="text-sm text-muted-foreground">
                          {process.employeeProfile.fullName}
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
