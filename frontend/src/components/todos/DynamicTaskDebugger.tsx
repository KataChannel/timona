'use client';

import React, { useState, useEffect } from 'react';
import { useDynamicTasks } from '@/hooks/useDynamicTasks';
import { TaskCategory, TaskPriority, CreateTaskInput } from '@/types/todo';

// Debug component để test dynamic hooks
export const DynamicTaskDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Test dynamic hooks - destructure specific values
  const dynamicHooks = useDynamicTasks();
  const { tasks, statistics, loading, error, createTask } = dynamicHooks;

  useEffect(() => {
    console.log('🔍 Debug - Dynamic Hooks:', { tasks, statistics, loading, error });
    
    setDebugInfo({
      tasks: {
        data: tasks,
        isArray: Array.isArray(tasks),
        type: typeof tasks,
        length: tasks?.length || 'N/A'
      },
      statistics: {
        data: statistics,
        type: typeof statistics,
        keys: statistics ? Object.keys(statistics) : []
      },
      loading,
      error
    });
  }, [tasks, statistics, loading, error]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-yellow-800 mb-4">
        🔍 Dynamic GraphQL Debug Info
      </h3>
      
      <div className="space-y-4 text-sm">
        <div className="bg-white rounded p-3">
          <h4 className="font-medium text-gray-900">Tasks Data:</h4>
          <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
            {JSON.stringify(debugInfo.tasks, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded p-3">
          <h4 className="font-medium text-gray-900">Statistics:</h4>
          <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
            {JSON.stringify(debugInfo.statistics, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded p-3">
          <h4 className="font-medium text-gray-900">Status:</h4>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            <li>Loading: {String(debugInfo.loading)}</li>
            <li>Error: {debugInfo.error ? 'Yes' : 'No'}</li>
            {debugInfo.error && (
              <li className="text-red-600">Error Message: {debugInfo.error.message}</li>
            )}
          </ul>
        </div>

        {/* Quick Test Button */}
        <button
          onClick={async () => {
            try {
              console.log('🧪 Testing createTask...');
              await createTask({
                title: `Debug Test - ${new Date().toLocaleTimeString()}`,
                description: 'Debug test task',
                category: TaskCategory.WORK,
                priority: TaskPriority.MEDIUM
              });
              console.log('✅ Debug test successful');
            } catch (error) {
              console.error('❌ Debug test failed:', error);
            }
          }}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
        >
          🧪 Test Create Task
        </button>
      </div>
    </div>
  );
};
