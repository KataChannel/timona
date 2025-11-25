'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEmployeeProfile, useUpdateEmployeeProfile } from '@/hooks/useHR';
import EmployeeForm from '@/components/hr/EmployeeForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit, User } from 'lucide-react';
import Link from 'next/link';
import { UpdateEmployeeProfileInput } from '@/types/hr';

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { employeeProfile, loading: loadingEmployee } = useEmployeeProfile(id);
  const { updateEmployeeProfile, loading: updating } = useUpdateEmployeeProfile();

  const handleSubmit = async (data: UpdateEmployeeProfileInput) => {
    await updateEmployeeProfile(id, data);
  };

  if (loadingEmployee) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!employeeProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="mx-auto h-12 w-12 mb-2" />
            <p>Không tìm thấy thông tin nhân viên</p>
            <Link href="/admin/hr/employees">
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
      <div className="flex items-center space-x-4">
        <Link href={`/admin/hr/employee/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Edit className="mr-3 h-8 w-8" />
            Chỉnh sửa nhân viên
          </h1>
          <p className="text-muted-foreground">
            {employeeProfile.fullName} - {employeeProfile.employeeCode}
          </p>
        </div>
      </div>

      {/* Form */}
      <EmployeeForm
        mode="edit"
        employee={employeeProfile}
        onSubmit={handleSubmit}
        loading={updating}
      />
    </div>
  );
}
