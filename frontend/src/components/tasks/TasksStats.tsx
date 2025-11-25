'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TasksStatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    highPriority: number;
    overdue: number;
  };
}

export function TasksStats({ stats }: TasksStatsProps) {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Target,
      description: 'All tasks',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Circle,
      description: 'Not started yet',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      description: 'Currently working on',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      description: 'Successfully done',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: AlertCircle,
      description: 'Urgent tasks',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Completion Rate',
      value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%',
      icon: TrendingUp,
      description: 'Overall progress',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
