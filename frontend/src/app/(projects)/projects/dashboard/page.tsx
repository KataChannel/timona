'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useApolloClient } from '@apollo/client';
import { AnalyticsDashboard } from '@/components/project-management/AnalyticsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { useFindMany } from '@/hooks/useDynamicGraphQL';
import { useAddMember } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity,
  UserPlus,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const apolloClient = useApolloClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add member hook
  const [addMember, { loading: addMemberLoading }] = useAddMember();

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        console.log('[Dashboard] No access token, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr || '{}');
        setUserId(user.id);
        setIsAuthenticated(true);
        console.log('[Dashboard] User authenticated:', user.id);
      } catch (error) {
        console.error('[Dashboard] Error parsing user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch Projects
  const { 
    data: projectsData, 
    loading: projectsLoading,
    refetch: refetchProjects 
  } = useFindMany('project', {
    where: userId ? {
      OR: [
        { ownerId: { equals: userId } },
        { members: { some: { userId: { equals: userId } } } }
      ]
    } : undefined,
    include: {
      members: true,
      tasks: true,
    },
    orderBy: { createdAt: 'desc' }
  }, { 
    skip: !userId,
    requireAuth: true 
  });

  // Fetch Tasks
  const { 
    data: tasksData, 
    loading: tasksLoading 
  } = useFindMany('task', {
    where: userId ? {
      OR: [
        { assignedTo: { has: userId } },
        { project: { 
          OR: [
            { ownerId: { equals: userId } },
            { members: { some: { userId: { equals: userId } } } }
          ]
        }}
      ]
    } : undefined,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  }, { 
    skip: !userId,
    requireAuth: true 
  });

  // Fetch Team Members
  const { 
    data: membersData, 
    loading: membersLoading 
  } = useFindMany('projectMember', {
    where: userId ? {
      project: {
        OR: [
          { ownerId: { equals: userId } },
          { members: { some: { userId: { equals: userId } } } }
        ]
      }
    } : undefined,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  }, { 
    skip: !userId,
    requireAuth: true 
  });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const projects = projectsData || [];
    const tasks = tasksData || [];
    const members = membersData || [];

    const uniqueMemberIds = new Set(members.map((m: any) => m.userId));
    const totalMembers = uniqueMemberIds.size;

    const activeTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return [
      {
        title: 'Tổng Dự Án',
        value: projects.length.toString(),
        change: `${projects.length} dự án`,
        icon: BarChart3,
        color: 'text-blue-600'
      },
      {
        title: 'Công Việc Đang Làm',
        value: activeTasks.toString(),
        change: `${totalTasks} tổng số`,
        icon: Activity,
        color: 'text-green-600'
      },
      {
        title: 'Thành Viên',
        value: totalMembers.toString(),
        change: `${members.length} vai trò`,
        icon: Users,
        color: 'text-purple-600'
      },
      {
        title: 'Tỷ Lệ Hoàn Thành',
        value: `${completionRate}%`,
        change: `${completedTasks}/${totalTasks} công việc`,
        icon: TrendingUp,
        color: 'text-orange-600'
      },
    ];
  }, [projectsData, tasksData, membersData]);

  // Recent activity from tasks
  const recentActivity = useMemo(() => {
    const tasks = tasksData || [];
    return tasks.slice(0, 5).map((task: any) => {
      const userName = task.user 
        ? `${task.user.firstName || ''} ${task.user.lastName || ''}`.trim() || task.user.email
        : 'Chưa gán';
      
      let action = 'updated';
      let type: 'complete' | 'comment' | 'create' = 'create';
      
      if (task.status === 'COMPLETED') {
        action = 'đã hoàn thành';
        type = 'complete';
      } else if (task.status === 'IN_PROGRESS') {
        action = 'đang làm';
        type = 'comment';
      }

      const updatedAt = new Date(task.updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} ngày trước`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} giờ trước`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} phút trước`;
      } else {
        timeAgo = 'Vừa xong';
      }

      return {
        user: userName,
        action,
        task: task.title,
        time: timeAgo,
        type
      };
    });
  }, [tasksData]);

  // Task breakdown by status
  const taskBreakdown = useMemo(() => {
    const tasks = tasksData || [];
    return {
      pending: tasks.filter((t: any) => t.status === 'PENDING').length,
      inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
    };
  }, [tasksData]);

  const handleInviteMember = async (email: string, role: string, projectId?: string, userId?: string) => {
    try {
      // Validate project selection
      const targetProjectId = projectId || selectedProjectId;
      if (!targetProjectId) {
        toast({
          title: 'Chưa chọn dự án',
          description: 'Vui lòng chọn dự án trước khi thêm thành viên',
          type: 'error',
          variant: 'destructive',
        });
        return;
      }

      let userIdValue = userId;
      let userName = '';

      // If userId not provided, query user by email
      if (!userIdValue) {
        console.log('[Dashboard] User ID not provided, querying by email:', email);

        const { data: userData } = await apolloClient.query({
          query: gql`
            query FindUserByEmail($modelName: String!, $input: UnifiedFindManyInput) {
              findMany(modelName: $modelName, input: $input)
            }
          `,
          variables: {
            modelName: 'user',
            input: {
              where: {
                email: { equals: email.trim().toLowerCase() }
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
              take: 1
            }
          },
          fetchPolicy: 'network-only'
        });

        let users = userData?.findMany;
        
        // Parse JSONObject if it's a string
        if (typeof users === 'string') {
          users = JSON.parse(users);
        }
        
        // Validate user exists
        if (!users || !Array.isArray(users) || users.length === 0) {
          toast({
            title: 'Người dùng không tồn tại',
            description: `Email "${email}" chưa được đăng ký trong hệ thống.`,
            type: 'warning',
            variant: 'destructive',
          });
          return;
        }

        const user = users[0];
        userIdValue = user.id?.trim();
        userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Không có tên';
      }

      // Validate userId
      if (!userIdValue || typeof userIdValue !== 'string' || userIdValue.trim() === '') {
        console.error('[Dashboard] Invalid userId:', userIdValue);
        toast({
          title: 'Lỗi dữ liệu',
          description: 'ID người dùng không hợp lệ',
          type: 'error',
          variant: 'destructive',
        });
        return;
      }
      
      const mutationInput = {
        userId: userIdValue,
        role: role.toLowerCase() as 'owner' | 'admin' | 'member'
      };
      
      console.log('[Dashboard] Adding member:', {
        projectId: targetProjectId,
        userId: userIdValue,
        role: role.toLowerCase(),
        mutationInput: JSON.stringify(mutationInput),
      });
      
      // Add member using custom mutation
      const result = await addMember({
        variables: {
          projectId: targetProjectId,
          input: mutationInput
        }
      });
      
      console.log('[Dashboard] Add member result:', result);

      // Success feedback
      const project = projectsData?.find((p: any) => p.id === targetProjectId);
      const projectName = project?.name || 'dự án';
      
      toast({
        title: '✅ Thành công',
        description: userName 
          ? `Đã thêm ${userName} vào ${projectName}`
          : `Đã thêm thành viên vào ${projectName}`,
        type: 'success',
      });

      setIsInviteDialogOpen(false);
      refetchProjects();

    } catch (error: any) {
      console.error('[Dashboard] Error adding member:', error);
      
      // Handle specific errors
      let errorTitle = 'Lỗi thêm thành viên';
      let errorMessage = 'Có lỗi xảy ra khi thêm thành viên vào dự án';
      
      if (error.message?.includes('already a member')) {
        errorTitle = 'Thành viên đã tồn tại';
        errorMessage = 'Người dùng này đã là thành viên của dự án';
      } else if (error.message?.includes('permission') || error.message?.includes('not allowed')) {
        errorTitle = 'Không có quyền';
        errorMessage = 'Bạn không có quyền thêm thành viên vào dự án này.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Data loading - Mobile First skeleton
  if (projectsLoading || tasksLoading || membersLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="container max-w-7xl mx-auto p-3 space-y-4 sm:p-4 sm:space-y-6 lg:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Bảng điều khiển</h1>
              <p className="text-sm text-muted-foreground mt-1">Đang tải dữ liệu...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse pb-2">
                  <div className="h-3 bg-muted rounded w-20 sm:h-4 sm:w-24"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-12 mb-2 sm:h-8 sm:w-16"></div>
                  <div className="h-2.5 bg-muted rounded w-24 sm:h-3 sm:w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Mobile First: Smaller padding, Desktop: Larger padding */}
      <div className="container max-w-7xl mx-auto p-3 space-y-4 sm:p-4 sm:space-y-5 lg:p-6 lg:space-y-6">
        {/* Header - Mobile First: Stack vertically */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Bảng điều khiển
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Tổng quan dự án và hiệu suất làm việc
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
            {/* Project Selection - Mobile First */}
            {projectsData && projectsData.length > 0 && (
              <div className="w-full sm:w-auto sm:min-w-[240px]">
                <Label htmlFor="dashboard-project" className="text-xs text-muted-foreground mb-2 block sm:hidden">
                  Chọn dự án
                </Label>
                <Combobox
                  options={projectsData.map((project: any) => ({
                    value: project.id,
                    label: project.name
                  }))}
                  value={selectedProjectId || ''}
                  onChange={(value) => setSelectedProjectId(value)}
                  placeholder="Chọn dự án..."
                  searchPlaceholder="Tìm kiếm dự án..."
                  emptyMessage="Không tìm thấy dự án."
                  className="w-full"
                />
              </div>
            )}
            
            {/* Action Buttons - Mobile First: Stack vertically, Desktop: Row */}
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
              <Button 
                className="w-full sm:w-auto"
                onClick={() => setIsInviteDialogOpen(true)}
                disabled={!selectedProjectId}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span className="truncate">Thêm thành viên</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span className="truncate">Lọc thời gian</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile First: 1 column, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium sm:text-sm">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold sm:text-2xl">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs - Mobile First: Full width tabs */}
        <Tabs defaultValue="analytics" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto sm:w-auto sm:inline-flex">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Phân tích
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              Hoạt động
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">
              Công việc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard projectId={selectedProjectId || ''} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Hoạt động gần đây</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cập nhật mới nhất từ nhóm của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0 sm:gap-4 sm:pb-4"
                      >
                        <div className={`
                          mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 sm:h-8 sm:w-8
                          ${activity.type === 'complete' ? 'bg-green-100 dark:bg-green-900/20' : 
                            activity.type === 'comment' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'}
                        `}>
                          {activity.type === 'complete' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />
                          )}
                          {activity.type === 'comment' && (
                            <AlertCircle className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />
                          )}
                          {activity.type === 'create' && (
                            <Activity className="h-3.5 w-3.5 text-purple-600 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs leading-relaxed sm:text-sm">
                            <span className="font-medium">{activity.user}</span>
                            {' '}{activity.action}{' '}
                            <span className="font-medium break-words">{activity.task}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{activity.time}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <Activity className="h-10 w-10 text-muted-foreground/50 mb-3 sm:h-12 sm:w-12" />
                    <p className="text-sm text-muted-foreground text-center">
                      Chưa có hoạt động nào
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Tổng quan công việc</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Thống kê công việc theo trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Task Breakdown - Mobile First: 1 col, Tablet+: 3 cols */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <div className="p-3 border rounded-lg hover:border-primary/50 transition-colors sm:p-4">
                    <div className="text-xs text-muted-foreground sm:text-sm">Chờ xử lý</div>
                    <div className="text-xl font-bold mt-1 sm:text-2xl">{taskBreakdown.pending}</div>
                    <div className="h-1 w-12 bg-amber-500 rounded-full mt-2"></div>
                  </div>
                  <div className="p-3 border rounded-lg hover:border-primary/50 transition-colors sm:p-4">
                    <div className="text-xs text-muted-foreground sm:text-sm">Đang làm</div>
                    <div className="text-xl font-bold mt-1 sm:text-2xl">{taskBreakdown.inProgress}</div>
                    <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="p-3 border rounded-lg hover:border-primary/50 transition-colors sm:p-4">
                    <div className="text-xs text-muted-foreground sm:text-sm">Hoàn thành</div>
                    <div className="text-xl font-bold mt-1 sm:text-2xl">{taskBreakdown.completed}</div>
                    <div className="h-1 w-12 bg-green-500 rounded-full mt-2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <InviteMemberDialog 
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          onInvite={handleInviteMember}
          loading={addMemberLoading}
          projects={projectsData?.map((p: any) => ({ id: p.id, name: p.name })) || []}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      </div>
    </div>
  );
}
