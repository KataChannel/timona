/**
 * PageBuilder Template System - Template Card Component
 * Phase 5.2: UI Components
 * 
 * Individual template preview card with actions
 */

'use client';

import React from 'react';
import { PageTemplate } from '@/types/template';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Copy, Trash2, Calendar, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface TemplateCardProps {
  template: PageTemplate;
  onUse?: (template: PageTemplate) => void;
  onPreview?: (template: PageTemplate) => void;
  onExport?: (template: PageTemplate) => void;
  onDuplicate?: (template: PageTemplate) => void;
  onDelete?: (template: PageTemplate) => void;
}

export function TemplateCard({
  template,
  onUse,
  onPreview,
  onExport,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const categoryColors: Record<string, string> = {
    landing: 'bg-blue-100 text-blue-800',
    blog: 'bg-purple-100 text-purple-800',
    ecommerce: 'bg-green-100 text-green-800',
    portfolio: 'bg-orange-100 text-orange-800',
    marketing: 'bg-pink-100 text-pink-800',
    custom: 'bg-gray-100 text-gray-800',
  };

  const categoryColor = categoryColors[template.category] || 'bg-gray-100 text-gray-800';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <div className="text-sm">No Preview</div>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          {onPreview && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPreview(template)}
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          )}
          {onUse && (
            <Button
              size="sm"
              onClick={() => onUse(template)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Use Template
            </Button>
          )}
        </div>

        {/* Default Badge */}
        {template.isDefault && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              Default
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${categoryColor} text-xs capitalize`}>
            {template.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
            {template.name}
          </h3>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPreview && (
                <DropdownMenuItem onClick={() => onPreview(template)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={() => onExport(template)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(template)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && !template.isDefault && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(template)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {template.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{template.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(template.updatedAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
