'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Save, X } from 'lucide-react';
import {
  EmployeeProfile,
  CreateEmployeeProfileInput,
  UpdateEmployeeProfileInput,
  Gender,
  MaritalStatus,
  ContractType,
} from '@/types/hr';

interface EmployeeFormProps {
  employee?: EmployeeProfile;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export default function EmployeeForm({ employee, onSubmit, loading, mode }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: employee
      ? {
          userId: employee.userId,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          displayName: employee.displayName || '',
          citizenId: employee.citizenId || '',
          dateOfBirth: employee.dateOfBirth || '',
          placeOfBirth: employee.placeOfBirth || '',
          gender: employee.gender || 'MALE',
          maritalStatus: employee.maritalStatus || 'SINGLE',
          nationality: employee.nationality || '',
          personalEmail: employee.personalEmail || '',
          personalPhone: employee.personalPhone || '',
          currentAddress: employee.currentAddress || '',
          city: employee.city || '',
          district: employee.district || '',
          ward: employee.ward || '',
          department: employee.department || '',
          position: employee.position || '',
          level: employee.level || '',
          team: employee.team || '',
          directManager: employee.directManager || '',
          startDate: employee.startDate || '',
          probationEndDate: employee.probationEndDate || '',
          contractType: employee.contractType || 'FULL_TIME',
          workLocation: employee.workLocation || '',
          taxCode: employee.taxCode || '',
          bankName: employee.bankName || '',
          bankAccountNumber: employee.bankAccountNumber || '',
          bankAccountName: employee.bankAccountName || '',
          emergencyContactName: employee.emergencyContactName || '',
          emergencyContactRelationship: employee.emergencyContactRelationship || '',
          emergencyContactPhone: employee.emergencyContactPhone || '',
          notes: employee.notes || '',
        }
      : {
          userId: '',
          employeeCode: '',
          fullName: '',
          displayName: '',
          gender: 'MALE',
          maritalStatus: 'SINGLE',
          contractType: 'FULL_TIME',
        },
  });

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Thành công',
        description: mode === 'create' ? 'Đã tạo nhân viên mới' : 'Đã cập nhật thông tin nhân viên',
        type: 'success',
      });
      router.push('/admin/hr/employees');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu thông tin nhân viên',
        type: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Mã nhân viên *</Label>
              <Input
                id="employeeCode"
                {...register('employeeCode', { required: 'Mã nhân viên là bắt buộc' })}
                disabled={mode === 'edit'}
              />
              {errors.employeeCode && (
                <p className="text-sm text-red-500">{errors.employeeCode.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                {...register('userId', { required: 'User ID là bắt buộc' })}
                disabled={mode === 'edit'}
              />
              {errors.userId && (
                <p className="text-sm text-red-500">{errors.userId.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                {...register('fullName', { required: 'Họ và tên là bắt buộc' })}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input id="displayName" {...register('displayName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Tình trạng hôn nhân</Label>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Độc thân</SelectItem>
                      <SelectItem value="MARRIED">Đã kết hôn</SelectItem>
                      <SelectItem value="DIVORCED">Ly hôn</SelectItem>
                      <SelectItem value="WIDOWED">Góa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizenId">CCCD/CMND</Label>
              <Input id="citizenId" {...register('citizenId')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế</Label>
              <Input id="taxCode" {...register('taxCode')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Quốc tịch</Label>
              <Input id="nationality" {...register('nationality')} defaultValue="Việt Nam" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personalEmail">Email cá nhân</Label>
              <Input id="personalEmail" type="email" {...register('personalEmail')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalPhone">Số điện thoại</Label>
              <Input id="personalPhone" {...register('personalPhone')} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentAddress">Địa chỉ hiện tại</Label>
              <Input id="currentAddress" {...register('currentAddress')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Thành phố</Label>
              <Input id="city" {...register('city')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input id="district" {...register('district')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <Input id="ward" {...register('ward')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin công việc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Input id="department" {...register('department')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Input id="position" {...register('position')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Cấp bậc</Label>
              <Input id="level" {...register('level')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Nhóm/Team</Label>
              <Input id="team" {...register('team')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directManager">Quản lý trực tiếp</Label>
              <Input id="directManager" {...register('directManager')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probationEndDate">Kết thúc thử việc</Label>
              <Input id="probationEndDate" type="date" {...register('probationEndDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractType">Loại hợp đồng</Label>
              <Controller
                name="contractType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                      <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                      <SelectItem value="CONTRACT">Hợp đồng</SelectItem>
                      <SelectItem value="INTERNSHIP">Thực tập</SelectItem>
                      <SelectItem value="PROBATION">Thử việc</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLocation">Địa điểm làm việc</Label>
              <Input id="workLocation" {...register('workLocation')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin ngân hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Ngân hàng</Label>
              <Input id="bankName" {...register('bankName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
              <Input id="bankAccountNumber" {...register('bankAccountNumber')} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bankAccountName">Tên chủ tài khoản</Label>
              <Input id="bankAccountName" {...register('bankAccountName')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Liên hệ khẩn cấp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Họ tên</Label>
              <Input id="emergencyContactName" {...register('emergencyContactName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">Mối quan hệ</Label>
              <Input
                id="emergencyContactRelationship"
                {...register('emergencyContactRelationship')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Số điện thoại</Label>
              <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            rows={4}
            placeholder="Thông tin bổ sung..."
            {...register('notes')}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" />
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  );
}
