/**
 * Dynamic Template System with Database Integration
 * Supports Products, Tasks, and custom dynamic content
 */

import { PageTemplate, PageElement, TemplateCategory } from '@/types/template';
import { ProductType, TaskType, CategoryType } from '@/types/database';

// ============================================================================
// Template Variable System
// ============================================================================

export interface TemplateVariable {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'image' | 'color' | 'url' | 'rich_text' | 'boolean' | 'select' | 'database_query';
  defaultValue?: any;
  description?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  databaseConfig?: {
    table: 'product' | 'task' | 'category' | 'user';
    fields: string[];
    filter?: Record<string, any>;
    limit?: number;
    orderBy?: string;
  };
}

export interface TemplateDataSource {
  id: string;
  name: string;
  type: 'product' | 'task' | 'category' | 'custom';
  query: string;
  fields: string[];
  filters?: Record<string, any>;
  pagination?: {
    limit: number;
    offset: number;
  };
}

export interface DynamicTemplate extends PageTemplate {
  variables: TemplateVariable[];
  dataSources: TemplateDataSource[];
  compiledContent?: PageElement[];
  lastCompiled?: string;
}

// ============================================================================
// Template Compiler
// ============================================================================

export class TemplateCompiler {
  private variables: Map<string, any> = new Map();
  private dataSources: Map<string, any[]> = new Map();

  /**
   * Set template variables
   */
  setVariables(variables: Record<string, any>): void {
    Object.entries(variables).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
  }

  /**
   * Set data source results
   */
  setDataSource(sourceId: string, data: any[]): void {
    this.dataSources.set(sourceId, data);
  }

  /**
   * Compile template with variables and data
   */
  compile(template: DynamicTemplate, variables: Record<string, any> = {}, dataSources: Record<string, any[]> = {}): PageElement[] {
    this.setVariables(variables);
    
    Object.entries(dataSources).forEach(([key, data]) => {
      this.setDataSource(key, data);
    });

    return this.processElements(template.structure);
  }

  /**
   * Process template elements recursively
   */
  private processElements(elements: PageElement[]): PageElement[] {
    return elements.map(element => this.processElement(element));
  }

  /**
   * Process individual element
   */
  private processElement(element: PageElement): PageElement {
    const processedElement: PageElement = {
      ...element,
      content: this.processContent(element.content),
      styles: this.processStyles(element.styles),
      children: element.children ? this.processElements(element.children) : undefined,
    };

    // Process data binding
    if (processedElement.props?.dataBinding) {
      return this.processDataBinding(processedElement);
    }

    return processedElement;
  }

  /**
   * Process content with variable substitution
   */
  private processContent(content: any): any {
    if (typeof content === 'string') {
      return this.replaceVariables(content);
    }
    
    if (Array.isArray(content)) {
      return content.map(item => this.processContent(item));
    }
    
    if (content && typeof content === 'object') {
      const processed: any = {};
      Object.entries(content).forEach(([key, value]) => {
        processed[key] = this.processContent(value);
      });
      return processed;
    }

    return content;
  }

  /**
   * Process styles with variable substitution
   */
  private processStyles(styles: any): any {
    if (!styles) return styles;

    const processed: any = {};
    Object.entries(styles).forEach(([key, value]) => {
      processed[key] = this.processContent(value);
    });
    return processed;
  }

  /**
   * Replace variables in text
   */
  private replaceVariables(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variablePath) => {
      const value = this.getVariableValue(variablePath.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get variable value with dot notation support
   */
  private getVariableValue(path: string): any {
    const parts = path.split('.');
    let value: any;

    // Check if it's a data source reference
    if (parts[0] === 'data' && parts.length > 1) {
      const sourceId = parts[1];
      const data = this.dataSources.get(sourceId);
      
      if (data && parts.length > 2) {
        const index = parseInt(parts[2]) || 0;
        if (data[index] && parts.length > 3) {
          const field = parts.slice(3).join('.');
          return this.getNestedValue(data[index], field);
        }
        return data[index];
      }
      return data;
    }

    // Check variables
    value = this.variables.get(parts[0]);
    
    if (value !== undefined && parts.length > 1) {
      const nestedPath = parts.slice(1).join('.');
      return this.getNestedValue(value, nestedPath);
    }

    return value;
  }

  /**
   * Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Process data binding for repeated elements
   */
  private processDataBinding(element: PageElement): PageElement {
    const dataBinding = element.props?.dataBinding;
    if (!dataBinding) return element;

    const data = this.dataSources.get(dataBinding.source);
    if (!data) return element;

    // Create repeated elements
    const repeatedElements: PageElement[] = data.map((item, index) => {
      // Set current item context
      const itemVariables = new Map(this.variables);
      itemVariables.set('item', item);
      itemVariables.set('index', index);

      // Temporarily update variables
      const originalVariables = this.variables;
      this.variables = itemVariables;

      const processedElement = this.processElement({
        ...element,
        id: `${element.id}_${index}`,
        props: {
          ...element.props,
          dataBinding: undefined, // Remove to prevent infinite recursion
        },
      });

      // Restore original variables
      this.variables = originalVariables;

      return processedElement;
    });

    // Return container with repeated elements
    return {
      ...element,
      children: repeatedElements,
      props: {
        ...element.props,
        dataBinding: undefined,
      },
    };
  }
}

// ============================================================================
// Database Integration Service
// ============================================================================

export class DatabaseTemplateService {
  /**
   * Fetch data for template data sources
   */
  async fetchDataSources(dataSources: TemplateDataSource[]): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};

    for (const source of dataSources) {
      try {
        const data = await this.fetchDataSource(source);
        results[source.id] = data;
      } catch (error) {
        console.error(`Failed to fetch data source ${source.id}:`, error);
        results[source.id] = [];
      }
    }

    return results;
  }

  /**
   * Fetch data for single data source
   */
  private async fetchDataSource(source: TemplateDataSource): Promise<any[]> {
    switch (source.type) {
      case 'product':
        return this.fetchProducts(source);
      case 'task':
        return this.fetchTasks(source);
      case 'category':
        return this.fetchCategories(source);
      default:
        return this.fetchCustomData(source);
    }
  }

  /**
   * Fetch products from GraphQL API
   */
  private async fetchProducts(source: TemplateDataSource): Promise<any[]> {
    const query = `
      query GetProducts($limit: Int, $filters: ProductFiltersInput) {
        products(limit: $limit, filters: $filters) {
          items {
            id
            name
            description
            price
            originalPrice
            discountPercentage
            images {
              url
              alt
              isPrimary
            }
            category {
              name
              slug
            }
            status
            stock
            unit
            isActive
            isFeatured
            createdAt
          }
        }
      }
    `;

    const variables = {
      limit: source.pagination?.limit || 10,
      filters: source.filters || {},
    };

    // This would be actual GraphQL call in real implementation
    return this.mockApiCall('products', variables);
  }

  /**
   * Fetch tasks from GraphQL API
   */
  private async fetchTasks(source: TemplateDataSource): Promise<any[]> {
    const query = `
      query GetTasks($limit: Int, $filters: TaskFilterInput) {
        tasks(limit: $limit, filters: $filters) {
          items {
            id
            title
            description
            status
            priority
            category
            dueDate
            completedAt
            progress
            assignee {
              name
              email
              avatar
            }
            tags
            createdAt
            updatedAt
          }
        }
      }
    `;

    const variables = {
      limit: source.pagination?.limit || 10,
      filters: source.filters || {},
    };

    return this.mockApiCall('tasks', variables);
  }

  /**
   * Fetch categories from GraphQL API
   */
  private async fetchCategories(source: TemplateDataSource): Promise<any[]> {
    const query = `
      query GetCategories($limit: Int) {
        categories(limit: $limit) {
          items {
            id
            name
            slug
            description
            image
            productCount
            isActive
            displayOrder
            parent {
              name
              slug
            }
            children {
              name
              slug
              productCount
            }
          }
        }
      }
    `;

    const variables = {
      limit: source.pagination?.limit || 10,
    };

    return this.mockApiCall('categories', variables);
  }

  /**
   * Fetch custom data (placeholder)
   */
  private async fetchCustomData(source: TemplateDataSource): Promise<any[]> {
    // This would implement custom data fetching logic
    return [];
  }

  /**
   * Mock API call (replace with actual GraphQL client)
   */
  private async mockApiCall(type: string, variables: any): Promise<any[]> {
    // This would be replaced with actual GraphQL client call
    // For now, return mock data
    switch (type) {
      case 'products':
        return this.getMockProducts();
      case 'tasks':
        return this.getMockTasks();
      case 'categories':
        return this.getMockCategories();
      default:
        return [];
    }
  }

  /**
   * Mock product data
   */
  private getMockProducts(): any[] {
    return [
      {
        id: '1',
        name: 'Rau muống hữu cơ',
        description: 'Rau muống tươi ngon, trồng hữu cơ không thuốc trừ sâu',
        price: 15000,
        originalPrice: 20000,
        discountPercentage: 25,
        images: [
          { url: '/images/rau-muong.jpg', alt: 'Rau muống hữu cơ', isPrimary: true }
        ],
        category: { name: 'Rau xanh', slug: 'rau-xanh' },
        status: 'ACTIVE',
        stock: 50,
        unit: 'BUNDLE',
        isActive: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Cà rốt Đà Lạt',
        description: 'Cà rốt tươi ngon từ Đà Lạt, giàu vitamin A',
        price: 25000,
        originalPrice: 30000,
        discountPercentage: 17,
        images: [
          { url: '/images/ca-rot.jpg', alt: 'Cà rốt Đà Lạt', isPrimary: true }
        ],
        category: { name: 'Rau củ', slug: 'rau-cu' },
        status: 'ACTIVE',
        stock: 30,
        unit: 'KG',
        isActive: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Mock task data
   */
  private getMockTasks(): any[] {
    return [
      {
        id: '1',
        title: 'Thiết kế giao diện trang chủ',
        description: 'Tạo wireframe và mockup cho trang chủ website',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'DESIGN',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 65,
        assignee: {
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          avatar: '/avatars/user1.jpg'
        },
        tags: ['UI/UX', 'Frontend', 'Design'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Tích hợp API thanh toán',
        description: 'Tích hợp gateway thanh toán VNPay và MoMo',
        status: 'TODO',
        priority: 'MEDIUM',
        category: 'DEVELOPMENT',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        assignee: {
          name: 'Trần Thị B',
          email: 'tranthib@example.com',
          avatar: '/avatars/user2.jpg'
        },
        tags: ['Backend', 'Payment', 'Integration'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Mock category data
   */
  private getMockCategories(): any[] {
    return [
      {
        id: '1',
        name: 'Rau xanh',
        slug: 'rau-xanh',
        description: 'Các loại rau xanh tươi ngon',
        image: '/images/categories/rau-xanh.jpg',
        productCount: 25,
        isActive: true,
        displayOrder: 1,
        children: [
          { name: 'Rau muống', slug: 'rau-muong', productCount: 5 },
          { name: 'Rau cải', slug: 'rau-cai', productCount: 8 },
          { name: 'Rau bí', slug: 'rau-bi', productCount: 3 },
        ]
      },
      {
        id: '2',
        name: 'Rau củ',
        slug: 'rau-cu',
        description: 'Các loại rau củ tươi ngon',
        image: '/images/categories/rau-cu.jpg',
        productCount: 18,
        isActive: true,
        displayOrder: 2,
        children: [
          { name: 'Cà rốt', slug: 'ca-rot', productCount: 4 },
          { name: 'Khoai tây', slug: 'khoai-tay', productCount: 6 },
          { name: 'Củ cải', slug: 'cu-cai', productCount: 5 },
        ]
      },
    ];
  }
}

// ============================================================================
// Template Registry
// ============================================================================

export interface TemplateRegistryEntry {
  id: string;
  template: DynamicTemplate;
  metadata: {
    name: string;
    description: string;
    author: string;
    version: string;
    tags: string[];
    previewImage?: string;
    lastModified: string;
  };
}

export class TemplateRegistry {
  private templates: Map<string, TemplateRegistryEntry> = new Map();
  private compiler = new TemplateCompiler();
  private dbService = new DatabaseTemplateService();

  /**
   * Register a new template
   */
  register(entry: TemplateRegistryEntry): void {
    this.templates.set(entry.id, entry);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): TemplateRegistryEntry | undefined {
    return this.templates.get(id);
  }

  /**
   * List all templates
   */
  listTemplates(): TemplateRegistryEntry[] {
    return Array.from(this.templates.values());
  }

  /**
   * Compile template with data
   */
  async compileTemplate(
    templateId: string, 
    variables: Record<string, any> = {}
  ): Promise<PageElement[] | null> {
    const entry = this.templates.get(templateId);
    if (!entry) return null;

    const { template } = entry;

    // Fetch data sources
    const dataSources = await this.dbService.fetchDataSources(template.dataSources);

    // Compile template
    return this.compiler.compile(template, variables, dataSources);
  }

  /**
   * Validate template structure
   */
  validateTemplate(template: DynamicTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.structure || !Array.isArray(template.structure)) {
      errors.push('Template structure must be an array');
    }

    // Validate variables
    template.variables?.forEach((variable, index) => {
      if (!variable.id) errors.push(`Variable ${index}: ID is required`);
      if (!variable.name) errors.push(`Variable ${index}: Name is required`);
      if (!variable.type) errors.push(`Variable ${index}: Type is required`);
    });

    // Validate data sources
    template.dataSources?.forEach((source, index) => {
      if (!source.id) errors.push(`Data source ${index}: ID is required`);
      if (!source.type) errors.push(`Data source ${index}: Type is required`);
      if (!source.fields || source.fields.length === 0) {
        errors.push(`Data source ${index}: Fields are required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}