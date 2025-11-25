'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HardDrive,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';

interface StorageAnalyticsProps {
  totalSize: number;
  totalFiles: number;
  storageLimit: number;
  filesByType: Array<{
    type: string;
    count: number;
    totalSize: number;
  }>;
}

export function StorageAnalytics({ 
  totalSize, 
  totalFiles, 
  storageLimit, 
  filesByType 
}: StorageAnalyticsProps) {
  const usagePercent = (totalSize / storageLimit) * 100;
  const remainingSpace = storageLimit - totalSize;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStorageHealth = () => {
    if (usagePercent < 50) {
      return { 
        status: 'Healthy', 
        color: 'text-green-600', 
        bgColor: 'bg-green-500',
        icon: CheckCircle,
        variant: 'default' as const
      };
    }
    if (usagePercent < 80) {
      return { 
        status: 'Warning', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-500',
        icon: AlertCircle,
        variant: 'warning' as const
      };
    }
    return { 
      status: 'Critical', 
      color: 'text-red-600', 
      bgColor: 'bg-red-500',
      icon: AlertCircle,
      variant: 'destructive' as const
    };
  };

  const health = getStorageHealth();
  const HealthIcon = health.icon;

  // Calculate growth trend (mock data - in production, compare with previous period)
  const growthRate = 12.5; // Mock 12.5% growth
  const isGrowing = growthRate > 0;

  return (
    <div className="space-y-6">
      {/* Main Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Storage */}
        <Card className="col-span-1 md:col-span-2 border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main metrics */}
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold">{formatBytes(totalSize)}</div>
              <div className="text-lg text-muted-foreground">/ {formatBytes(storageLimit)}</div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={health.color}>
                  <HealthIcon className="h-4 w-4 inline mr-1" />
                  {usagePercent.toFixed(1)}% used
                </span>
                <span className="text-muted-foreground">
                  {formatBytes(remainingSpace)} free
                </span>
              </div>
              <Progress 
                value={usagePercent} 
                className="h-3"
                indicatorClassName={health.bgColor}
              />
            </div>

            {/* Status and trend */}
            <div className="flex items-center justify-between pt-2">
              <Badge variant={health.variant} className="gap-1">
                <HealthIcon className="h-3 w-3" />
                {health.status}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                {isGrowing ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">+{growthRate}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">{growthRate}%</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Files */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{totalFiles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all folders
              </p>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="h-3 w-3" />
                <span>+23 this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average File Size */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg File Size</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {formatBytes(totalFiles > 0 ? totalSize / totalFiles : 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per file average
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                Optimal: &lt; 5MB
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage Distribution by Type</CardTitle>
          <CardDescription>Breakdown of storage usage by file types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filesByType.map((typeData) => {
              const percentage = (typeData.totalSize / totalSize) * 100;
              const avgSize = typeData.count > 0 ? typeData.totalSize / typeData.count : 0;
              
              return (
                <div key={typeData.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="font-medium min-w-[100px]">{typeData.type}</div>
                      <Badge variant="outline" className="text-xs">
                        {typeData.count} files
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="min-w-[80px] text-right">
                        {formatBytes(typeData.totalSize)}
                      </span>
                      <span className="min-w-[60px] text-right font-medium text-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={percentage} 
                      className="h-2 flex-1"
                      indicatorClassName={
                        typeData.type === 'IMAGE' ? 'bg-blue-500' :
                        typeData.type === 'VIDEO' ? 'bg-purple-500' :
                        typeData.type === 'DOCUMENT' ? 'bg-green-500' :
                        typeData.type === 'AUDIO' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }
                    />
                    <span className="text-xs text-muted-foreground min-w-[100px] text-right">
                      Avg: {formatBytes(avgSize)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage Management</CardTitle>
          <CardDescription>Optimize and manage your storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-medium">Clean Trash</div>
                <div className="text-xs text-muted-foreground">Free up space</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-medium">Find Duplicates</div>
                <div className="text-xs text-muted-foreground">Remove duplicates</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="text-left">
                <div className="font-medium">Compress Files</div>
                <div className="text-xs text-muted-foreground">Save storage</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
