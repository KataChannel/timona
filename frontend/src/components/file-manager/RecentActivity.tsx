'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFiles } from '@/hooks/useFiles';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Clock,
  File,
  Image,
  Video,
  FileText,
  Music,
  Archive,
  AlertCircle,
} from 'lucide-react';

interface RecentActivityProps {
  limit?: number;
}

export function RecentActivity({ limit = 10 }: RecentActivityProps) {
  // Lấy data thật từ database
  const { files, loading, error } = useFiles({
    page: 1,
    limit: limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    allUsers: true,
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    const iconClass = 'h-8 w-8';
    switch (type) {
      case 'IMAGE':
        return <Image className={`${iconClass} text-blue-500`} />;
      case 'VIDEO':
        return <Video className={`${iconClass} text-purple-500`} />;
      case 'DOCUMENT':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'AUDIO':
        return <Music className={`${iconClass} text-yellow-500`} />;
      case 'ARCHIVE':
        return <Archive className={`${iconClass} text-orange-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'VIDEO':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'DOCUMENT':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'AUDIO':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ARCHIVE':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !files?.items) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Không thể tải hoạt động gần đây
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentFiles = files.items;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
          </div>
          <Badge variant="outline">{recentFiles.length} file</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentFiles.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Chưa có file nào được upload
            </p>
          </div>
        ) : (
          recentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0">
                {getFileIcon(file.fileType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{file.originalName}</p>
                  <Badge className={`text-xs ${getTypeBadgeColor(file.fileType)}`}>
                    {file.fileType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true, locale: vi })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
