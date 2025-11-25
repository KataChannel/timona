'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Type,
  Heading,
  Image,
  MousePointer,
  Minus,
  Square,
  Columns,
  Layout,
  MoveVertical,
  Grid3x3,
  Images,
  Video,
  Users,
  BarChart,
  Search,
  ShoppingCart,
  Package,
  Zap,
  ChevronDown,
  Copy,
  Sparkles,
  FileText,
  Quote,
  List,
} from 'lucide-react';
import { BlockType } from '@/types/page-builder';
import { usePageActions } from '../../PageBuilderProvider';
import { useFilteredAndGrouped } from '@/components/page-builder/hooks/useFilteredAndGrouped';
import { useCategoryToggle } from '@/components/page-builder/hooks/useCategoryToggle';
import { cn } from '@/lib/utils';

interface ElementConfig {
  id: BlockType;
  icon: any;
  label: string;
  description?: string;
  category: 'basic' | 'layout' | 'content' | 'advanced' | 'ecommerce';
  popularity?: 'hot' | 'new' | null;
}

interface CategoryConfig {
  id: string;
  label: string;
  icon?: any;
  description?: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  basic: {
    id: 'basic',
    label: 'Basic Elements',
    icon: Zap,
    description: 'Core building blocks for your content',
  },
  layout: {
    id: 'layout',
    label: 'Layout',
    icon: Layout,
    description: 'Structure and organize your content',
  },
  content: {
    id: 'content',
    label: 'Content',
    icon: Images,
    description: 'Rich media and dynamic content',
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    icon: Sparkles,
    description: 'Advanced components and features',
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: ShoppingCart,
    description: 'Product and commerce elements',
  },
};

const elements: ElementConfig[] = [
  // Basic Elements - Optimized & Essential Only
  { 
    id: BlockType.RICH_TEXT, 
    icon: FileText, 
    label: 'Rich Text', 
    description: 'BlockNote-style editor with advanced formatting', 
    category: 'basic', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.TEXT, 
    icon: Type, 
    label: 'Simple Text', 
    description: 'Plain text block for basic content', 
    category: 'basic' 
  },
  { 
    id: BlockType.HERO, 
    icon: Heading, 
    label: 'Hero Section', 
    description: 'Large hero banner with heading', 
    category: 'basic', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.BUTTON, 
    icon: MousePointer, 
    label: 'Button', 
    description: 'Call-to-action button', 
    category: 'basic', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.IMAGE, 
    icon: Image, 
    label: 'Image', 
    description: 'Single image with caption', 
    category: 'basic' 
  },
  { 
    id: BlockType.DIVIDER, 
    icon: Minus, 
    label: 'Divider', 
    description: 'Horizontal separator line', 
    category: 'basic' 
  },

  // Layout Elements - Container & Structure
  { 
    id: BlockType.SECTION, 
    icon: Square, 
    label: 'Section', 
    description: 'Full-width page section', 
    category: 'layout', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.CONTAINER, 
    icon: Layout, 
    label: 'Container', 
    description: 'Content container with max-width', 
    category: 'layout' 
  },
  { 
    id: BlockType.GRID, 
    icon: Grid3x3, 
    label: 'Grid', 
    description: 'Responsive grid layout', 
    category: 'layout', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.FLEX_ROW, 
    icon: Columns, 
    label: 'Flex Row', 
    description: 'Horizontal flex container', 
    category: 'layout' 
  },
  { 
    id: BlockType.FLEX_COLUMN, 
    icon: MoveVertical, 
    label: 'Flex Column', 
    description: 'Vertical flex container', 
    category: 'layout' 
  },
  { 
    id: BlockType.SPACER, 
    icon: MoveVertical, 
    label: 'Spacer', 
    description: 'Vertical spacing control', 
    category: 'layout' 
  },

  // Content Elements - Rich Media
  { 
    id: BlockType.CAROUSEL, 
    icon: Images, 
    label: 'Carousel', 
    description: 'Image slider with controls', 
    category: 'content', 
    popularity: 'new' 
  },
  { 
    id: BlockType.GALLERY, 
    icon: Images, 
    label: 'Gallery', 
    description: 'Image gallery grid', 
    category: 'content' 
  },
  { 
    id: BlockType.VIDEO, 
    icon: Video, 
    label: 'Video', 
    description: 'Video player (YouTube/Vimeo)', 
    category: 'content' 
  },
  { 
    id: BlockType.CARD, 
    icon: Quote, 
    label: 'Card', 
    description: 'Content card with image/text', 
    category: 'content', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.TESTIMONIAL, 
    icon: Quote, 
    label: 'Testimonial', 
    description: 'Customer testimonial block', 
    category: 'content' 
  },
  { 
    id: BlockType.TEAM, 
    icon: Users, 
    label: 'Team', 
    description: 'Team member showcase', 
    category: 'content' 
  },
  { 
    id: BlockType.STATS, 
    icon: BarChart, 
    label: 'Stats', 
    description: 'Statistics counter display', 
    category: 'content' 
  },
  { 
    id: BlockType.FAQ, 
    icon: List, 
    label: 'FAQ', 
    description: 'Accordion FAQ section', 
    category: 'content' 
  },

  // Advanced Elements - Dynamic & Forms
  { 
    id: BlockType.CONTACT_FORM, 
    icon: FileText, 
    label: 'Contact Form', 
    description: 'Dynamic contact form', 
    category: 'advanced', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.DYNAMIC, 
    icon: Sparkles, 
    label: 'Dynamic Block', 
    description: 'Template-based dynamic content', 
    category: 'advanced', 
    popularity: 'new' 
  },
  
  // E-commerce Elements - Product Display
  { 
    id: BlockType.PRODUCT_LIST, 
    icon: ShoppingCart, 
    label: 'Product List', 
    description: 'Grid of products with filters', 
    category: 'ecommerce', 
    popularity: 'hot' 
  },
  { 
    id: BlockType.PRODUCT_DETAIL, 
    icon: Package, 
    label: 'Product Detail', 
    description: 'Single product showcase', 
    category: 'ecommerce' 
  },
];

function DraggableElement({ element }: { element: ElementConfig }) {
  const { handleAddBlock } = usePageActions();
  const [isAdding, setIsAdding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${element.id}`,
    data: {
      type: 'new-block',
      blockType: element.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.8 : 1,
        zIndex: 1000,
      }
    : undefined;

  const Icon = element.icon;

  const handleDoubleClick = async () => {
    if (isAdding) return;
    
    try {
      setIsAdding(true);
      await handleAddBlock(element.id);
    } catch (error) {
      console.error('[ElementsLibrary] Error adding block:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative group/item">
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
          'text-left select-none group/btn',
          // Mobile-first: min 44px height for touch targets
          'min-h-[44px] sm:min-h-[48px]',
          isDragging && 'bg-blue-50 border-blue-400 shadow-lg scale-105 z-50',
          isAdding && 'bg-green-50 border-green-400 shadow-lg',
          !isDragging && !isAdding && 'border-gray-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent hover:border-blue-300 hover:shadow-md',
          // Touch feedback
          'active:scale-[0.98] touch-manipulation'
        )}
        title="Double-click to add • Drag to canvas"
      >
        {/* Icon Container - Mobile optimized */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-md flex items-center justify-center transition-all duration-200',
          isDragging && 'bg-blue-500 text-white scale-110 shadow-lg',
          isAdding && 'bg-green-500 text-white scale-110',
          !isDragging && !isAdding && 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover/btn:bg-blue-400 group-hover/btn:text-white group-hover/btn:shadow-md'
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {element.label}
            </span>
            {element.popularity === 'hot' && (
              <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                🔥 Hot
              </span>
            )}
            {element.popularity === 'new' && (
              <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                ✨ New
              </span>
            )}
          </div>
          {element.description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5">
              {element.description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        {isDragging && (
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold whitespace-nowrap">
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">Dragging</span>
          </div>
        )}
        {isAdding && (
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold whitespace-nowrap animate-pulse">
            <Copy className="w-3 h-3" />
            <span className="hidden sm:inline">Adding</span>
          </div>
        )}
      </button>

      {/* Tooltip - Hidden on mobile */}
      {showTooltip && !isDragging && !isAdding && (
        <div className="hidden sm:block absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
          Double-click to add • Drag to canvas
          <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

interface CategoryGroupProps {
  category: string;
  config: CategoryConfig;
  elements: ElementConfig[];
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
}

function CategoryGroup({ category, config, elements, isExpanded, onToggle, count }: CategoryGroupProps) {
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      {/* Category Header - Mobile optimized with 44px min height */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200',
          'text-sm font-semibold text-gray-700 hover:bg-gray-100 group/cat',
          // Mobile-first: min 44px touch target
          'min-h-[44px] touch-manipulation active:scale-[0.98]',
          isExpanded && 'bg-blue-50 text-primary'
        )}
      >
        {Icon && (
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-400 group-hover/cat:text-gray-600" />
        )}
        <span className="flex-1 text-left text-sm sm:text-base">{config.label}</span>
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700',
          isExpanded && 'bg-blue-200 text-primary'
        )}>
          {count}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200',
          isExpanded && 'rotate-180 text-primary'
        )} />
      </button>

      {/* Category Description */}
      {isExpanded && config.description && (
        <p className="text-xs sm:text-sm text-gray-500 px-3">
          {config.description}
        </p>
      )}

      {/* Elements List */}
      {isExpanded && (
        <div className="pl-2 space-y-2 border-l-2 border-gray-200">
          {elements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ElementsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  // Use shared hooks for category toggle and filtering
  const { expandedCategories, toggleCategory } = useCategoryToggle({
    initialState: { 'basic': true, 'layout': true },
  });

  const { groupedItems, itemCount: totalElements } = useFilteredAndGrouped(
    elements,
    searchQuery,
    {
      searchFields: ['label', 'description'],
      groupByField: 'category',
    }
  );

  // Create grouped view with config
  const groupedElements = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    config: CATEGORY_CONFIG[category],
    elements: items as ElementConfig[],
  }));

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Elements</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalElements} element{totalElements !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-300 rounded-lg group-focus-within:bg-white group-focus-within:border-blue-400 group-focus-within:ring-1 group-focus-within:ring-blue-200 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {totalElements === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center text-gray-400 py-12 px-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-semibold text-gray-600">No elements found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          // Categories
          <div className="space-y-4 p-4">
            {groupedElements.map((group) => (
              <CategoryGroup
                key={group.category}
                category={group.category}
                config={group.config}
                elements={group.elements}
                isExpanded={expandedCategories[group.category] || false}
                onToggle={() => toggleCategory(group.category)}
                count={group.elements.length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Double-click to add</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            <span>Drag to canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
