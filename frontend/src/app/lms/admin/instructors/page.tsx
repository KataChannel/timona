'use client';

import { useState, useEffect } from 'react';
import { useFindMany, useUpdateOne, useDeleteOne } from '@/hooks/useDynamicGraphQL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  BookOpen,
  Users,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  UserCog,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar: string;
  roleType: string;
  isActive: boolean;
  coursesInstructed: {
    id: string;
    title: string;
    status: string;
  }[];
  _count: {
    coursesInstructed: number;
  };
  createdAt: string;
}

export default function AdminInstructorsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [giangvienRoleId, setGiangvienRoleId] = useState<string>('');

  // Lấy roleId của giangvien role
  const { data: rolesData } = useFindMany<{ id: string; name: string }>('Role', {
    where: {
      name: 'giangvien'
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Set giangvienRoleId khi data về
  useEffect(() => {
    if (rolesData && rolesData.length > 0) {
      setGiangvienRoleId(rolesData[0].id);
    }
  }, [rolesData]);

  // Lấy danh sách giảng viên hiện tại (users có role giangvien)
  const { data: instructors = [], loading, error, refetch } = useFindMany<User>('User', {
    where: {
      userRoles: {
        some: {
          role: {
            name: 'giangvien'
          }
        }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      avatar: true,
      roleType: true,
      isActive: true,
      createdAt: true,
    },
    include: {
      coursesInstructed: {
        select: {
          id: true,
          title: true,
          status: true,
        }
      },
      _count: {
        select: {
          coursesInstructed: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Lấy danh sách tất cả user KHÔNG có role giangvien (để phân quyền)
  const { data: availableUsers = [], loading: usersLoading, refetch: refetchUsers } = useFindMany<User>('User', {
    where: {
      userRoles: {
        none: {
          role: {
            name: 'giangvien'
          }
        }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      roleType: true,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const [updateUser, { loading: updateLoading }] = useUpdateOne('User');
  const [deleteUser, { loading: deleteLoading }] = useDeleteOne('User');

  const filteredInstructors = instructors.filter(instructor =>
    instructor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (instructor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (instructor.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (instructor.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.firstName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.lastName || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleAssignClick = () => {
    setSelectedUserId('');
    setUserSearchTerm('');
    setAssignDialogOpen(true);
  };

  const handleEditClick = (instructor: User) => {
    setSelectedUser(instructor);
    setEditDialogOpen(true);
  };

  const handleRevokeClick = (instructor: User) => {
    setSelectedUser(instructor);
    setRevokeDialogOpen(true);
  };

  // Phân quyền user thành giảng viên
  const handleAssignInstructor = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn user để phân quyền',
        type: 'error',
      });
      return;
    }

    if (!giangvienRoleId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy role giảng viên',
        type: 'error',
      });
      return;
    }

    try {
      // Gọi assignRoleToUser mutation
      const token = localStorage.getItem('accessToken');
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:13001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation AssignRoleToUser($userId: String!, $roleId: String!) {
              assignRoleToUser(userId: $userId, roleId: $roleId) {
                id
                userId
                roleId
              }
            }
          `,
          variables: {
            userId: selectedUserId,
            roleId: giangvienRoleId,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Lỗi khi phân quyền');
      }

      toast({
        title: 'Thành công',
        description: 'Đã phân quyền giảng viên thành công',
        type: 'success',
      });

      setAssignDialogOpen(false);
      setSelectedUserId('');
      refetch();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể phân quyền giảng viên',
        type: 'error',
      });
    }
  };

  // Cập nhật trạng thái active
  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await updateUser({
        where: { id: userId },
        data: { isActive },
      });

      toast({
        title: 'Thành công',
        description: `Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
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

  // Thu hồi quyền giảng viên (chuyển về USER)
  const handleRevokeInstructor = async () => {
    if (!selectedUser || !giangvienRoleId) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      // Gọi GraphQL mutation removeRoleFromUser
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:13001/graphql';
      
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation RemoveRoleFromUser($userId: String!, $roleId: String!) {
              removeRoleFromUser(userId: $userId, roleId: $roleId) {
                success
                message
              }
            }
          `,
          variables: {
            userId: selectedUser.id,
            roleId: giangvienRoleId,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Lỗi khi thu hồi quyền');
      }

      if (!result.data?.removeRoleFromUser?.success) {
        throw new Error(result.data?.removeRoleFromUser?.message || 'Không thể thu hồi quyền');
      }

      toast({
        title: 'Thành công',
        description: 'Đã thu hồi quyền giảng viên',
        type: 'success',
      });

      setRevokeDialogOpen(false);
      setSelectedUser(null);
      refetch();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể thu hồi quyền',
        type: 'error',
      });
    }
  };

  const getFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-300';
      case 'USER': return 'bg-green-100 text-green-800 border-green-300';
      case 'GUEST': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý giảng viên</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Tổng cộng {instructors.length} giảng viên | {availableUsers.length} user có thể phân quyền
          </p>
        </div>
        <Button onClick={handleAssignClick} className="gap-2">
          <UserCog className="w-4 h-4" />
          <span className="hidden sm:inline">Phân quyền giảng viên</span>
          <span className="sm:hidden">Phân quyền</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm giảng viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Instructors List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Lỗi: {error.message}</p>
          </CardContent>
        </Card>
      ) : filteredInstructors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy giảng viên nào</p>
            <Button onClick={handleAssignClick} className="mt-4 gap-2">
              <UserCog className="w-4 h-4" />
              Phân quyền user làm giảng viên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInstructors.map((instructor) => (
            <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {instructor.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {getFullName(instructor)}
                        {instructor.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge className={getRoleBadgeColor(instructor.roleType)}>
                          <Shield className="w-3 h-3 mr-1" />
                          GIẢNG VIÊN
                        </Badge>
                        <span className="text-xs ml-2">@{instructor.username}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={instructor.isActive}
                        onCheckedChange={(checked) => handleUpdateStatus(instructor.id, checked)}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {instructor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{instructor.email}</span>
                    </div>
                  )}
                  {instructor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{instructor.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xl font-bold">{instructor._count?.coursesInstructed || 0}</p>
                      <p className="text-xs text-gray-500">Khóa học</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xl font-bold">0</p>
                      <p className="text-xs text-gray-500">Học viên</p>
                    </div>
                  </div>
                </div>

                {/* Courses Preview */}
                {instructor.coursesInstructed && instructor.coursesInstructed.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Khóa học đang dạy:</p>
                    <div className="space-y-1">
                      {instructor.coursesInstructed.slice(0, 3).map((course: any) => (
                        <div key={course.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate flex-1">{course.title}</span>
                          <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'} className="ml-2 text-xs">
                            {course.status === 'PUBLISHED' ? 'Public' : 'Draft'}
                          </Badge>
                        </div>
                      ))}
                      {instructor.coursesInstructed.length > 3 && (
                        <p className="text-xs text-gray-500">+{instructor.coursesInstructed.length - 3} khóa khác</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Khóa học</span>
                    <span className="sm:hidden">Khóa học ({instructor._count?.coursesInstructed || 0})</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                    onClick={() => handleRevokeClick(instructor)}
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Thu hồi</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Assign Instructor Dialog - Phân quyền từ User */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Phân quyền giảng viên
            </DialogTitle>
            <DialogDescription>
              Chọn user từ hệ thống để phân quyền làm giảng viên. Có {availableUsers.length} user khả dụng.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col py-2">
            {/* Search */}
            <div className="px-1 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm user..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User List */}
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-2 pr-4">
                {usersLoading ? (
                  <div className="text-center py-8 text-gray-500">Đang tải...</div>
                ) : filteredAvailableUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy user nào
                  </div>
                ) : (
                  filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {getFullName(user)}
                            </h4>
                            <Badge className={getRoleBadgeColor(user.roleType)} variant="outline">
                              {user.roleType}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">@{user.username}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedUserId === user.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedUserId('');
                setUserSearchTerm('');
              }}
              disabled={updateLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button
              onClick={handleAssignInstructor}
              disabled={updateLoading || !selectedUserId}
            >
              <Shield className="w-4 h-4 mr-2" />
              {updateLoading ? 'Đang phân quyền...' : 'Phân quyền'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Instructor Dialog - Thu hồi quyền */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi quyền giảng viên</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3 p-4">
            <p className="text-sm text-gray-500">
              Bạn có chắc chắn muốn thu hồi quyền giảng viên của{' '}
              <span className="font-semibold">
                {selectedUser ? getFullName(selectedUser) : ''}
              </span>
              ?
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              User sẽ được chuyển về quyền <strong>USER</strong> thông thường.
            </div>
            {selectedUser && selectedUser._count?.coursesInstructed > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Giảng viên này đang dạy <strong>{selectedUser._count.coursesInstructed} khóa học</strong>!
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInstructor}
              disabled={updateLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {updateLoading ? 'Đang thu hồi...' : 'Thu hồi quyền'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
