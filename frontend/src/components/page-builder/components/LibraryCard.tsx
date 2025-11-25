'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Generic library card component
 * Used by SavedBlocksLibrary, TemplatesLibrary, ElementsLibrary
 */

export interface LibraryCardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
  variant?: 'default' | 'destructive';
}

export interface LibraryCardProps {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  color?: string; // Gradient class like "from-blue-500 to-cyan-500"
  icon?: React.ReactNode;
  metadata?: {
    label: string;
    value: string | number;
  }[];
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onDoubleClick?: () => void;
  onPrimaryAction?: () => void;
  actions?: LibraryCardAction[];
  className?: string;
}

export function LibraryCard({
  id,
  title,
  description,
  subtitle,
  badge,
  color,
  icon,
  metadata,
  isBookmarked,
  onBookmarkToggle,
  onDoubleClick,
  onPrimaryAction,
  actions = [],
  className,
}: LibraryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        'overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer',
        isHovered && 'border-primary/50 shadow-md',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={onDoubleClick}
      title={onDoubleClick ? 'Double-click to apply' : undefined}
    >
      {/* Color Bar */}
      {color && (
        <div className={cn('h-1 bg-gradient-to-r', color)} />
      )}

      {/* Content */}
      <div className="p-2.5 sm:p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              <h4 className="font-semibold text-xs sm:text-sm truncate">{title}</h4>
              {badge && (
                <Badge
                  className={cn(
                    'text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 flex-shrink-0',
                    badge.variant === 'destructive' && 'bg-red-500 hover:bg-red-600',
                    badge.variant === 'secondary' && 'bg-gray-500 hover:bg-gray-600',
                    !badge.variant && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {badge.label}
                </Badge>
              )}
            </div>
            
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{subtitle}</p>
            )}
            
            {description && (
              <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-6 w-6 sm:h-8 sm:w-8 transition-colors',
                  isBookmarked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                )}
                onClick={() => onBookmarkToggle?.()}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5',
                    isBookmarked && 'fill-current'
                  )}
                />
              </Button>
            )}

            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-6 w-6 sm:h-8 sm:w-8 transition-opacity',
                      isHovered ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {actions.map((action, idx) => (
                    <React.Fragment key={`${id}-action-${idx}`}>
                      {action.separator && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        className={cn(
                          'text-xs sm:text-sm',
                          action.variant === 'destructive' && 'text-red-600'
                        )}
                      >
                        {action.icon && <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2">{action.icon}</span>}
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Metadata */}
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 text-[9px] sm:text-[10px]">
            {metadata.map((item, idx) => (
              <span key={`${id}-meta-${idx}`} className="text-gray-500">
                <span className="font-medium text-gray-700">{item.label}:</span> {item.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Icon imports helper
import { Heart } from 'lucide-react';
