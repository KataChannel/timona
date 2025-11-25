'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  UserPlus,
  TrendingUp
} from 'lucide-react';

interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  adminUsers: number;
  regularUsers: number;
  guestUsers: number;
}

interface UserStatsProps {
  data?: UserStatsData;
  loading?: boolean;
}

export function UserStats({ data, loading }: UserStatsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: data.totalUsers,
      description: 'All registered users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Users',
      value: data.activeUsers,
      description: `${((data.activeUsers / data.totalUsers) * 100).toFixed(1)} % active`,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Verified Users',
      value: data.verifiedUsers,
      description: `${((data.verifiedUsers / data.totalUsers) * 100).toFixed(1)}% verified`,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'New This Month',
      value: data.newUsersThisMonth,
      description: 'Recent registrations',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const roleStats = [
    {
      title: 'Admins',
      value: data.adminUsers,
      color: 'bg-red-100 text-red-800',
      icon: Crown,
    },
    {
      title: 'Users',
      value: data.regularUsers,
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    {
      title: 'Guests',
      value: data.guestUsers,
      color: 'bg-gray-100 text-gray-800',
      icon: UserX,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor} transition-transform duration-200 hover:scale-110`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {roleStats.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div key={role.title} className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${role.color} flex items-center gap-1`}>
                    <RoleIcon className="h-3 w-3" />
                    {role.title}: {role.value}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          {/* Visual representation */}
          <div className="mt-4 space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
              <div 
                className="bg-red-500" 
                style={{ width: `${(data.adminUsers / data.totalUsers) * 100}%` }}
              />
              <div 
                className="bg-blue-500" 
                style={{ width: `${(data.regularUsers / data.totalUsers) * 100}%` }}
              />
              <div 
                className="bg-gray-500" 
                style={{ width: `${(data.guestUsers / data.totalUsers) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Admin ({((data.adminUsers / data.totalUsers) * 100).toFixed(1)}%)</span>
              <span>User ({((data.regularUsers / data.totalUsers) * 100).toFixed(1)}%)</span>
              <span>Guest ({((data.guestUsers / data.totalUsers) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}