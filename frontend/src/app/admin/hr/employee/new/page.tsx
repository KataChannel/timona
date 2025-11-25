'use client';

import { useRouter } from 'next/navigation';
import { useCreateEmployeeProfile } from '@/hooks/useHR';
import EmployeeForm from '@/components/hr/EmployeeForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { CreateEmployeeProfileInput } from '@/types/hr';

export default function NewEmployeePage() {
  const router = useRouter();
  const { createEmployeeProfile, loading } = useCreateEmployeeProfile();

  const handleSubmit = async (data: CreateEmployeeProfileInput) => {
    await createEmployeeProfile(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/hr/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <UserPlus className="mr-3 h-8 w-8" />
            Thêm nhân viên mới
          </h1>
          <p className="text-muted-foreground">Điền thông tin để tạo hồ sơ nhân viên mới</p>
        </div>
      </div>

      {/* Form */}
      <EmployeeForm mode="create" onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
