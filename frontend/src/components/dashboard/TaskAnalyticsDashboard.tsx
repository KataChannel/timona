'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types/task';

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  priorityDistribution: Record<TaskPriority, number>;
  statusDistribution: Record<TaskStatus, number>;
  dailyProgress: Array<{
    date: string;
    created: number;
    completed: number;
    remaining: number;
  }>;
  productivityScore: number;
  trends: {
    completionRate: 'up' | 'down' | 'stable';
    productivity: 'up' | 'down' | 'stable';
    velocity: 'up' | 'down' | 'stable';
  };
}

interface TaskAnalyticsDashboardProps {
  tasks: Task[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  className?: string;
}

export function TaskAnalyticsDashboard({ 
  tasks, 
  dateRange,
  className = '' 
}: TaskAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'trends' | 'distribution'>('overview');
  const [animationKey, setAnimationKey] = useState(0);

  // Filter tasks by date range
  const filteredTasks = useMemo(() => {
    if (!dateRange) return tasks;
    
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= dateRange.start && taskDate <= dateRange.end;
    });
  }, [tasks, dateRange]);

  // Calculate analytics
  const analytics = useMemo((): TaskAnalytics => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'COMPLETED').length;
    const pendingTasks = filteredTasks.filter(task => 
      task.status === 'TODO' || task.status === 'IN_PROGRESS'
    ).length;
    
    const now = new Date();
    const overdueTasks = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED'
    ).length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate average completion time
    const completedTasksWithDates = filteredTasks.filter(task => 
      task.status === 'COMPLETED' && task.completedAt && task.createdAt
    );
    
    const averageCompletionTime = completedTasksWithDates.length > 0
      ? completedTasksWithDates.reduce((sum, task) => {
          const created = new Date(task.createdAt).getTime();
          const completed = new Date(task.completedAt!).getTime();
          return sum + (completed - created);
        }, 0) / completedTasksWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;
    
    // Priority distribution
    const priorityDistribution: Record<TaskPriority, number> = {
      LOW: filteredTasks.filter(task => task.priority === 'LOW').length,
      MEDIUM: filteredTasks.filter(task => task.priority === 'MEDIUM').length,
      HIGH: filteredTasks.filter(task => task.priority === 'HIGH').length,
      URGENT: filteredTasks.filter(task => task.priority === 'URGENT').length,
    };
    
    // Status distribution
    const statusDistribution: Record<TaskStatus, number> = {
      TODO: filteredTasks.filter(task => task.status === 'TODO').length,
      IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS').length,
      COMPLETED: filteredTasks.filter(task => task.status === 'COMPLETED').length,
      CANCELLED: filteredTasks.filter(task => task.status === 'CANCELLED').length,
    };
    
    // Daily progress (last 7 days)
    const dailyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const created = filteredTasks.filter(task => {
        const taskCreated = typeof task.createdAt === 'string' ? task.createdAt : task.createdAt.toISOString();
        return taskCreated.startsWith(dateStr);
      }).length;
      
      const completed = filteredTasks.filter(task => {
        if (!task.completedAt) return false;
        const taskCompleted = typeof task.completedAt === 'string' ? task.completedAt : task.completedAt.toISOString();
        return taskCompleted.startsWith(dateStr);
      }).length;
      
      const remaining = filteredTasks.filter(task => 
        new Date(task.createdAt) <= date && task.status !== 'COMPLETED'
      ).length;
      
      return { date: dateStr, created, completed, remaining };
    }).reverse();
    
    // Productivity score (0-100)
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + 
      (Math.max(0, 100 - overdueTasks * 10) * 0.3) +
      (Math.min(100, averageCompletionTime > 0 ? 100 / averageCompletionTime : 50) * 0.3)
    ));
    
    // Calculate trends (simplified)
    const recentCompletion = dailyProgress.slice(-3).reduce((sum, day) => sum + day.completed, 0);
    const olderCompletion = dailyProgress.slice(0, 3).reduce((sum, day) => sum + day.completed, 0);
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      priorityDistribution,
      statusDistribution,
      dailyProgress,
      productivityScore,
      trends: {
        completionRate: recentCompletion > olderCompletion ? 'up' : recentCompletion < olderCompletion ? 'down' : 'stable',
        productivity: productivityScore >= 75 ? 'up' : productivityScore >= 50 ? 'stable' : 'down',
        velocity: recentCompletion >= 3 ? 'up' : recentCompletion >= 1 ? 'stable' : 'down',
      },
    };
  }, [filteredTasks]);

  // Animation trigger
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [analytics]);

  // Metric card component
  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    subtitle?: string;
  }> = ({ title, value, unit = '', trend, color = 'blue', subtitle }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const trendIcons = {
      up: '↗️',
      down: '↘️',
      stable: '→',
    };

    return (
      <div className={`p-4 rounded-lg border ${colorClasses[color]} transition-all duration-500 hover:shadow-md`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          {trend && (
            <span className="text-xs opacity-60">{trendIcons[trend]}</span>
          )}
        </div>
        
        <div className="mb-1">
          <span className="text-2xl font-bold animate-pulse" key={`${animationKey}-${value}`}>
            {value}
          </span>
          {unit && <span className="text-sm ml-1 opacity-60">{unit}</span>}
        </div>
        
        {subtitle && (
          <p className="text-xs opacity-60">{subtitle}</p>
        )}
      </div>
    );
  };

  // Progress bar component
  const ProgressBar: React.FC<{
    value: number;
    max: number;
    color?: string;
    showLabel?: boolean;
  }> = ({ value, max, color = 'bg-blue-500', showLabel = true }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          {showLabel && (
            <span className="text-sm text-gray-600">
              {value} / {max}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {percentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    );
  };

  // Chart component for daily progress
  const DailyProgressChart: React.FC = () => {
    const maxValue = Math.max(...analytics.dailyProgress.map(day => 
      Math.max(day.created, day.completed, day.remaining)
    ));

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Daily Progress (Last 7 Days)</h4>
        
        <div className="flex items-end space-x-1 h-32">
          {analytics.dailyProgress.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center space-y-1">
              {/* Bars */}
              <div className="w-full flex flex-col items-center space-y-1 flex-grow justify-end">
                {/* Completed */}
                <div 
                  className="w-full bg-green-500 rounded-sm transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${maxValue > 0 ? (day.completed / maxValue) * 80 : 0}px`,
                    animationDelay: `${index * 100}ms`
                  }}
                  title={`Completed: ${day.completed}`}
                />
                
                {/* Created */}
                <div 
                  className="w-full bg-blue-500 rounded-sm transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${maxValue > 0 ? (day.created / maxValue) * 80 : 0}px`,
                    animationDelay: `${index * 100 + 50}ms`
                  }}
                  title={`Created: ${day.created}`}
                />
              </div>
              
              {/* Date */}
              <span className="text-xs text-gray-500 transform rotate-45 origin-center">
                {new Date(day.date).getDate()}
              </span>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" />
            <span className="text-xs text-gray-600">Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-xs text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    );
  };

  // Priority distribution chart
  const PriorityChart: React.FC = () => {
    const total = Object.values(analytics.priorityDistribution).reduce((sum, count) => sum + count, 0);
    
    const priorityColors = {
      LOW: 'bg-gray-400',
      MEDIUM: 'bg-blue-400',
      HIGH: 'bg-orange-400',
      URGENT: 'bg-red-500',
    };

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Priority Distribution</h4>
        
        <div className="space-y-3">
          {(Object.entries(analytics.priorityDistribution) as Array<[TaskPriority, number]>).map(([priority, count]) => (
            <div key={priority} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-16">{priority}</span>
              <div className="flex-1">
                <ProgressBar 
                  value={count} 
                  max={total} 
                  color={priorityColors[priority]}
                  showLabel={false}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`task-analytics-dashboard space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Task Analytics</h2>
        
        {/* Metric selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['overview', 'trends', 'distribution'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`
                px-3 py-1 text-sm font-medium rounded-md transition-all
                ${selectedMetric === metric 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tasks"
            value={analytics.totalTasks}
            color="blue"
          />
          
          <MetricCard
            title="Completed"
            value={analytics.completedTasks}
            color="green"
            trend={analytics.trends.completionRate}
          />
          
          <MetricCard
            title="Pending"
            value={analytics.pendingTasks}
            color="yellow"
          />
          
          <MetricCard
            title="Overdue"
            value={analytics.overdueTasks}
            color="red"
          />
          
          <MetricCard
            title="Completion Rate"
            value={analytics.completionRate.toFixed(1)}
            unit="%"
            color="purple"
            trend={analytics.trends.completionRate}
          />
          
          <MetricCard
            title="Avg. Completion"
            value={analytics.averageCompletionTime.toFixed(1)}
            unit="days"
            color="blue"
          />
          
          <MetricCard
            title="Productivity Score"
            value={analytics.productivityScore}
            unit="/100"
            color={analytics.productivityScore >= 75 ? 'green' : analytics.productivityScore >= 50 ? 'yellow' : 'red'}
            trend={analytics.trends.productivity}
          />
          
          <MetricCard
            title="Velocity"
            value={analytics.dailyProgress.slice(-1)[0]?.completed || 0}
            unit="today"
            color="purple"
            trend={analytics.trends.velocity}
            subtitle="Tasks completed today"
          />
        </div>
      )}

      {/* Trends Section */}
      {selectedMetric === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily progress chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <DailyProgressChart />
          </div>
          
          {/* Completion rate progress */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Overall Progress</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Task Completion</label>
                <ProgressBar 
                  value={analytics.completedTasks} 
                  max={analytics.totalTasks} 
                  color="bg-green-500"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Productivity Score</label>
                <ProgressBar 
                  value={analytics.productivityScore} 
                  max={100} 
                  color={analytics.productivityScore >= 75 ? 'bg-green-500' : analytics.productivityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Section */}
      {selectedMetric === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <PriorityChart />
          </div>
          
          {/* Status distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Status Distribution</h4>
              
              <div className="space-y-3">
                {(Object.entries(analytics.statusDistribution) as Array<[TaskStatus, number]>).map(([status, count]) => {
                  const total = Object.values(analytics.statusDistribution).reduce((sum, c) => sum + c, 0);
                  const statusColors: Record<TaskStatus, string> = {
                    TODO: 'bg-gray-400',
                    IN_PROGRESS: 'bg-blue-500',
                    COMPLETED: 'bg-green-500',
                    CANCELLED: 'bg-red-400',
                  };
                  
                  return (
                    <div key={status} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-24">{status.replace('_', ' ')}</span>
                      <div className="flex-1">
                        <ProgressBar 
                          value={count} 
                          max={total} 
                          color={statusColors[status]}
                          showLabel={false}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}