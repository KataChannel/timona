'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEmployeeProfile, useDeleteEmployeeProfile } from '@/hooks/useHR';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Edit,
  Trash2,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { employeeProfile, loading, error } = useEmployeeProfile(id);
  const { deleteEmployeeProfile, loading: deleting } = useDeleteEmployeeProfile();

  const employee = employeeProfile;

  const handleDelete = async () => {
    try {
      const result = await deleteEmployeeProfile(id);
      if (result?.success) {
        toast({
          title: 'Thành công',
          description: result.message,
          type: 'success',
        });
        router.push('/admin/hr/employees');
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa nhân viên',
        type: 'error',
      });
    }
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

  if (error || !employee) {
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/admin/hr/employees">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{employee.fullName}</h1>
            <p className="text-muted-foreground">{employee.employeeCode}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/hr/employee/${id}/documents`}>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Tài liệu
            </Button>
          </Link>
          <Link href={`/admin/hr/employee/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa nhân viên {employee.fullName}? Hành động này không thể
                  hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          {/* Avatar & Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {employee.user?.avatar ? (
                  <img
                    src={employee.user.avatar}
                    alt={employee.fullName}
                    className="w-32 h-32 rounded-full mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <h2 className="text-xl font-bold">{employee.fullName}</h2>
                {employee.displayName && (
                  <p className="text-sm text-muted-foreground">{employee.displayName}</p>
                )}
                <Badge variant={employee.isActive ? 'default' : 'secondary'} className="mt-2">
                  {employee.isActive ? 'Đang làm việc' : 'Không hoạt động'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.user?.email && (
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{employee.user.email}</p>
                  </div>
                </div>
              )}
              {employee.personalPhone && (
                <div className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Điện thoại</p>
                    <p className="text-sm text-muted-foreground">{employee.personalPhone}</p>
                  </div>
                </div>
              )}
              {employee.currentAddress && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Địa chỉ hiện tại</p>
                    <p className="text-sm text-muted-foreground">{employee.currentAddress}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {employee.dateOfBirth && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày sinh:</span>
                  <span>{new Date(employee.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {employee.gender && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giới tính:</span>
                  <span>
                    {employee.gender === 'MALE'
                      ? 'Nam'
                      : employee.gender === 'FEMALE'
                      ? 'Nữ'
                      : 'Khác'}
                  </span>
                </div>
              )}
              {employee.maritalStatus && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tình trạng hôn nhân:</span>
                  <span>
                    {employee.maritalStatus === 'SINGLE'
                      ? 'Độc thân'
                      : employee.maritalStatus === 'MARRIED'
                      ? 'Đã kết hôn'
                      : 'Khác'}
                  </span>
                </div>
              )}
              {employee.nationality && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quốc tịch:</span>
                  <span>{employee.nationality}</span>
                </div>
              )}
              {employee.citizenId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CCCD/CMND:</span>
                  <span>{employee.citizenId}</span>
                </div>
              )}
              {employee.taxCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã số thuế:</span>
                  <span>{employee.taxCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Employment Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Thông tin công việc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {employee.department && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phòng ban</p>
                    <p className="flex items-center mt-1">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      {employee.department}
                    </p>
                  </div>
                )}
                {employee.position && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chức vụ</p>
                    <p className="mt-1">{employee.position}</p>
                  </div>
                )}
                {employee.startDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</p>
                    <p className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(employee.startDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {employee.probationEndDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Kết thúc thử việc
                    </p>
                    <p className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(employee.probationEndDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          {employee.education && employee.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Học vấn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm">{edu.fieldOfStudy}</p>
                    )}
                    {edu.graduationYear && (
                      <p className="text-xs text-muted-foreground">
                        Tốt nghiệp: {edu.graduationYear}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {employee.certifications && employee.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Chứng chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.certifications.map((cert: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h3 className="font-semibold text-sm">{cert.name}</h3>
                      <p className="text-xs text-muted-foreground">{cert.issuingOrganization}</p>
                      {cert.issueDate && (
                        <p className="text-xs mt-1">
                          Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                      {cert.expiryDate && (
                        <p className="text-xs">
                          Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {employee.languages && employee.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="mr-2 h-5 w-5" />
                  Ngoại ngữ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.languages.map((lang: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {lang.language} - {lang.proficiency}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {employee.skills && employee.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kỹ năng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill: string, index: number) => (
                    <Badge key={index}>{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {(employee.emergencyContactName ||
            employee.emergencyContactRelationship ||
            employee.emergencyContactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ khẩn cấp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {employee.emergencyContactName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tên:</span>
                    <span className="text-sm font-medium">{employee.emergencyContactName}</span>
                  </div>
                )}
                {employee.emergencyContactRelationship && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quan hệ:</span>
                    <span className="text-sm">{employee.emergencyContactRelationship}</span>
                  </div>
                )}
                {employee.emergencyContactPhone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Điện thoại:</span>
                    <span className="text-sm">{employee.emergencyContactPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents Link */}
          <Link href={`/admin/hr/employee/${id}/documents`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Tài liệu</h3>
                      <p className="text-sm text-muted-foreground">
                        Xem và quản lý tài liệu nhân viên
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost">Xem tài liệu</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
