'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Sparkles,
  ShoppingBag,
  LayoutDashboard,
  Newspaper,
  Building2,
  TrendingUp,
  Eye,
  Copy,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { usePageActions } from '../../PageBuilderProvider';
import { BlockType } from '@/types/page-builder';
import { useFilteredAndGrouped } from '@/components/page-builder/hooks/useFilteredAndGrouped';
import { useCategoryToggle } from '@/components/page-builder/hooks/useCategoryToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { pageBuilderLogger, LOG_OPERATIONS } from '../../utils/pageBuilderLogger';

interface TemplateBlock {
  type: BlockType;
  content: any;
  style?: any;
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'productivity' | 'landing' | 'business' | 'marketing';
  preview: string;
  blockCount: number;
  blocks: TemplateBlock[];
  color: string;
  popularity?: 'hot' | 'new' | null;
}

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const templates: TemplateConfig[] = [
  // E-commerce Templates
  {
    id: 'product-grid',
    name: 'Product Grid',
    description: 'Responsive product showcase with 3-column layout',
    category: 'ecommerce',
    preview: '🛍️',
    blockCount: 6,
    color: 'from-blue-500 to-cyan-500',
    popularity: 'hot' as const,
    blocks: [
      { type: BlockType.HERO, content: { title: 'Our Products', subtitle: 'Discover our latest collection', style: {} } },
      { type: BlockType.GRID, content: { columns: 3, gap: '20px', style: {} } },
      { type: BlockType.IMAGE, content: { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Product 1', style: {} } },
      { type: BlockType.IMAGE, content: { src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', alt: 'Product 2', style: {} } },
      { type: BlockType.IMAGE, content: { src: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400', alt: 'Product 3', style: {} } },
      { type: BlockType.BUTTON, content: { text: 'View All Products', link: '#', variant: 'primary', style: {} } },
    ],
  },
  {
    id: 'category-showcase',
    name: 'Category Showcase',
    description: 'Highlight product categories with images',
    category: 'ecommerce',
    preview: '🏪',
    blockCount: 4,
    color: 'from-purple-500 to-pink-500',
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h2>Shop by Category</h2>', style: {} } },
      { type: BlockType.GRID, content: { columns: 2, gap: '16px', style: {} } },
      { type: BlockType.IMAGE, content: { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', alt: 'Category 1', style: {} } },
      { type: BlockType.IMAGE, content: { src: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400', alt: 'Category 2', style: {} } },
    ],
  },

  // Productivity Templates
  {
    id: 'task-dashboard',
    name: 'Task Dashboard',
    description: 'Kanban-style task management interface',
    category: 'productivity',
    preview: '✅',
    blockCount: 8,
    color: 'from-green-500 to-emerald-500',
    popularity: 'hot' as const,
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h1>Task Dashboard</h1>', style: {} } },
      { type: BlockType.STATS, content: { title: 'Project Stats', stats: [{ label: 'Tasks', value: '24' }, { label: 'Completed', value: '12' }], style: {} } },
      { type: BlockType.FLEX_ROW, content: { justifyContent: 'space-between', style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>To Do</h3>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>In Progress</h3>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>Done</h3>', style: {} } },
      { type: BlockType.DIVIDER, content: { thickness: 1, color: '#e5e7eb', style: {} } },
      { type: BlockType.BUTTON, content: { text: 'Add New Task', link: '#', variant: 'primary', style: {} } },
    ],
  },

  // Landing Page Templates
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Eye-catching hero with CTA buttons',
    category: 'landing',
    preview: '🚀',
    blockCount: 3,
    color: 'from-orange-500 to-red-500',
    popularity: 'hot' as const,
    blocks: [
      { type: BlockType.HERO, content: { title: 'Welcome to Our Platform', subtitle: 'The best solution for your business', description: 'Start today and see the difference', buttonText: 'Get Started', buttonLink: '#', style: {} } },
      { type: BlockType.SPACER, content: { height: 60, style: {} } },
      { type: BlockType.TEXT, content: { content: '<p style="text-align: center;">Trusted by thousands of companies worldwide</p>', style: {} } },
    ],
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    category: 'landing',
    preview: '📧',
    blockCount: 5,
    color: 'from-indigo-500 to-blue-500',
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h2 style="text-align: center;">Get in Touch</h2>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<p style="text-align: center;">We\'d love to hear from you</p>', style: {} } },
      { type: BlockType.CONTACT_INFO, content: { email: 'contact@example.com', phone: '+1 234 567 8900', address: '123 Main St, City, Country', style: {} } },
      { type: BlockType.SPACER, content: { height: 40, style: {} } },
      { type: BlockType.BUTTON, content: { text: 'Send Message', link: '#', variant: 'primary', style: {} } },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews in card layout',
    category: 'landing',
    preview: '⭐',
    blockCount: 4,
    color: 'from-yellow-500 to-orange-500',
    popularity: 'new' as const,
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h2 style="text-align: center;">What Our Customers Say</h2>', style: {} } },
      { type: BlockType.SPACER, content: { height: 40, style: {} } },
      { type: BlockType.GRID, content: { columns: 2, gap: '24px', style: {} } },
      { type: BlockType.TEXT, content: { content: '<blockquote>"Amazing service! Highly recommended." - John Doe</blockquote>', style: {} } },
    ],
  },

  // Business Templates
  {
    id: 'faq-section',
    name: 'FAQ Section',
    description: 'Accordion-style frequently asked questions',
    category: 'business',
    preview: '❓',
    blockCount: 6,
    color: 'from-teal-500 to-cyan-500',
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h2 style="text-align: center;">Frequently Asked Questions</h2>', style: {} } },
      { type: BlockType.SPACER, content: { height: 40, style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>How does it work?</h3><p>Our platform is designed to be intuitive and easy to use.</p>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>What are the pricing plans?</h3><p>We offer flexible pricing to suit your needs.</p>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<h3>How can I get support?</h3><p>Our support team is available 24/7 to help you.</p>', style: {} } },
      { type: BlockType.BUTTON, content: { text: 'Contact Support', link: '#', variant: 'outline', style: {} } },
    ],
  },

  // Marketing Templates
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Email subscription form with benefits',
    category: 'marketing',
    preview: '📰',
    blockCount: 3,
    color: 'from-pink-500 to-rose-500',
    popularity: 'new' as const,
    blocks: [
      { type: BlockType.TEXT, content: { content: '<h2 style="text-align: center;">Subscribe to Our Newsletter</h2>', style: {} } },
      { type: BlockType.TEXT, content: { content: '<p style="text-align: center;">Get the latest updates and exclusive offers</p>', style: {} } },
      { type: BlockType.BUTTON, content: { text: 'Subscribe Now', link: '#', variant: 'primary', style: {} } },
    ],
  },
];

const categoryIcons = {
  ecommerce: ShoppingBag,
  productivity: LayoutDashboard,
  landing: Sparkles,
  business: Building2,
  marketing: TrendingUp,
};

const categoryLabels = {
  ecommerce: 'E-commerce',
  productivity: 'Productivity',
  landing: 'Landing Page',
  business: 'Business',
  marketing: 'Marketing',
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: ShoppingBag,
    description: 'Product showcase and shopping templates',
  },
  productivity: {
    id: 'productivity',
    label: 'Productivity',
    icon: LayoutDashboard,
    description: 'Task management and productivity tools',
  },
  landing: {
    id: 'landing',
    label: 'Landing Page',
    icon: Newspaper,
    description: 'Landing pages and marketing sites',
  },
  business: {
    id: 'business',
    label: 'Business',
    icon: Building2,
    description: 'Business and company templates',
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    icon: TrendingUp,
    description: 'Marketing and promotion templates',
  },
};

function TemplateCard({ template, onInsert, onPreview }: { template: TemplateConfig; onInsert: (template: TemplateConfig) => void; onPreview: (template: TemplateConfig) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInserted, setIsInserted] = useState(false);

  const handleInsert = () => {
    onInsert(template);
    setIsInserted(true);
    setTimeout(() => setIsInserted(false), 2000);
  };

  const handlePreview = () => {
    onPreview(template);
  };

  // Handle double-click to insert template directly
  const handleDoubleClick = () => {
    pageBuilderLogger.info('TEMPLATE_INSERT', 'Double-click inserting template', { templateId: template.id });
    handleInsert();
  };

  return (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      title="Double-click to insert template"
    >
      {/* Preview Area */}
      <div className={`relative h-24 sm:h-28 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
        <div className="text-4xl sm:text-5xl">{template.preview}</div>
        
        {/* Popularity Badge */}
        {template.popularity && (
          <div className="absolute top-2 left-2">
            <Badge className={cn('text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2', 
              template.popularity === 'hot' ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
            )}>
              {template.popularity === 'hot' ? '🔥 Hot' : '✨ New'}
            </Badge>
          </div>
        )}
        
        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs gap-1.5"
              onClick={handleInsert}
            >
              {isInserted ? (
                <>
                  <Check className="w-3 h-3" />
                  <span className="hidden sm:inline">Inserted</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Insert</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 sm:h-8 px-2.5 sm:px-3 text-xs gap-1.5"
              onClick={handlePreview}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        )}

        {/* Block Count Badge */}
        <div className={cn('absolute top-2 right-2', template.popularity && 'top-10 sm:top-12')}>
          <Badge variant="secondary" className="text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2 bg-white/90 backdrop-blur-sm">
            {template.blockCount} blocks
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-1 truncate group-hover:text-primary transition-colors">
          {template.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mb-2 sm:mb-3">
          {template.description}
        </p>
        
        {/* Category Badge */}
        <div className="flex items-center gap-1.5">
          {React.createElement(CATEGORY_CONFIG[template.category].icon, {
            className: 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400',
          })}
          <span className="text-[10px] sm:text-xs text-gray-500">
            {CATEGORY_CONFIG[template.category].label}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TemplatesLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);
  const [isInserting, setIsInserting] = useState(false);

  // Use shared hooks for category toggle and filtering
  const { expandedCategories, toggleCategory } = useCategoryToggle({
    initialState: { 'all': true, 'ecommerce': true, 'landing': true },
  });

  // Get page actions
  const { handleApplyTemplate } = usePageActions();

  // Filter templates based on search + category
  const visibleTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group templates by category when viewing all
  const { groupedItems: groupedTemplates } = useFilteredAndGrouped(
    activeCategory === 'all' ? templates : [],
    searchQuery,
    {
      searchFields: ['name', 'description'],
      groupByField: 'category',
    }
  );

  const handleInsertTemplate = async (template: TemplateConfig) => {
    setIsInserting(true);
    
    try {
      // Convert our template format to BlockTemplate format for context
      const blockTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: 'custom' as const,
        blocks: template.blocks.map((block, index) => ({
          type: block.type,
          content: block.content,
          style: block.style || {},
          order: index,
          depth: 0,
        })),
      };
      
      await handleApplyTemplate(blockTemplate);
      toast.success(`Template "${template.name}" inserted successfully!`);
    } catch (error: any) {
      pageBuilderLogger.error(LOG_OPERATIONS.TEMPLATE_ADD, 'Failed to insert template', { templateId: template.id, error });
      toast.error(error.message || 'Failed to insert template');
    } finally {
      setIsInserting(false);
    }
  };

  const handlePreviewTemplate = (template: TemplateConfig) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-white space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h2 className="font-semibold text-sm sm:text-base">Templates</h2>
          <Badge variant="secondary" className="ml-auto text-[10px] sm:text-xs">
            {templates.length} available
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search templates or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Category Tabs - Horizontal Scroll */}
      <div className="flex-shrink-0 flex gap-1.5 sm:gap-2 p-2 sm:p-3 border-b border-gray-200 overflow-x-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
          className="whitespace-nowrap text-xs h-7 sm:h-8 px-2.5 sm:px-3 flex-shrink-0 gap-1.5"
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">All Templates</span>
          <span className="sm:hidden">All</span>
        </Button>
        
        {Object.keys(CATEGORY_CONFIG).map((categoryId) => {
          const config = CATEGORY_CONFIG[categoryId];
          const Icon = config.icon;
          return (
            <Button
              key={categoryId}
              variant={activeCategory === categoryId ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(categoryId)}
              className="whitespace-nowrap text-xs h-7 sm:h-8 px-2.5 sm:px-3 flex-shrink-0 gap-1.5"
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {activeCategory === 'all' ? (
          // Grouped view by category
          <div className="space-y-6 sm:space-y-8">
            {Object.keys(CATEGORY_CONFIG).map((categoryId) => {
              const categoryTemplates = groupedTemplates[categoryId] || [];
              if (categoryTemplates.length === 0) return null;
              
              const config = CATEGORY_CONFIG[categoryId];
              const Icon = config.icon;
              const isExpanded = expandedCategories[categoryId] || false;

              return (
                <div key={categoryId}>
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-gray-900 hover:text-primary transition-colors w-full"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{config.label}</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs ml-auto">
                      {categoryTemplates.length}
                    </Badge>
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform flex-shrink-0',
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 ml-0 sm:ml-2 pl-0 sm:pl-4 border-l border-gray-200 sm:border-l-2">
                      {categoryTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onInsert={handleInsertTemplate}
                          onPreview={handlePreviewTemplate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Single category flat view
          visibleTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {visibleTemplates.map((template: TemplateConfig) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onInsert={handleInsertTemplate}
                  onPreview={handlePreviewTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 text-xs sm:text-sm py-8 sm:py-12">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-50" />
              <p className="font-medium">No templates found</p>
              <p className="text-[10px] sm:text-xs mt-1">Try a different search term or category</p>
            </div>
          )
        )}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 p-2 sm:p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span>
            Double-click to insert | 👁️ Preview for details
          </span>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => handleClosePreview()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{previewTemplate.preview}</span>
                  {previewTemplate.name}
                </DialogTitle>
                <DialogDescription>
                  {previewTemplate.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {/* Template Info */}
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <Badge variant="secondary" className="gap-1.5">
                    {React.createElement(CATEGORY_CONFIG[previewTemplate.category].icon, {
                      className: 'w-3.5 h-3.5',
                    })}
                    {CATEGORY_CONFIG[previewTemplate.category].label}
                  </Badge>
                  <Badge variant="outline">
                    {previewTemplate.blockCount} blocks
                  </Badge>
                  {previewTemplate.popularity && (
                    <Badge className={previewTemplate.popularity === 'hot' ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'}>
                      {previewTemplate.popularity === 'hot' ? '🔥 Hot' : '✨ New'}
                    </Badge>
                  )}
                </div>

                {/* Block List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Blocks included:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {previewTemplate.blocks.map((block, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"
                      >
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {index + 1}
                        </div>
                        <span className="capitalize">{block.type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Gradient */}
                <div className={`h-32 rounded-lg bg-gradient-to-br ${previewTemplate.color} flex items-center justify-center`}>
                  <div className="text-6xl">{previewTemplate.preview}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      handleInsertTemplate(previewTemplate);
                      handleClosePreview();
                    }}
                    disabled={isInserting}
                    className="flex-1"
                  >
                    {isInserting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Inserting...
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Insert Template
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClosePreview}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
