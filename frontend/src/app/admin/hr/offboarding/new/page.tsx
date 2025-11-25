'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOffboardingProcess, useEmployeeProfiles } from '@/hooks/useHR';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserMinus, Save } from 'lucide-react';
import Link from 'next/link';
import { TerminationType } from '@/types/hr';

export default function NewOffboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { employees, loading: loadingEmployees } = useEmployeeProfiles({ take: 100 });
  const { createOffboardingProcess, loading: creating } = useCreateOffboardingProcess();

  const [formData, setFormData] = useState({
    employeeProfileId: '',
    userId: '',
    lastWorkingDay: '',
    effectiveDate: '',
    exitReason: '',
    exitType: 'RESIGNATION' as TerminationType,
    noticePeriodDays: 30,
    noticeGivenDate: new Date().toISOString().split('T')[0],
    exitInterviewScheduled: false,
    exitInterviewDate: '',
    exitInterviewBy: '',
    referenceLetterRequested: false,
    eligibleForRehire: true,
    initiatedBy: '',
    hrNotes: '',
  });

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

    if (!formData.lastWorkingDay) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập ngày cuối làm việc',
        type: 'error',
      });
      return;
    }

    if (!formData.exitReason) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do nghỉ việc',
        type: 'error',
      });
      return;
    }

    if (!formData.initiatedBy) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập người khởi tạo',
        type: 'error',
      });
      return;
    }

    try {
      await createOffboardingProcess({
        employeeProfileId: formData.employeeProfileId,
        userId: formData.userId,
        lastWorkingDay: formData.lastWorkingDay,
        effectiveDate: formData.effectiveDate || undefined,
        exitReason: formData.exitReason,
        exitType: formData.exitType,
        noticePeriodDays: formData.noticePeriodDays || undefined,
        noticeGivenDate: formData.noticeGivenDate || undefined,
        exitInterviewScheduled: formData.exitInterviewScheduled,
        exitInterviewDate: formData.exitInterviewDate || undefined,
        exitInterviewBy: formData.exitInterviewBy || undefined,
        referenceLetterRequested: formData.referenceLetterRequested,
        eligibleForRehire: formData.eligibleForRehire,
        initiatedBy: formData.initiatedBy,
        hrNotes: formData.hrNotes || undefined,
      });

      toast({
        title: 'Thành công',
        description: 'Đã khởi tạo offboarding process',
        type: 'success',
      });

      router.push('/admin/hr/offboarding');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể khởi tạo offboarding',
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/hr/offboarding">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserMinus className="mr-3 h-8 w-8" />
            Khởi tạo Offboarding
          </h1>
          <p className="text-muted-foreground">Bắt đầu quy trình nghỉ việc cho nhân viên</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
            <CardDescription>Chọn nhân viên cần offboarding</CardDescription>
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

        {/* Exit Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nghỉ việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exitType">Loại nghỉ việc *</Label>
                <Select
                  value={formData.exitType}
                  onValueChange={(value) => setFormData({ ...formData, exitType: value as TerminationType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIGNATION">Từ chức</SelectItem>
                    <SelectItem value="TERMINATION">Chấm dứt hợp đồng</SelectItem>
                    <SelectItem value="RETIREMENT">Nghỉ hưu</SelectItem>
                    <SelectItem value="CONTRACT_END">Hết hợp đồng</SelectItem>
                    <SelectItem value="MUTUAL_AGREEMENT">Thỏa thuận chung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastWorkingDay">Ngày cuối làm việc *</Label>
                <Input
                  id="lastWorkingDay"
                  type="date"
                  value={formData.lastWorkingDay}
                  onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Ngày có hiệu lực</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticeGivenDate">Ngày thông báo</Label>
                <Input
                  id="noticeGivenDate"
                  type="date"
                  value={formData.noticeGivenDate}
                  onChange={(e) => setFormData({ ...formData, noticeGivenDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticePeriodDays">Thời gian báo trước (ngày)</Label>
                <Input
                  id="noticePeriodDays"
                  type="number"
                  value={formData.noticePeriodDays}
                  onChange={(e) => setFormData({ ...formData, noticePeriodDays: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitReason">Lý do nghỉ việc *</Label>
              <Textarea
                id="exitReason"
                rows={3}
                placeholder="Nhập lý do nghỉ việc..."
                value={formData.exitReason}
                onChange={(e) => setFormData({ ...formData, exitReason: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Exit Interview */}
        <Card>
          <CardHeader>
            <CardTitle>Phỏng vấn nghỉ việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exitInterviewScheduled"
                checked={formData.exitInterviewScheduled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, exitInterviewScheduled: checked as boolean })
                }
              />
              <Label htmlFor="exitInterviewScheduled" className="cursor-pointer">
                Lên lịch phỏng vấn nghỉ việc
              </Label>
            </div>

            {formData.exitInterviewScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="exitInterviewDate">Ngày phỏng vấn</Label>
                  <Input
                    id="exitInterviewDate"
                    type="date"
                    value={formData.exitInterviewDate}
                    onChange={(e) => setFormData({ ...formData, exitInterviewDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exitInterviewBy">Người phỏng vấn</Label>
                  <Input
                    id="exitInterviewBy"
                    placeholder="Tên người phỏng vấn..."
                    value={formData.exitInterviewBy}
                    onChange={(e) => setFormData({ ...formData, exitInterviewBy: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn bổ sung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="referenceLetterRequested"
                checked={formData.referenceLetterRequested}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, referenceLetterRequested: checked as boolean })
                }
              />
              <Label htmlFor="referenceLetterRequested" className="cursor-pointer">
                Yêu cầu thư giới thiệu
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="eligibleForRehire"
                checked={formData.eligibleForRehire}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, eligibleForRehire: checked as boolean })
                }
              />
              <Label htmlFor="eligibleForRehire" className="cursor-pointer">
                Đủ điều kiện tái tuyển dụng
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Process Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin quy trình</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initiatedBy">Người khởi tạo *</Label>
              <Input
                id="initiatedBy"
                placeholder="Tên người khởi tạo quy trình..."
                value={formData.initiatedBy}
                onChange={(e) => setFormData({ ...formData, initiatedBy: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hrNotes">Ghi chú HR</Label>
              <Textarea
                id="hrNotes"
                rows={4}
                placeholder="Ghi chú cho quá trình offboarding..."
                value={formData.hrNotes}
                onChange={(e) => setFormData({ ...formData, hrNotes: e.target.value })}
              />
            </div>
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
            {creating ? 'Đang tạo...' : 'Khởi tạo Offboarding'}
          </Button>
        </div>
      </form>
    </div>
  );
}
