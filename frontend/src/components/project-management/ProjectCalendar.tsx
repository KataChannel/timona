'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, CheckCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';

// GraphQL Queries
const CALENDAR_QUERY = gql`
  query CalendarView($year: Int!, $month: Int!, $projectId: ID!) {
    calendarMonthView(year: $year, month: $month, projectId: $projectId)
    exportICalendar(projectId: $projectId)
    calendarStatistics(
      startDate: $startDate
      endDate: $endDate
      projectId: $projectId
    )
  }
`;

interface ProjectCalendarProps {
  projectId: string;
}

interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface CalendarViewData {
  tasks: CalendarTask[];
  tasksByDate: Record<string, CalendarTask[]>;
  summary: {
    total: number;
    completed: number;
    overdue: number;
  };
}

interface CalendarStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Calculate date range for statistics
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);
  const startDate = monthStart.toISOString();
  const endDate = monthEnd.toISOString();

  const { data, loading, error } = useQuery(CALENDAR_QUERY, {
    variables: {
      year,
      month,
      projectId,
      startDate,
      endDate,
    },
    skip: !projectId,
  });

  // Parse calendar data
  const calendarData = useMemo(() => {
    if (!data?.calendarMonthView) return null;
    return JSON.parse(data.calendarMonthView) as CalendarViewData;
  }, [data?.calendarMonthView]);

  // Parse statistics
  const stats = useMemo(() => {
    if (!data?.calendarStatistics) return null;
    return JSON.parse(data.calendarStatistics) as CalendarStats;
  }, [data?.calendarStatistics]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate || !calendarData?.tasksByDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return calendarData.tasksByDate[dateKey] || [];
  }, [selectedDate, calendarData?.tasksByDate]);

  // Handle calendar date click
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  // Handle iCal export
  const handleExportICal = () => {
    if (!data?.exportICalendar) return;

    const icalData = data.exportICalendar;
    const blob = new Blob([icalData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tasks-${projectId}-${year}-${String(month).padStart(2, '0')}.ics`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      URGENT: 'text-red-600',
      HIGH: 'text-orange-600',
      MEDIUM: 'text-yellow-600',
      LOW: 'text-blue-600',
    };
    return priorityMap[priority] || 'text-gray-600';
  };

  if (error) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          Failed to load calendar: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <CalendarLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                {new Date(year, month - 1).toLocaleDateString('vi-VN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleExportICal} className="gap-2">
              <Download className="h-4 w-4" />
              Export iCal
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(year, month - 2, 1);
                    setDate(newDate);
                  }}
                >
                  ← Previous
                </Button>
                <span className="font-semibold">
                  {new Date(year, month - 1).toLocaleDateString('vi-VN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(year, month, 1);
                    setDate(newDate);
                  }}
                >
                  Next →
                </Button>
              </div>

              {/* Calendar Grid */}
              <CalendarUI
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(newDate) => {
                  if (newDate) handleDateClick(newDate);
                }}
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {calendarData?.summary && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Month Overview</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Tasks</span>
                      <Badge variant="outline">{calendarData.summary.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Completed
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        {calendarData.summary.completed}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Overdue
                      </span>
                      <Badge className="bg-red-100 text-red-800">
                        {calendarData.summary.overdue}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Completion Rate</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (calendarData.summary.completed / (calendarData.summary.total || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(
                      (calendarData.summary.completed / (calendarData.summary.total || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString('vi-VN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedDateTasks.length} task(s) for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDateTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tasks for this date</p>
            ) : (
              selectedDateTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge className={getStatusColor(task.status)} variant="outline">
                          {task.status}
                        </Badge>
                        <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.status === 'COMPLETED' && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-8 w-12 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
