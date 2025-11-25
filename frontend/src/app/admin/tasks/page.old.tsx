'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { TaskDashboardView } from '@/components/todos/TaskDashboardView';
import { TaskListView } from '@/components/todos/TaskListView';
import { TaskTableView } from '@/components/todos/TaskTableView';
import { TaskKanbanView } from '@/components/todos/TaskKanbanView';
import { TaskGanttView } from '@/components/todos/TaskGanttView';
import { ViewModeSelector } from '@/components/todos/ViewModeSelector';

import CreateTaskModal from '@/components/todos/CreateTaskModal';
import { useTasks, useSharedTasks, useTaskMutations } from '@/hooks/useTodos';
import { useDynamicTasks } from '@/hooks/useDynamicTasks';
import { TaskStatus, TaskPriority, TaskCategory, Task, CreateTaskInput, UpdateTaskInput } from '@/types/todo';
import { TodoViewMode } from '@/types/todo-views';
import { Plus, Share, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Extended task interface to include shared information
interface ExtendedTask extends Task {
  isShared?: boolean;
  sharedBy?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  sharePermission?: 'VIEW' | 'EDIT' | 'ADMIN';
}

export default function TodosPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<TodoViewMode>(TodoViewMode.DASHBOARD);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'shared'>('all');

  // Dynamic GraphQL hooks
  const {
    tasks: dynamicTasks,
    loading: dynamicLoading,
    createTask: dynamicCreateTask,
    updateTask: dynamicUpdateTask,
    deleteTask: dynamicDeleteTask,
    refetch: dynamicRefetch
  } = useDynamicTasks();

  // Regular tasks hooks
  const { tasks, loading: tasksLoading, refetch } = useTasks();
  const { updateTask, deleteTask } = useTaskMutations();

  // Shared tasks hooks
  const { sharedTasks, loading: sharedTasksLoading, refetch: refetchShared } = useSharedTasks();

  // Process and combine tasks
  const myTasks = useMemo(() => {
    const baseTasks = dynamicTasks?.length > 0 ? dynamicTasks : (tasks || []);
    return baseTasks.map((task: Task): ExtendedTask => ({
      ...task,
      isShared: false
    }));
  }, [dynamicTasks, tasks]);

  const processedSharedTasks = useMemo(() => {
    return (sharedTasks || []).map((task: Task): ExtendedTask => ({
      ...task,
      isShared: true,
      sharedBy: task.author,
      sharePermission: 'VIEW' as const // Default, could be enhanced with actual permission from shares array
    }));
  }, [sharedTasks]);

  const allTasks = useMemo(() => {
    return [...myTasks, ...processedSharedTasks];
  }, [myTasks, processedSharedTasks]);

  const finalTasks = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return myTasks;
      case 'shared':
        return processedSharedTasks;
      default:
        return allTasks;
    }
  }, [activeTab, myTasks, processedSharedTasks, allTasks]);

  const finalLoading = dynamicLoading || tasksLoading || sharedTasksLoading;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Enhanced refetch function for all data
  const refetchAllTasks = async () => {
    await Promise.all([
      dynamicRefetch(),
      refetch(),
      refetchShared()
    ]);
  };

  // 🚀 ENHANCED TASK CREATE với Dynamic GraphQL - TÍNH NĂNG CHÍNH
  const handleTaskCreate = async (initialData?: Partial<CreateTaskInput>) => {
    try {
      if (initialData && initialData.title) {
        const taskData: CreateTaskInput = {
          title: initialData.title,
          description: initialData.description || '',
          category: initialData.category || TaskCategory.PERSONAL,
          priority: initialData.priority || TaskPriority.MEDIUM,
          dueDate: initialData.dueDate
        };

        // 🎯 Dynamic GraphQL Creation với full features
        const createdTask = await dynamicCreateTask(taskData, {
          showToast: true,
          onCreate: (task: Task) => {
            console.log('✅ Task created via Dynamic GraphQL:', task);
            toast.success(`🎉 Tạo thành công: "${task.title}"`);
          }
        });

        return createdTask;
      } else {
        // Hiển thị modal tạo task
        setShowCreateModal(true);
      }
    } catch (error) {
      console.error('❌ Task creation error:', error);
      toast.error(`❌ Lỗi tạo task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  // Enhanced task update với dynamic GraphQL
  const handleTaskUpdate = async (taskId: string, updates: Partial<UpdateTaskInput>) => {
    try {
      await dynamicUpdateTask(taskId, updates, {
        showToast: true,
        onUpdate: (task: Task) => {
          console.log('✅ Task updated via Dynamic GraphQL:', task);
        }
      });
    } catch (error) {
      console.error('❌ Update error:', error);
      // Fallback
      try {
        await updateTask(updates as any);
        toast.success('✅ Cập nhật thành công (fallback)');
        refetch();
      } catch (fallbackError) {
        toast.error('❌ Lỗi cập nhật task');
      }
    }
  };

  // Enhanced task delete với dynamic GraphQL
  const handleTaskDelete = async (taskId: string) => {
    try {
      // Confirm before delete
      if (!confirm('Bạn có chắc chắn muốn xóa task này?')) {
        return;
      }
      
      await dynamicDeleteTask(taskId, {
        showToast: true,
        onDelete: () => {
          console.log('✅ Task deleted via Dynamic GraphQL');
        }
      });
    } catch (error) {
      console.error('❌ Delete error:', error);
      // Fallback
      try {
        await deleteTask(taskId);
        toast.success('✅ Xóa thành công (fallback)');
        refetch();
      } catch (fallbackError) {
        toast.error('❌ Lỗi xóa task');
      }
    }
  };

  // Status change
  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await handleTaskUpdate(taskId, { status });
    } catch (error) {
      console.error('❌ Status change error:', error);
    }
  };

  // Render appropriate view based on selected mode
  const renderTaskView = () => {
    const commonProps = {
      tasks: finalTasks,
      loading: finalLoading,
      onTaskUpdate: handleTaskUpdate,
      onTaskDelete: handleTaskDelete,
      onTaskCreate: handleTaskCreate,
    };

    switch (viewMode) {
      case TodoViewMode.LIST:
        return <TaskListView {...commonProps} />;
      case TodoViewMode.TABLE:
        return <TaskTableView {...commonProps} />;
      case TodoViewMode.KANBAN:
        return <TaskKanbanView {...commonProps} />;
      case TodoViewMode.GANTT:
        return <TaskGanttView {...commonProps} />;
      case TodoViewMode.DASHBOARD:
      default:
        return <TaskDashboardView {...commonProps} />;
    }
  };

  if (loading || finalLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">Quản lý công việc cá nhân và được chia sẻ</p>
          </div>
          <button
            onClick={() => handleTaskCreate()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Tạo Task
          </button>
        </div>

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'my' | 'shared')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Tất cả ({allTasks.length})
            </TabsTrigger>
            <TabsTrigger value="my" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Của tôi ({myTasks.length})
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Được chia sẻ ({processedSharedTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tất cả công việc</h3>
              <p className="text-sm text-gray-600">Bao gồm công việc cá nhân và được chia sẻ từ người khác</p>
            </div>
          </TabsContent>

          <TabsContent value="my" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Công việc của tôi</h3>
              <p className="text-sm text-gray-600">Các công việc do bạn tạo ra</p>
            </div>
          </TabsContent>

          <TabsContent value="shared" className="mt-6">
            <div className="mb-4 flex items-center gap-2">
              <Share className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Công việc được chia sẻ</h3>
                <p className="text-sm text-gray-600">Các công việc mà người khác đã chia sẻ với bạn</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* View Mode Selector */}
        <div className="mb-6">
          <ViewModeSelector
            currentMode={viewMode}
            onModeChange={setViewMode}
          />
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng cộng</p>
                <p className="text-2xl font-bold text-gray-900">{finalTasks.length}</p>
              </div>
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Của tôi</p>
                <p className="text-2xl font-bold text-blue-600">{myTasks.length}</p>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="text-xs">Own</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Được chia sẻ</p>
                <p className="text-2xl font-bold text-green-600">{processedSharedTasks.length}</p>
              </div>
              <div className="flex items-center">
                <Share className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {finalTasks.filter((task: ExtendedTask) => task.status === TaskStatus.COMPLETED).length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Task View */}
        <div className="bg-white rounded-lg border border-gray-200">
          {renderTaskView()}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={() => {
          refetchAllTasks();
        }}
      />
    </div>
  );
}
