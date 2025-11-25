'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Users, Target, Calendar, Zap } from 'lucide-react';

// GraphQL Queries
const PROJECT_ANALYTICS_QUERY = gql`
  query ProjectAnalytics($projectId: ID!) {
    projectAnalytics(projectId: $projectId)
    taskStatistics(projectId: $projectId)
    memberStatistics(projectId: $projectId)
    taskVelocity(projectId: $projectId, days: 30)
    projectHealthScore(projectId: $projectId)
    upcomingDeadlines(projectId: $projectId)
    overdueTasks(projectId: $projectId)
    tagStatistics(projectId: $projectId)
  }
`;

// Color schemes
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const HEALTH_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
};

interface AnalyticsDashboardProps {
  projectId: string;
}

interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  totalMembers: number;
  completionRate: number;
  averageCompletionTime: string | { averageDays: number; averageHours: number; totalCompleted: number };
}

interface TaskStatistics {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

interface MemberStats {
  userId: string;
  userName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  averageCompletionTime: string | { averageDays: number; averageHours: number; totalCompleted: number };
}

interface VelocityData {
  date: string;
  tasksCompleted: number;
}

interface TagStat {
  tag: string;
  count: number;
}

export function AnalyticsDashboard({ projectId }: AnalyticsDashboardProps) {
  const { data, loading, error } = useQuery(PROJECT_ANALYTICS_QUERY, {
    variables: { projectId },
    skip: !projectId,
  });

  const [selectedTab, setSelectedTab] = useState('tong-quan');

  // Parse JSON strings from GraphQL responses
  const parsedData = useMemo(() => {
    if (!data) return null;

    try {
      const healthScoreData = JSON.parse(data.projectHealthScore || '{"score":0,"status":"poor","factors":{}}');
      const velocityData = JSON.parse(data.taskVelocity || '{"totalCompleted":0,"averagePerDay":0,"chart":[]}');
      const analyticsData = JSON.parse(data.projectAnalytics || '{}');
      
      // Extract completion rate properly
      const completionRateData = analyticsData.completionRate || { total: 0, completed: 0, rate: 0 };
      const completionRate = typeof completionRateData === 'object' ? completionRateData.rate : completionRateData;
      
      return {
        analytics: {
          ...analyticsData,
          completionRate: completionRate || 0,
          totalTasks: analyticsData.taskStats?.total || completionRateData.total || 0,
          completedTasks: completionRateData.completed || 0,
          totalMembers: analyticsData.memberStats?.length || 0,
        },
        taskStats: JSON.parse(data.taskStatistics || '{}') as TaskStatistics,
        memberStats: JSON.parse(data.memberStatistics || '[]') as MemberStats[],
        velocity: velocityData.chart || [],
        velocityTotal: velocityData.totalCompleted || 0,
        velocityAverage: velocityData.averagePerDay || 0,
        healthScore: healthScoreData.score || 0,
        healthStatus: healthScoreData.status || 'poor',
        healthFactors: healthScoreData.factors || {},
        upcomingDeadlines: JSON.parse(data.upcomingDeadlines || '[]'),
        overdueTasks: JSON.parse(data.overdueTasks || '[]'),
        tagStats: JSON.parse(data.tagStatistics || '[]') as TagStat[],
      };
    } catch (error) {
      console.error('[AnalyticsDashboard] Error parsing data:', error);
      return null;
    }
  }, [data]);

  if (error) {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          Failed to load analytics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!parsedData) {
    return null;
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Xuất sắc', color: HEALTH_COLORS.excellent };
    if (score >= 60) return { label: 'Tốt', color: HEALTH_COLORS.good };
    if (score >= 40) return { label: 'Khá', color: HEALTH_COLORS.fair };
    return { label: 'Kém', color: HEALTH_COLORS.poor };
  };

  const healthStatus = getHealthStatus(parsedData.healthScore);
  const taskStatusData = Object.entries(parsedData.taskStats.byStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const priorityData = Object.entries(parsedData.taskStats.byPriority || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Health Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tình trạng dự án</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{parsedData.healthScore}</div>
                <p className="text-xs md:text-sm text-gray-500">{healthStatus.label}</p>
              </div>
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: healthStatus.color + '20' }}
              >
                <Zap className="h-5 w-5 md:h-6 md:w-6" style={{ color: healthStatus.color }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{parsedData.analytics.completionRate.toFixed(1)}%</div>
                <p className="text-xs md:text-sm text-gray-500">
                  {parsedData.analytics.completedTasks}/{parsedData.analytics.totalTasks}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-blue-100">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quy mô nhóm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{parsedData.analytics.totalMembers}</div>
                <p className="text-xs md:text-sm text-gray-500">Thành viên hoạt động</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-green-100">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Công việc đang làm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{parsedData.analytics.inProgressTasks}</div>
                <p className="text-xs md:text-sm text-gray-500">Đang tiến hành</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-yellow-100">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="tong-quan" className="text-xs md:text-sm">Tổng quan</TabsTrigger>
          <TabsTrigger value="toc-do" className="text-xs md:text-sm">Tốc độ</TabsTrigger>
          <TabsTrigger value="nhom" className="text-xs md:text-sm">Nhóm</TabsTrigger>
          <TabsTrigger value="chi-tiet" className="text-xs md:text-sm">Chi tiết</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="tong-quan" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Phân bổ trạng thái công việc</CardTitle>
                <CardDescription className="text-xs md:text-sm">Công việc theo trạng thái hiện tại</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Phân bổ độ ưu tiên</CardTitle>
                <CardDescription className="text-xs md:text-sm">Công việc theo mức độ ưu tiên</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {parsedData.overdueTasks.length > 0 && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-xs md:text-sm">
                  {parsedData.overdueTasks.length} công việc đã quá hạn. Cần xử lý ngay!
                </AlertDescription>
              </Alert>
            )}

            {parsedData.upcomingDeadlines.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs md:text-sm">
                  {parsedData.upcomingDeadlines.length} công việc sắp đến hạn (trong 7 ngày)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Velocity Tab */}
        <TabsContent value="toc-do" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Tốc độ hoàn thành (30 ngày gần nhất)</CardTitle>
              <CardDescription className="text-xs md:text-sm">Số công việc hoàn thành mỗi ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
                <LineChart data={parsedData.velocity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    dot={{ fill: '#10b981' }}
                    name="Hoàn thành"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="nhom" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Hiệu suất thành viên</CardTitle>
              <CardDescription className="text-xs md:text-sm">Tỷ lệ hoàn thành cá nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {parsedData.memberStats.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm md:text-base">{member.userName}</p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {member.tasksCompleted}/{member.tasksAssigned} hoàn thành
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base md:text-lg font-bold">{member.completionRate.toFixed(0)}%</div>
                      <p className="text-xs md:text-sm text-gray-500">
                        {typeof member.averageCompletionTime === 'object' && member.averageCompletionTime
                          ? `${member.averageCompletionTime.averageDays}d`
                          : member.averageCompletionTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="chi-tiet" className="space-y-4 mt-4">
          {/* Top Tags */}
          {parsedData.tagStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Thẻ phổ biến</CardTitle>
                <CardDescription className="text-xs md:text-sm">Thẻ được sử dụng nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsedData.tagStats.map((tag) => (
                    <Badge key={tag.tag} variant="secondary" className="text-xs md:text-sm">
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Tổng hợp thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Tổng công việc</p>
                  <p className="text-xl md:text-2xl font-bold">{parsedData.analytics.totalTasks}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Hoàn thành</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{parsedData.analytics.completedTasks}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Đang làm</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{parsedData.analytics.inProgressTasks}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Chưa bắt đầu</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-600">{parsedData.analytics.pendingTasks}</p>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <p className="text-xs md:text-sm text-gray-500">Thời gian hoàn thành trung bình</p>
                  <p className="text-xl md:text-2xl font-bold">
                    {typeof parsedData.analytics.averageCompletionTime === 'object' 
                      ? `${parsedData.analytics.averageCompletionTime.averageDays} ngày (${parsedData.analytics.averageCompletionTime.averageHours}h)`
                      : parsedData.analytics.averageCompletionTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 md:w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 md:h-10 w-12 md:w-16 mb-2" />
              <Skeleton className="h-3 w-16 md:w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 md:h-6 w-24 md:w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 md:h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
