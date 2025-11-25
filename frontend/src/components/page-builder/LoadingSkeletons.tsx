'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * PageBuilder Loading Skeleton
 * Displays while page data is being fetched
 */
export const PageBuilderSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="w-80 border-r bg-background pt-16">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          
          {/* Tabs */}
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>

          {/* Block Items */}
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Skeleton */}
      <div className="flex-1 overflow-auto pt-16">
        <div className="p-8 space-y-4 max-w-6xl mx-auto">
          {/* Page Title */}
          <Skeleton className="h-8 w-64" />
          
          {/* Blocks */}
          <div className="space-y-4">
            <BlockSkeleton />
            <BlockSkeleton variant="image" />
            <BlockSkeleton variant="text" />
            <BlockSkeleton variant="grid" />
          </div>
        </div>
      </div>

      {/* Properties Panel Skeleton */}
      <div className="w-96 border-l bg-background pt-16">
        <div className="p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          
          {/* Properties */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Block Skeleton
 */
interface BlockSkeletonProps {
  variant?: 'text' | 'image' | 'grid' | 'default';
}

export const BlockSkeleton: React.FC<BlockSkeletonProps> = ({ variant = 'default' }) => {
  if (variant === 'text') {
    return (
      <Card>
        <CardContent className="p-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'image') {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'grid') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
};

/**
 * Canvas Loading Skeleton
 * Used when switching between pages
 */
export const CanvasSkeleton: React.FC = () => {
  return (
    <div className="p-8 space-y-4 max-w-6xl mx-auto">
      <Skeleton className="h-8 w-64 mb-6" />
      <BlockSkeleton />
      <BlockSkeleton variant="image" />
      <BlockSkeleton variant="text" />
      <BlockSkeleton variant="grid" />
    </div>
  );
};

/**
 * Sidebar Loading Skeleton
 * Used when loading blocks or templates
 */
export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>

      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Properties Panel Loading Skeleton
 */
export const PropertiesSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Template Card Skeleton
 */
export const TemplateSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-48 w-full rounded-lg mb-3" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
};

/**
 * Templates Grid Skeleton
 */
export const TemplatesGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {[...Array(6)].map((_, i) => (
        <TemplateSkeleton key={i} />
      ))}
    </div>
  );
};

export default PageBuilderSkeleton;
