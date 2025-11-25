'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient, gql } from '@apollo/client';
import ProjectSidebar from '@/components/project-management/ProjectSidebar';
import TaskFeed from '@/components/project-management/TaskFeed';
import ChatPanel from '@/components/project-management/ChatPanel';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddMember } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const apolloClient = useApolloClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Add member hook
  const [addMember, { loading: addMemberLoading }] = useAddMember();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        console.log('[ProjectsPage] No access token found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr || '{}');
        setUserId(user.id);
        setIsAuthenticated(true);
        console.log('[ProjectsPage] User authenticated:', user.id);
      } catch (error) {
        console.error('[ProjectsPage] Error parsing user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle invite member
  const handleInviteMember = async (email: string, role: string, projectId?: string, validatedUserId?: string) => {
    try {
      console.log('[ProjectsPage] Inviting member:', { email, role, projectId, validatedUserId });

      // Determine which project to add to
      const targetProjectId = projectId || selectedProjectId;
      
      if (!targetProjectId) {
        toast({
          title: '❌ Lỗi',
          description: 'Vui lòng chọn dự án trước khi mời thành viên',
          type: 'error',
          variant: 'destructive',
        });
        return;
      }

      // If userId is provided from validation, use it directly
      let userIdToAdd = validatedUserId;

      // Otherwise, query to find user by email
      if (!userIdToAdd) {
        const { data: userData } = await apolloClient.query({
          query: gql`
            query FindUserByEmail($input: UnifiedFindManyInput, $modelName: String!) {
              findMany(modelName: $modelName, input: $input)
            }
          `,
          variables: {
            modelName: 'user',
            input: {
              where: {
                email: {
                  equals: email.trim().toLowerCase(),
                },
              },
              select: {
                id: true,
                email: true,
              },
            },
          },
          fetchPolicy: 'network-only',
        });

        let users = userData?.findMany;
        if (typeof users === 'string') {
          users = JSON.parse(users);
        }

        if (!users || !Array.isArray(users) || users.length === 0) {
          toast({
            title: '❌ Người dùng không tồn tại',
            description: `Email "${email}" chưa được đăng ký trong hệ thống`,
            type: 'error',
            variant: 'destructive',
          });
          return;
        }

        userIdToAdd = users[0].id;
      }

      // Add member to project
      await addMember({
        variables: {
          projectId: targetProjectId,
          input: {
            userId: userIdToAdd,
            role: role.toLowerCase(),
          },
        },
      });

      toast({
        title: '✅ Thành công',
        description: `Đã thêm thành viên vào dự án`,
        type: 'success',
        variant: 'default',
      });

      setIsInviteDialogOpen(false);

    } catch (error: any) {
      console.error('[ProjectsPage] Error inviting member:', error);
      
      const errorMessage = error.message || 'Không thể thêm thành viên';
      
      toast({
        title: '❌ Lỗi',
        description: errorMessage,
        type: 'error',
        variant: 'destructive',
      });
    }
  };

  // Handle open invite dialog
  const handleOpenInviteDialog = (projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    setIsInviteDialogOpen(true);
  };

  // Show loading state - Mobile First
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary sm:h-12 sm:w-12" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background md:flex-row">
      {/* Mobile: Tabs View, Desktop: 3-Panel Layout */}
      <div className="flex-1 flex flex-col md:hidden">
        {/* Mobile Tabs */}
        <Tabs defaultValue="tasks" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-auto">
            <TabsTrigger value="projects" className="gap-2 text-xs py-3">
              <FolderKanban className="h-4 w-4" />
              <span>Dự án</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 text-xs py-3">
              <ListTodo className="h-4 w-4" />
              <span>Công việc</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 text-xs py-3">
              <MessageSquare className="h-4 w-4" />
              <span>Trò chuyện</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex">
            <ProjectSidebar
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onInviteClick={handleOpenInviteDialog}
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex">
            <TaskFeed projectId={selectedProjectId} />
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex">
            <ChatPanel projectId={selectedProjectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: 3-Panel Layout */}
      <div className="hidden md:flex md:flex-1 md:overflow-hidden">
        {/* Left Sidebar - Projects List */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out border-r",
            showSidebar 
              ? "w-80 lg:w-[320px]" 
              : "w-0"
          )}
        >
          <div className={cn(
            "h-full overflow-hidden",
            !showSidebar && "hidden"
          )}>
            <ProjectSidebar
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onInviteClick={handleOpenInviteDialog}
            />
          </div>
        </div>

        {/* Center - Task Feed */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Feed Header with Toggle Buttons */}
          <div className="h-11 border-b flex items-center justify-between px-3 bg-muted/30 lg:h-12 lg:px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="gap-2 h-8"
            >
              {showSidebar ? (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span className="text-xs lg:text-sm">Ẩn dự án</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="text-xs lg:text-sm">Hiện dự án</span>
                </>
              )}
            </Button>

            <div className="text-xs font-medium text-muted-foreground lg:text-sm">
              {selectedProjectId ? 'Công việc dự án' : 'Tất cả công việc'}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="gap-2 h-8"
            >
              {showChat ? (
                <>
                  <span className="text-xs lg:text-sm">Ẩn chat</span>
                  <PanelRightClose className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-xs lg:text-sm">Hiện chat</span>
                  <PanelRightOpen className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Task Feed Content */}
          <div className="flex-1 overflow-hidden">
            <TaskFeed projectId={selectedProjectId} />
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out border-l",
            showChat 
              ? "w-80 lg:w-[320px]" 
              : "w-0"
          )}
        >
          <div className={cn(
            "h-full overflow-hidden",
            !showChat && "hidden"
          )}>
            <ChatPanel projectId={selectedProjectId} />
          </div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <InviteMemberDialog 
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={handleInviteMember}
        loading={addMemberLoading}
        selectedProjectId={selectedProjectId}
      />
    </div>
  );
}

export default ProjectsPage;
