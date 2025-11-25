'use client';

import React, { useState, useEffect } from 'react';
import { useMyProjects } from '@/hooks/useProjects.dynamic';
import { Plus, Archive, Users, MessageSquare, CheckSquare, UserPlus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import CreateProjectModal from './CreateProjectModal';
import { DeleteProjectMenu } from './DeleteProjectMenu';

interface ProjectSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onInviteClick?: (projectId: string) => void;
}

export default function ProjectSidebar({
  selectedProjectId,
  onSelectProject,
  onInviteClick,
}: ProjectSidebarProps) {
  const { data, loading, error } = useMyProjects(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering loading state on server
  if (!mounted) {
    return (
      <div className="h-full flex flex-col bg-background border-r">
        <div className="p-3 border-b sm:p-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base font-semibold sm:text-lg">Dự án của tôi</h2>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-7 w-7 p-0 sm:h-8 sm:w-8"
              title="Tạo dự án mới"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-xs text-muted-foreground">Đang tải dự án...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Không thể tải dự án</p>
          <p className="text-xs text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  const projects = data?.myProjects || [];

  return (
    <div className="h-full flex flex-col bg-background border-r">
      {/* Header - Mobile First */}
      <div className="p-3 border-b sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base font-semibold sm:text-lg">Dự án của tôi</h2>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-7 w-7 p-0 sm:h-8 sm:w-8"
            title="Tạo dự án mới"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {projects.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="mb-2">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Chưa có dự án nào
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo dự án đầu tiên
              </Button>
            </div>
          ) : (
            projects.map((project: any) => (
              <ProjectItem
                key={project.id}
                project={project}
                isSelected={project.id === selectedProjectId}
                onClick={() => onSelectProject(project.id)}
                onInviteClick={onInviteClick}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}

// ==================== Project Item Component ====================

interface ProjectItemProps {
  project: any;
  isSelected: boolean;
  onClick: () => void;
  onInviteClick?: (projectId: string) => void;
}

function ProjectItem({ project, isSelected, onClick, onInviteClick }: ProjectItemProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'P';
  };

  const handleInviteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering project selection
    onInviteClick?.(project.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        w-full p-2.5 rounded-lg text-left transition-colors relative group cursor-pointer
        sm:p-3
        ${
          isSelected
            ? 'bg-primary/10 border border-primary shadow-sm'
            : 'hover:bg-accent border border-transparent'
        }
      `}
    >
      {/* Project Header */}
      <div className="flex items-start gap-2.5 mb-2 sm:gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10">
          <AvatarImage src={project.avatar} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {project.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xs truncate sm:text-sm">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-muted-foreground truncate line-clamp-1">
              {project.description}
            </p>
          )}
        </div>

        {/* Action Buttons - Shows on hover (desktop) or always visible (mobile) */}
        <div className="flex items-center gap-1 shrink-0">
          {onInviteClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              onClick={handleInviteClick}
              title="Mời thành viên"
            >
              <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          )}
          <DeleteProjectMenu
            project={project}
            className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      {/* Stats - Mobile First: Compact */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground sm:gap-3">
        <div className="flex items-center gap-1">
          <CheckSquare className="h-3 w-3 shrink-0" />
          <span className="tabular-nums">{project._count?.tasks || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3 shrink-0" />
          <span className="tabular-nums">{project._count?.chatMessages || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 shrink-0" />
          <span className="tabular-nums">{project.members?.length || 0}</span>
        </div>
      </div>

      {/* Role Badge */}
      {project.members?.find((m: any) => m.role === 'owner') && (
        <Badge variant="secondary" className="mt-2 text-xs">
          Chủ sở hữu
        </Badge>
      )}

      {/* Archived Badge */}
      {project.isArchived && (
        <Badge variant="outline" className="mt-2 text-xs">
          <Archive className="h-3 w-3 mr-1" />
          Đã lưu trữ
        </Badge>
      )}
    </div>
  );
}
