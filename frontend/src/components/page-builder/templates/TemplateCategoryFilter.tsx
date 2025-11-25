/**
 * PageBuilder Template System - Category Filter Component
 * Phase 5.2: UI Components
 * 
 * Category selector with active state and counts
 */

'use client';

import React from 'react';
import { TemplateCategory, TEMPLATE_CATEGORIES } from '@/types/template';
import { Badge } from '@/components/ui/badge';

interface TemplateCategoryFilterProps {
  activeCategory: TemplateCategory;
  onCategoryChange: (category: TemplateCategory) => void;
  counts?: Record<TemplateCategory, number>;
}

export function TemplateCategoryFilter({
  activeCategory,
  onCategoryChange,
  counts,
}: TemplateCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATE_CATEGORIES.map((category) => {
        const isActive = activeCategory === category.value;
        const count = counts?.[category.value] || 0;

        return (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              flex items-center gap-2
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <span>{category.label}</span>
            {count > 0 && (
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className={`
                  text-xs px-1.5 py-0.5 min-w-[20px] justify-center
                  ${isActive ? 'bg-white/20 text-white border-white/30' : 'bg-gray-100 text-gray-600'}
                `}
              >
                {count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
