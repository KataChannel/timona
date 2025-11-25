'use client';

import React, { useState } from 'react';
import { useDynamicTasks } from '@/hooks/useDynamicTasks';
import { TaskCategory, TaskPriority, CreateTaskInput } from '@/types/todo';
import { Plus, Copy, Play } from 'lucide-react';
import { toast } from 'sonner';

interface DynamicTaskDemoProps {
  onTaskCreated?: () => void;
}

export const DynamicTaskDemo: React.FC<DynamicTaskDemoProps> = ({ onTaskCreated }) => {
  const [isDemo, setIsDemo] = useState(false);
  
  // Safe hooks usage với error boundary
  let dynamicHooks;
  try {
    dynamicHooks = useDynamicTasks();
  } catch (error) {
    console.error('❌ Dynamic hooks error:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">
          ⚠️ Dynamic GraphQL Error
        </h3>
        <p className="mt-2 text-sm text-red-600">
          Không thể tải Dynamic GraphQL hooks. Vui lòng kiểm tra kết nối backend.
        </p>
      </div>
    );
  }

  const {
    createTask,
    createTasksBulk,
    updateTask,
    deleteTask,
    quickActions,
    statistics,
    loading
  } = dynamicHooks;

  // Demo: Tạo single task
  const handleDemoSingleTask = async () => {
    try {
      setIsDemo(true);
      
      const demoTask: CreateTaskInput = {
        title: `🚀 Demo Task - ${new Date().toLocaleTimeString()}`,
        description: 'Task được tạo bằng Dynamic GraphQL với đầy đủ tính năng CRUD',
        category: TaskCategory.WORK,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 giờ
      };

      const result = await createTask(demoTask, {
        showToast: true,
        onCreate: (task) => {
          console.log('✅ Demo task created:', task);
        }
      });

      onTaskCreated?.();
      return result;
    } catch (error) {
      console.error('❌ Demo single task error:', error);
    } finally {
      setIsDemo(false);
    }
  };

  // Demo: Tạo bulk tasks
  const handleDemoBulkTasks = async () => {
    try {
      setIsDemo(true);
      
      const bulkTasks: CreateTaskInput[] = [
        {
          title: '📊 Báo cáo tuần',
          description: 'Hoàn thành báo cáo tuần cho quản lý',
          category: TaskCategory.WORK,
          priority: TaskPriority.HIGH,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          title: '📧 Trả lời emails',
          description: 'Xử lý và trả lời các emails quan trọng',
          category: TaskCategory.WORK,
          priority: TaskPriority.MEDIUM
        },
        {
          title: '💪 Tập thể dục',
          description: 'Buổi tập gym chiều',
          category: TaskCategory.PERSONAL,
          priority: TaskPriority.LOW,
          dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        },
        {
          title: '📚 Đọc sách',
          description: 'Đọc 1 chương sách về công nghệ',
          category: TaskCategory.STUDY,
          priority: TaskPriority.MEDIUM
        },
        {
          title: '🛒 Mua sắm',
          description: 'Mua thực phẩm cho tuần mới',
          category: TaskCategory.PERSONAL,
          priority: TaskPriority.LOW
        }
      ];

      const result = await createTasksBulk(bulkTasks, {
        showProgress: true,
        showToast: true,
        onProgress: (progress) => {
          console.log(`📊 Bulk Progress: ${progress.completed}/${progress.total}`);
        },
        onCompleted: (result) => {
          console.log('✅ Bulk demo completed:', result);
          toast.success(`🎉 Tạo thành công ${result.count}/${bulkTasks.length} demo tasks!`);
        }
      });

      onTaskCreated?.();
      return result;
    } catch (error) {
      console.error('❌ Demo bulk tasks error:', error);
    } finally {
      setIsDemo(false);
    }
  };

  // Demo: Quick actions
  const handleQuickActionsDemo = async () => {
    try {
      setIsDemo(true);
      
      // Tạo task để demo quick actions
      const demoTask = await createTask({
        title: '⚡ Quick Actions Demo Task',
        description: 'Task để demo các quick actions',
        category: TaskCategory.WORK,
        priority: TaskPriority.MEDIUM
      });

      if (demoTask) {
        // Demo các quick actions
        setTimeout(async () => {
          await quickActions.markAsInProgress(demoTask.id);
          toast.success('🔄 Marked as In Progress');
          
          setTimeout(async () => {
            await quickActions.setPriority(demoTask.id, TaskPriority.HIGH);
            toast.success('🚨 Set to High Priority');
            
            setTimeout(async () => {
              await quickActions.markAsCompleted(demoTask.id);
              toast.success('✅ Marked as Completed');
            }, 2000);
          }, 2000);
        }, 1000);
      }

      onTaskCreated?.();
    } catch (error) {
      console.error('❌ Quick actions demo error:', error);
    } finally {
      setTimeout(() => setIsDemo(false), 6000); // Tổng thời gian demo
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          🚀 Dynamic GraphQL Demo
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Thử nghiệm các tính năng Dynamic GraphQL với CRUD operations đầy đủ
        </p>
      </div>

      {/* Statistics Display với safe check */}
      {statistics && typeof statistics === 'object' && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">📊 Thống kê hiện tại:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total || 0}</div>
              <div className="text-gray-500">Tổng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.completed || 0}</div>
              <div className="text-gray-500">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending || 0}</div>
              <div className="text-gray-500">Chờ xử lý</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.overdue || 0}</div>
              <div className="text-gray-500">Quá hạn</div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Actions */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Single Task Demo */}
          <button
            onClick={handleDemoSingleTask}
            disabled={isDemo || loading}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDemo ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Plus className="-ml-1 mr-2 h-5 w-5" />
            )}
            Single Task Demo
          </button>

          {/* Bulk Tasks Demo */}
          <button
            onClick={handleDemoBulkTasks}
            disabled={isDemo || loading}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDemo ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Copy className="-ml-1 mr-2 h-5 w-5" />
            )}
            Bulk Tasks Demo (5)
          </button>

          {/* Quick Actions Demo */}
          <button
            onClick={handleQuickActionsDemo}
            disabled={isDemo || loading}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDemo ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Play className="-ml-1 mr-2 h-5 w-5" />
            )}
            Quick Actions Demo
          </button>
        </div>

        {/* Feature List */}
        <div className="mt-6 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">✨ Tính năng được demo:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• ✅ <strong>CREATE</strong>: Tạo task đơn lẻ với validation</li>
            <li>• 📋 <strong>CREATE_BULK</strong>: Tạo nhiều tasks cùng lúc với progress tracking</li>
            <li>• 🔄 <strong>UPDATE</strong>: Cập nhật task với quick actions</li>
            <li>• ❌ <strong>DELETE</strong>: Xóa task với confirmation</li>
            <li>• 📊 <strong>READ_ALL</strong>: Lấy danh sách tasks với statistics</li>
            <li>• ⚡ <strong>Quick Actions</strong>: Status và priority changes</li>
            <li>• 🎯 <strong>Error Handling</strong>: Toast notifications và fallback</li>
            <li>• 🚀 <strong>Performance</strong>: Caching và optimized queries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
