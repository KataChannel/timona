'use client';

import React, { useState, useEffect } from 'react';
import { 
  PWAInstallButton, 
  CompactOfflineStatus,
  usePWAContext,
  usePWANetworkStatus,
  usePWAInstallation,
  usePWASync
} from '@/components/pwa';
import { usePWA } from '@/hooks/usePWA';
import { offlineDataService } from '@/services/offlineDataService';
import { Task } from '@/types/task';

export default function PWADemoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isOnline } = usePWANetworkStatus();
  const { isInstalled, canInstall, installationStatus } = usePWAInstallation();
  const { pendingActions, triggerSync } = usePWASync();
  const { showNotification, capabilities } = usePWA();

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const storedTasks = await offlineDataService.getTasks();
      setTasks(storedTasks.sort((a: Task, b: Task) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 'demo-user'
    };

    try {
      await offlineDataService.storeTask(newTask);
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');

      // Show notification if supported
      if (capabilities.hasNotificationSupport) {
        await showNotification('Task Created', {
          body: `"${newTask.title}" has been ${isOnline ? 'created' : 'saved offline'}`,
          tag: 'task-created'
        });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleted = task.status === 'COMPLETED';
    const updatedTask = {
      ...task,
      status: isCompleted ? 'TODO' as const : 'COMPLETED' as const,
      completedAt: isCompleted ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await offlineDataService.storeTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await offlineDataService.deleteTaskOffline(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await showNotification('Notifications Enabled', {
          body: 'You will now receive task updates and sync notifications',
          tag: 'permission-granted'
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          PWA Demo - Task Manager
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Experience offline-first functionality with Progressive Web App features
        </p>
        
        {/* Installation Status */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${isInstalled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
          `}>
            {installationStatus === 'installed' ? '📱 Installed' : 
             installationStatus === 'available' ? '💾 Can Install' : '🌐 Browser Only'}
          </div>
          
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1
            ${isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
          `}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {pendingActions > 0 && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {pendingActions} Pending
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {canInstall && (
            <PWAInstallButton 
              variant="default"
              size="medium"
            />
          )}
          
          {!capabilities.hasNotificationSupport && (
            <button
              onClick={requestNotificationPermission}
              className="
                px-4 py-2 bg-purple-600 text-white rounded-lg font-medium
                hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500
                transition-colors duration-200
              "
            >
              Enable Notifications
            </button>
          )}
          
          {pendingActions > 0 && isOnline && (
            <button
              onClick={triggerSync}
              className="
                px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-colors duration-200
              "
            >
              Sync Now
            </button>
          )}
        </div>
      </div>

      {/* Task Creation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
            placeholder="Enter task title..."
            className="
              flex-1 px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
          />
          <button
            onClick={createTask}
            disabled={!newTaskTitle.trim()}
            className="
              px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            Add Task
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          {isOnline ? 
            'Tasks will be saved and synced to the server' : 
            'Working offline - tasks will sync when connection is restored'
          }
        </p>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
          <CompactOfflineStatus />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Create your first task to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              return (
              <div 
                key={task.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${isCompleted
                      ? 'bg-green-600 border-green-600 text-white' 
                      : 'border-gray-300 hover:border-green-400'
                    }
                    transition-colors duration-200
                  `}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className={`
                    font-medium
                    ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}
                  `}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="
                    p-2 text-red-600 hover:bg-red-50 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-red-500
                    transition-colors duration-200
                  "
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* PWA Features Demo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">PWA Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-4 h-4 rounded-full
                ${capabilities.isStandalone ? 'bg-green-500' : 'bg-gray-300'}
              `} />
              <span className="text-sm">
                Standalone Mode: {capabilities.isStandalone ? 'Active' : 'Browser'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`
                w-4 h-4 rounded-full
                ${capabilities.hasNotificationSupport ? 'bg-green-500' : 'bg-gray-300'}
              `} />
              <span className="text-sm">
                Notifications: {capabilities.hasNotificationSupport ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`
                w-4 h-4 rounded-full
                ${capabilities.canInstall ? 'bg-blue-500' : 'bg-gray-300'}
              `} />
              <span className="text-sm">
                Installable: {capabilities.canInstall ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm">Offline Support: Active</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm">Background Sync: Available</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm">Cache Storage: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}