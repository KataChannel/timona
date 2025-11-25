/**
 * ============================================================================
 * ACTIVITY TIMELINE COMPONENT - MVP 3
 * ============================================================================
 * 
 * Activity history timeline with full change tracking
 * Features:
 * - Display all task activities chronologically
 * - Filter by activity type, user, date range
 * - Show old/new values for changes
 * - Activity icons and colors
 * - Real-time updates
 * 
 * @author Senior Full-Stack Engineer
 * @version 3.0.0 - MVP 3
 */

'use client';

import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useTaskActivities,
  useRecentActivities,
  useActivityStats,
  getActivityIcon,
  getActivityColor,
} from '@/hooks/useActivityLog.dynamic';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Filter, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  taskId: string;
}

// Activity Type Enum (matching backend)
const ACTIVITY_TYPES = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_DELETED',
  'TASK_STATUS_CHANGED',
  'TASK_PRIORITY_CHANGED',
  'TASK_ASSIGNED',
  'TASK_UNASSIGNED',
  'COMMENT_ADDED',
  'COMMENT_EDITED',
  'COMMENT_DELETED',
  'SUBTASK_ADDED',
  'SUBTASK_COMPLETED',
  'SUBTASK_DELETED',
  'FILE_UPLOADED',
  'FILE_DELETED',
  'DUE_DATE_CHANGED',
  'DESCRIPTION_CHANGED',
  'TITLE_CHANGED',
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];

export default function ActivityTimeline({ taskId }: ActivityTimelineProps) {
  const [filterAction, setFilterAction] = useState<ActivityType | 'ALL'>('ALL');
  const [showRecent, setShowRecent] = useState(false);

  // Queries
  const { data: allActivities, loading: loadingAll } = useTaskActivities(
    taskId,
    filterAction !== 'ALL' ? { action: filterAction } : undefined
  );
  const { data: recentActivities, loading: loadingRecent } =
    useRecentActivities(taskId);
  const { stats } = useActivityStats(taskId);

  const activities = showRecent ? recentActivities : allActivities;
  const loading = showRecent ? loadingRecent : loadingAll;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterAction}
            onValueChange={(value) =>
              setFilterAction(value as ActivityType | 'ALL')
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Activities</SelectItem>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getActivityIcon(type)} {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showRecent ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowRecent(!showRecent)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Last 24h
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((a: number, b: number) => a + b, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats['TASK_STATUS_CHANGED'] || 0}
            </div>
            <div className="text-xs text-muted-foreground">Status Changes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats['COMMENT_ADDED'] || 0}
            </div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <ScrollArea className="h-[400px] pr-4">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">
              {showRecent
                ? 'No activity in the last 24 hours'
                : 'Activity will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ==================== ACTIVITY ITEM COMPONENT ====================

interface ActivityItemProps {
  activity: any;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const icon = getActivityIcon(activity.action);
  const colorClass = getActivityColor(activity.action);

  // Parse old/new values if they exist
  const oldValue = activity.oldValue
    ? typeof activity.oldValue === 'string'
      ? activity.oldValue
      : JSON.stringify(activity.oldValue)
    : null;

  const newValue = activity.newValue
    ? typeof activity.newValue === 'string'
      ? activity.newValue
      : JSON.stringify(activity.newValue)
    : null;

  return (
    <div className="flex items-start gap-3 group">
      {/* Timeline Dot */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm',
            colorClass
          )}
        >
          {icon}
        </div>
        {/* Timeline Line */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        {/* Header */}
        <div className="flex items-start gap-2 mb-1">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={activity.user?.avatar} />
            <AvatarFallback className="text-xs">
              {activity.user?.firstName?.[0]}
              {activity.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {activity.user?.firstName} {activity.user?.lastName}
              </span>
              <Badge variant="outline" className="text-xs">
                {activity.action.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-0.5">
              {activity.description}
            </p>

            {/* Old/New Values */}
            {(oldValue || newValue) && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
                {oldValue && (
                  <div>
                    <span className="text-muted-foreground">From:</span>{' '}
                    <span className="font-mono text-red-600">{oldValue}</span>
                  </div>
                )}
                {newValue && (
                  <div>
                    <span className="text-muted-foreground">To:</span>{' '}
                    <span className="font-mono text-green-600">{newValue}</span>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}{' '}
              · {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
