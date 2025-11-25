import React, { useMemo, useCallback, useState } from 'react';
import { 
  Eye, Plus, Trash2, ShoppingCart, CheckSquare, Database, Palette,
  MessageSquare, Mail, Star, HelpCircle, Zap, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageState, usePageActions } from './PageBuilderProvider';
import { BlockType } from '@/types/page-builder';
import { BLOCK_TYPES } from '@/constants/blockTypes';
import { TemplateCustomizationModal } from './TemplateCustomizationModal';
import { pageBuilderLogger, LOG_OPERATIONS } from './utils/pageBuilderLogger';

/**
 * PageBuilderSidebar Component
 * 
 * Provides:
 * - Block types palette (Blocks tab)
 * - Template browser with search and filter (Templates tab)
 * - Template actions (preview, apply, delete custom)
 * 
 * Performance optimizations:
 * - Wrapped with React.memo to prevent unnecessary re-renders
 * - useMemo for template filtering (expensive operation)
 * - useCallback for event handlers
 */
const PageBuilderSidebarComponent = React.memo(function PageBuilderSidebarComponent() {
  // Use individual hooks for better performance
  const { editingPage, page } = usePageState();
  const { handleAddBlock } = usePageActions();
  
  const isNewPageMode = !page?.id;

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="h-12 flex items-center px-4">
          <h2 className="font-semibold">Add Elements</h2>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="blocks" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b flex-shrink-0 mx-4">
          <TabsTrigger value="blocks" className="flex-1">Blocks</TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Blocks Tab - Block Types Palette */}
          <TabsContent value="blocks" className="mt-0 p-4">
            <div className="space-y-2">
              {BLOCK_TYPES.map(blockType => (
                <Button
                  key={blockType.type}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleAddBlock(blockType.type)}
                  disabled={isNewPageMode && !editingPage?.id}
                >
                  <div className={`p-2 rounded mr-3 ${blockType.color}`}>
                    <blockType.icon size={16} />
                  </div>
                  <span className="text-sm">{blockType.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab - Dynamic Templates */}
          <TabsContent value="templates" className="mt-0 p-4">
            <TemplatesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
});

/**
 * Templates Panel - Product and Task Templates for PageBuilder
 */
const TemplatesPanel: React.FC = () => {
  const { handleAddBlock } = usePageActions();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customizationModal, setCustomizationModal] = useState<{
    isOpen: boolean;
    template: any;
  }>({ isOpen: false, template: null });

  // Template definitions with dynamic data
  const templates = [
    {
      id: 'product-grid',
      name: 'Product Grid',
      description: 'Responsive grid layout cho sản phẩm e-commerce',
      category: 'ecommerce',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      preview: '/templates/product-grid.jpg',
      data: {
        type: 'product',
        fields: ['name', 'price', 'image', 'description'],
        layout: 'grid',
        responsive: true,
      },
      template: `
<div class="product-grid">
  <h2 class="text-2xl font-bold mb-6">{{title}}</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {{#each products}}
    <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
      <img src="{{image}}" alt="{{name}}" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h3 class="font-semibold text-lg">{{name}}</h3>
        <p class="text-gray-600 text-sm mb-2">{{description}}</p>
        <div class="flex justify-between items-center">
          <span class="text-xl font-bold text-green-600">\${{price}}</span>
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
    {{/each}}
  </div>
</div>`
    },
    {
      id: 'task-dashboard',
      name: 'Task Dashboard', 
      description: 'Kanban-style task management dashboard',
      category: 'productivity',
      icon: CheckSquare,
      color: 'bg-green-500',
      preview: '/templates/task-dashboard.jpg',
      data: {
        type: 'task',
        fields: ['title', 'status', 'priority', 'assignee', 'dueDate'],
        layout: 'kanban',
        groupBy: 'status',
      },
      template: `
<div class="task-dashboard">
  <h2 class="text-2xl font-bold mb-6">{{projectName}}</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- TODO Column -->
    <div class="task-column bg-gray-50 p-4 rounded-lg">
      <h3 class="font-semibold text-gray-700 mb-4">To Do</h3>
      {{#each todoTasks}}
      <div class="task-item bg-white p-3 rounded mb-3 shadow-sm">
        <h4 class="font-medium">{{title}}</h4>
        <p class="text-sm text-gray-600">{{description}}</p>
        <div class="mt-2 flex justify-between items-center">
          <span class="text-xs text-gray-500">{{dueDate}}</span>
          <span class="px-2 py-1 bg-{{priority}}-100 text-{{priority}}-800 rounded text-xs">
            {{priority}}
          </span>
        </div>
      </div>
      {{/each}}
    </div>
    <!-- IN PROGRESS Column -->
    <div class="task-column bg-yellow-50 p-4 rounded-lg">
      <h3 class="font-semibold text-yellow-700 mb-4">In Progress</h3>
      {{#each inProgressTasks}}
      <div class="task-item bg-white p-3 rounded mb-3 shadow-sm border-l-4 border-yellow-400">
        <h4 class="font-medium">{{title}}</h4>
        <p class="text-sm text-gray-600">{{description}}</p>
        <div class="mt-2 flex justify-between items-center">
          <span class="text-xs text-gray-500">{{assignee}}</span>
          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            {{priority}}
          </span>
        </div>
      </div>
      {{/each}}
    </div>
    <!-- DONE Column -->
    <div class="task-column bg-green-50 p-4 rounded-lg">
      <h3 class="font-semibold text-green-700 mb-4">Done</h3>
      {{#each doneTasks}}
      <div class="task-item bg-white p-3 rounded mb-3 shadow-sm border-l-4 border-green-400">
        <h4 class="font-medium line-through text-gray-500">{{title}}</h4>
        <p class="text-sm text-gray-500">{{description}}</p>
        <div class="mt-2 flex justify-between items-center">
          <span class="text-xs text-green-600">✓ Completed</span>
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            {{priority}}
          </span>
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</div>`
    },
    {
      id: 'category-showcase',
      name: 'Category Showcase',
      description: 'Hero-style category display với images',
      category: 'ecommerce',
      icon: Database,
      color: 'bg-purple-500',
      preview: '/templates/category-showcase.jpg',
      data: {
        type: 'category',
        fields: ['name', 'description', 'image', 'productCount'],
        layout: 'hero',
        responsive: true,
      },
      template: `
<div class="category-showcase">
  <h2 class="text-3xl font-bold text-center mb-8">{{title}}</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {{#each categories}}
    <div class="category-card group cursor-pointer relative overflow-hidden rounded-lg shadow-lg">
      <img src="{{image}}" alt="{{name}}" class="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
      <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="text-center text-white">
          <h3 class="text-xl font-bold mb-2">{{name}}</h3>
          <p class="mb-2">{{productCount}} sản phẩm</p>
          <button class="bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
    {{/each}}
  </div>
</div>`
    },
    {
      id: 'hero-section',
      name: 'Hero Section',
      description: 'Modern hero section với CTA và background image',
      category: 'landing',
      icon: Zap,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      preview: '/templates/hero-section.jpg',
      data: {
        type: 'hero',
        fields: ['title', 'subtitle', 'ctaText', 'backgroundImage'],
        layout: 'hero',
        responsive: true,
      },
      template: `
<div class="hero-section relative min-h-screen flex items-center justify-center text-white overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"></div>
  <div class="absolute inset-0 bg-black opacity-50"></div>
  <div class="relative z-10 text-center max-w-4xl mx-auto px-4">
    <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">{{title}}</h1>
    <p class="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up animation-delay-200">{{subtitle}}</p>
    <button class="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all animate-fade-in-up animation-delay-400">
      {{ctaText}}
    </button>
  </div>
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  </div>
</div>`
    },
    {
      id: 'contact-form',
      name: 'Contact Form',
      description: 'Modern contact form với validation và styling',
      category: 'business',
      icon: Mail,
      color: 'bg-green-500',
      preview: '/templates/contact-form.jpg',
      data: {
        type: 'contact',
        fields: ['title', 'description', 'email', 'phone'],
        layout: 'form',
        responsive: true,
      },
      template: `
<div class="contact-form max-w-2xl mx-auto p-8">
  <div class="text-center mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">{{title}}</h2>
    <p class="text-gray-600">{{description}}</p>
  </div>
  <form class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
        <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Nhập họ và tên" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Nhập email" />
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
      <input type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Nhập số điện thoại" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Tin nhắn</label>
      <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Nhập tin nhắn của bạn"></textarea>
    </div>
    <button type="submit" class="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all">
      Gửi tin nhắn
    </button>
  </form>
</div>`
    },
    {
      id: 'testimonials',
      name: 'Testimonials',
      description: 'Customer testimonials với avatar và rating',
      category: 'business',
      icon: MessageSquare,
      color: 'bg-yellow-500',
      preview: '/templates/testimonials.jpg',
      data: {
        type: 'testimonial',
        fields: ['title', 'testimonials'],
        layout: 'grid',
        responsive: true,
      },
      template: `
<div class="testimonials py-16 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{{title}}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {{#each testimonials}}
      <div class="testimonial-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center mb-4">
          {{#repeat rating}}
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          {{/repeat}}
        </div>
        <p class="text-gray-600 mb-4 italic">"{{content}}"</p>
        <div class="flex items-center">
          <img src="{{avatar}}" alt="{{name}}" class="w-12 h-12 rounded-full mr-4" />
          <div>
            <h4 class="font-semibold text-gray-900">{{name}}</h4>
            <p class="text-sm text-gray-500">{{position}}</p>
          </div>
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</div>`
    },
    {
      id: 'faq-section',
      name: 'FAQ Section',
      description: 'Frequently Asked Questions với accordion',
      category: 'business',
      icon: HelpCircle,
      color: 'bg-indigo-500',
      preview: '/templates/faq.jpg',
      data: {
        type: 'faq',
        fields: ['title', 'faqs'],
        layout: 'accordion',
        responsive: true,
      },
      template: `
<div class="faq-section py-16">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{{title}}</h2>
    <div class="space-y-4">
      {{#each faqs}}
      <div class="faq-item border border-gray-200 rounded-lg">
        <button class="faq-question w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50">
          <span class="font-semibold text-gray-900">{{question}}</span>
          <svg class="w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="faq-answer px-6 pb-4 text-gray-600">
          {{answer}}
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</div>`
    },
    {
      id: 'newsletter-signup',
      name: 'Newsletter Signup',
      description: 'Email subscription form với social proof',
      category: 'marketing',
      icon: Heart,
      color: 'bg-pink-500',
      preview: '/templates/newsletter.jpg',
      data: {
        type: 'newsletter',
        fields: ['title', 'description', 'subscriberCount'],
        layout: 'centered',
        responsive: true,
      },
      template: `
<div class="newsletter-signup bg-gradient-to-r from-pink-500 to-purple-600 py-16">
  <div class="max-w-2xl mx-auto text-center px-4">
    <h2 class="text-3xl font-bold text-white mb-4">{{title}}</h2>
    <p class="text-pink-100 mb-8">{{description}}</p>
    <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
      <input type="email" placeholder="Nhập email của bạn" class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none" />
      <button class="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
        Đăng ký
      </button>
    </div>
    <p class="text-pink-200 text-sm">
      Tham gia cùng {{subscriberCount}}+ người đăng ký khác
    </p>
    <div class="flex justify-center items-center mt-4 space-x-2">
      <svg class="w-4 h-4 text-pink-200" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
      </svg>
      <span class="text-pink-200 text-sm">Không spam, hủy đăng ký bất kỳ lúc nào</span>
    </div>
  </div>
</div>`
    }
  ];

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return templates;
    return templates.filter(template => template.category === selectedCategory);
  }, [selectedCategory]);

  // Apply template to PageBuilder
  const { handleAddTemplateBlock } = usePageActions();
  
  const applyTemplate = useCallback((template: typeof templates[0]) => {
    // Use handleAddTemplateBlock with proper template configuration
    if (handleAddTemplateBlock) {
      handleAddTemplateBlock({
        templateId: template.id,
        templateName: template.name,
        template: template.template,
        dataSource: {
          type: 'static',
          data: template.data
        },
        variables: {
          title: template.name,
          layout: template.data.layout,
          responsive: template.data.responsive
        }
      });
    } else {
      // Fallback to regular block
      handleAddBlock(BlockType.DYNAMIC);
    }
    
    pageBuilderLogger.success(LOG_OPERATIONS.TEMPLATE_APPLY, 'Template applied', {
      name: template.name,
      type: template.data.type,
      layout: template.data.layout,
    });
  }, [handleAddBlock]);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Template Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="landing">Landing Page</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${template.color} text-white`}>
                  <template.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Template Info */}
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  {template.data.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.data.layout}
                </Badge>
                {template.data.responsive && (
                  <Badge variant="outline" className="text-xs">
                    responsive
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    setCustomizationModal({ isOpen: true, template });
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Customize
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => applyTemplate(template)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Page
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No templates found</p>
        </div>
      )}

      {/* Info Panel */}
      <Card className="p-3 bg-blue-50">
        <div className="text-xs text-blue-700">
          <h5 className="font-semibold mb-2">💡 Template Features:</h5>
          <ul className="space-y-1 text-xs">
            <li>• Dynamic data từ database</li>
            <li>• Responsive design</li>
            <li>• Customizable variables</li>
            <li>• Real-time preview</li>
          </ul>
        </div>
      </Card>

      {/* Template Customization Modal */}
      {customizationModal.isOpen && customizationModal.template && (
        <TemplateCustomizationModal
          isOpen={customizationModal.isOpen}
          template={customizationModal.template}
          onClose={() => setCustomizationModal({ isOpen: false, template: null })}
          onApply={(customizedTemplate) => {
            applyTemplate(customizedTemplate);
            setCustomizationModal({ isOpen: false, template: null });
          }}
        />
      )}
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
// Component only re-renders when context values it uses actually change
export const PageBuilderSidebar = PageBuilderSidebarComponent;
