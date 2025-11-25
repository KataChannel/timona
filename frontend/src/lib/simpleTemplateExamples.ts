/**
 * Simple Dynamic Template Examples
 * Compatible with existing PageBuilder type system
 */

import { DynamicTemplate, TemplateVariable, TemplateDataSource } from '@/lib/dynamicTemplateSystem';
import { PageElement, TemplateCategory } from '@/types/template';

// ============================================================================
// Simple Product Grid Template
// ============================================================================

export const SIMPLE_PRODUCT_GRID_TEMPLATE: DynamicTemplate = {
  id: 'simple-product-grid-1',
  name: 'Lưới sản phẩm đơn giản',
  description: 'Template hiển thị danh sách sản phẩm trong lưới đơn giản',
  category: 'ecommerce' as TemplateCategory,
  thumbnail: '/templates/simple-product-grid.jpg',
  author: 'KataTeam',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['ecommerce', 'products', 'grid'],
  isDefault: false,
  
  // Template Variables
  variables: [
    {
      id: 'title',
      name: 'title',
      label: 'Tiêu đề section',
      type: 'text',
      defaultValue: 'Sản phẩm nổi bật',
      required: true,
    },
    {
      id: 'backgroundColor',
      name: 'backgroundColor',
      label: 'Màu nền',
      type: 'color',
      defaultValue: '#ffffff',
    },
    {
      id: 'productsPerRow',
      name: 'productsPerRow',
      label: 'Số sản phẩm mỗi hàng',
      type: 'select',
      defaultValue: '3',
      validation: {
        options: ['2', '3', '4'],
      },
    },
  ],

  // Data Sources
  dataSources: [
    {
      id: 'products',
      name: 'Danh sách sản phẩm',
      type: 'product',
      query: 'getProducts',
      fields: ['id', 'name', 'price', 'images'],
      filters: {
        isFeatured: true,
        isActive: true,
      },
      pagination: {
        limit: 6,
        offset: 0,
      },
    },
  ],

  // Simple Structure
  structure: [
    {
      id: 'product-section',
      type: 'container',
      content: `
        <section class="product-section" style="padding: 60px 20px; background-color: {{backgroundColor}};">
          <div class="container" style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 40px; color: #333;">
              {{title}}
            </h2>
            <div class="products-grid" style="display: grid; grid-template-columns: repeat({{productsPerRow}}, 1fr); gap: 24px;">
              {{#each data.products}}
              <div class="product-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                {{#if images.0.url}}
                <img src="{{images.0.url}}" alt="{{name}}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">
                {{/if}}
                <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px; color: #333;">{{name}}</h3>
                <p style="font-size: 1.25rem; font-weight: bold; color: #059669;">{{price | currency}}</p>
              </div>
              {{/each}}
            </div>
          </div>
        </section>
      `,
      styles: {},
      props: {
        dataBinding: {
          source: 'products',
        },
      },
    },
  ],
};

// ============================================================================
// Simple Task List Template
// ============================================================================

export const SIMPLE_TASK_LIST_TEMPLATE: DynamicTemplate = {
  id: 'simple-task-list-1',
  name: 'Danh sách công việc đơn giản',
  description: 'Template hiển thị danh sách công việc theo trạng thái',
  category: 'productivity' as TemplateCategory,
  thumbnail: '/templates/simple-task-list.jpg',
  author: 'KataTeam',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['productivity', 'tasks', 'list'],
  isDefault: false,

  variables: [
    {
      id: 'title',
      name: 'title',
      label: 'Tiêu đề',
      type: 'text',
      defaultValue: 'Danh sách công việc',
      required: true,
    },
    {
      id: 'showProgress',
      name: 'showProgress',
      label: 'Hiển thị tiến độ',
      type: 'boolean',
      defaultValue: true,
    },
  ],

  dataSources: [
    {
      id: 'tasks',
      name: 'Danh sách công việc',
      type: 'task',
      query: 'getTasks',
      fields: ['id', 'title', 'status', 'priority', 'progress', 'dueDate'],
      filters: {
        status: ['TODO', 'IN_PROGRESS'],
      },
      pagination: {
        limit: 10,
        offset: 0,
      },
    },
  ],

  structure: [
    {
      id: 'task-section',
      type: 'container',
      content: `
        <section class="task-section" style="padding: 40px 20px; background-color: #f8fafc;">
          <div class="container" style="max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 2rem; margin-bottom: 32px; color: #1e293b;">
              {{title}}
            </h2>
            <div class="task-list">
              {{#each data.tasks}}
              <div class="task-card" style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; flex: 1;">{{title}}</h3>
                  <span class="priority priority-{{priority}}" style="
                    font-size: 0.75rem; 
                    font-weight: 600; 
                    padding: 4px 8px; 
                    border-radius: 4px;
                    background-color: {{#eq priority 'HIGH'}}#fef2f2{{/eq}}{{#eq priority 'MEDIUM'}}#fffbeb{{/eq}}{{#eq priority 'LOW'}}#f0fdf4{{/eq}};
                    color: {{#eq priority 'HIGH'}}#dc2626{{/eq}}{{#eq priority 'MEDIUM'}}#d97706{{/eq}}{{#eq priority 'LOW'}}#16a34a{{/eq}};
                  ">{{priority}}</span>
                </div>
                {{#if ../showProgress}}
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.75rem; color: #64748b;">Tiến độ</span>
                    <span style="font-size: 0.75rem; color: #64748b;">{{progress}}%</span>
                  </div>
                  <div style="width: 100%; height: 6px; background-color: #e2e8f0; border-radius: 3px; overflow: hidden;">
                    <div style="width: {{progress}}%; height: 100%; background-color: #3b82f6; transition: width 0.3s ease;"></div>
                  </div>
                </div>
                {{/if}}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="status status-{{status}}" style="
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background-color: {{#eq status 'TODO'}}#f1f5f9{{/eq}}{{#eq status 'IN_PROGRESS'}}#fef3c7{{/eq}}{{#eq status 'DONE'}}#d1fae5{{/eq}};
                    color: {{#eq status 'TODO'}}#475569{{/eq}}{{#eq status 'IN_PROGRESS'}}#92400e{{/eq}}{{#eq status 'DONE'}}#065f46{{/eq}};
                  ">{{status}}</span>
                  {{#if dueDate}}
                  <span style="font-size: 0.75rem; color: #64748b;">Hạn: {{dueDate | formatDate}}</span>
                  {{/if}}
                </div>
              </div>
              {{/each}}
            </div>
          </div>
        </section>
      `,
      styles: {},
      props: {
        dataBinding: {
          source: 'tasks',
        },
      },
    },
  ],
};

// ============================================================================
// Template Usage Example
// ============================================================================

export const TEMPLATE_USAGE_EXAMPLE = `
// 1. Khởi tạo template registry
import { TemplateRegistry } from '@/lib/dynamicTemplateSystem';
import { SIMPLE_PRODUCT_GRID_TEMPLATE, SIMPLE_TASK_LIST_TEMPLATE } from '@/lib/simpleTemplateExamples';

const registry = new TemplateRegistry();

// 2. Đăng ký templates
registry.register({
  id: SIMPLE_PRODUCT_GRID_TEMPLATE.id,
  template: SIMPLE_PRODUCT_GRID_TEMPLATE,
  metadata: {
    name: SIMPLE_PRODUCT_GRID_TEMPLATE.name,
    description: SIMPLE_PRODUCT_GRID_TEMPLATE.description,
    author: 'KataTeam',
    version: '1.0.0',
    tags: SIMPLE_PRODUCT_GRID_TEMPLATE.tags || [],
    lastModified: new Date().toISOString(),
  },
});

// 3. Sử dụng template với dữ liệu tùy chỉnh
const compiledElements = await registry.compileTemplate('simple-product-grid-1', {
  title: 'Sản phẩm mới nhất',
  backgroundColor: '#f0f9ff',
  productsPerRow: '4',
});

// 4. Render compiled elements trong PageBuilder
if (compiledElements) {
  // Add to page builder canvas
  pageBuilder.addElements(compiledElements);
}
`;

// ============================================================================
// Template Creation Guide
// ============================================================================

export const TEMPLATE_CREATION_GUIDE = {
  steps: [
    {
      title: 'Định nghĩa Template',
      description: 'Tạo đối tượng DynamicTemplate với metadata và cấu trúc',
      code: `
const myTemplate: DynamicTemplate = {
  id: 'unique-template-id',
  name: 'Tên Template',
  description: 'Mô tả template',
  category: 'ecommerce',
  variables: [], // Các biến có thể tùy chỉnh
  dataSources: [], // Nguồn dữ liệu từ database
  structure: [], // Cấu trúc HTML/CSS
};`,
    },
    {
      title: 'Cấu hình Variables',
      description: 'Định nghĩa các biến cho phép người dùng tùy chỉnh',
      code: `
variables: [
  {
    id: 'title',
    name: 'title',
    label: 'Tiêu đề',
    type: 'text',
    defaultValue: 'Tiêu đề mặc định',
    required: true,
  },
  {
    id: 'color',
    name: 'color',
    label: 'Màu sắc',
    type: 'color',
    defaultValue: '#3b82f6',
  },
]`,
    },
    {
      title: 'Cấu hình Data Sources',
      description: 'Kết nối với dữ liệu từ database',
      code: `
dataSources: [
  {
    id: 'products',
    name: 'Sản phẩm',
    type: 'product',
    query: 'getProducts',
    fields: ['id', 'name', 'price', 'images'],
    filters: { isActive: true },
    pagination: { limit: 10, offset: 0 },
  },
]`,
    },
    {
      title: 'Thiết kế Structure',
      description: 'Tạo cấu trúc HTML với placeholders cho dữ liệu động',
      code: `
structure: [
  {
    id: 'section-1',
    type: 'container',
    content: \`
      <div class="my-section">
        <h2>{{title}}</h2>
        {{#each data.products}}
        <div class="product-card">
          <h3>{{name}}</h3>
          <p>{{price | currency}}</p>
        </div>
        {{/each}}
      </div>
    \`,
    dataBinding: { source: 'products' },
  },
]`,
    },
  ],
  tips: [
    'Sử dụng cú pháp {{variable}} để chèn biến',
    'Sử dụng {{#each}} để lặp qua danh sách dữ liệu', 
    'Sử dụng filters như |currency, |formatDate để format dữ liệu',
    'Test template trước khi deploy với dữ liệu thật',
    'Tối ưu performance bằng cách giới hạn số lượng items',
  ],
  bestPractices: [
    'Đặt tên ID duy nhất cho template',
    'Cung cấp default values cho tất cả variables',
    'Validate input data trước khi compile',
    'Sử dụng responsive design trong CSS',
    'Cache compiled templates để tăng performance',
  ],
};