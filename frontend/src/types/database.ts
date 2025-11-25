/**
 * Database Types for Dynamic Templates
 * Types for Product, Task, Category, and other database entities
 */

// ============================================================================
// Product Types
// ============================================================================

export interface ProductType {
  id: string;
  name: string;
  description?: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock: number;
  unit: ProductUnit;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: CategoryType;
  images: ProductImageType[];
  variants: ProductVariantType[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageType {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  title?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantType {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  stock: number;
  attributes?: Record<string, any>;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductUnit {
  KG = 'KG',
  G = 'G',
  BUNDLE = 'BUNDLE',
  PIECE = 'PIECE',
  BAG = 'BAG',
  BOX = 'BOX',
}

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: string;
  parent?: CategoryType;
  children: CategoryType[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Task Types
// ============================================================================

export interface TaskType {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  completedAt?: string;
  progress: number;
  assigneeId?: string;
  assignee?: UserType;
  tags: string[];
  media: TaskMediaType[];
  comments: TaskCommentType[];
  shares: TaskShareType[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskMediaType {
  id: string;
  taskId: string;
  type: MediaType;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface TaskCommentType {
  id: string;
  taskId: string;
  content: string;
  authorId: string;
  author: UserType;
  parentId?: string;
  parent?: TaskCommentType;
  replies: TaskCommentType[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskShareType {
  id: string;
  taskId: string;
  sharedWithId: string;
  sharedWith: UserType;
  permission: SharePermission;
  shareToken?: string;
  expiresAt?: string;
  createdAt: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  MARKETING = 'MARKETING',
  MEETING = 'MEETING',
  RESEARCH = 'RESEARCH',
  OTHER = 'OTHER',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER',
}

export enum SharePermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

// ============================================================================
// User Types
// ============================================================================

export interface UserType {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  roles: UserRoleType[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleType {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationType {
  id: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  userId: string;
  user: UserType;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationTypeEnum {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_COMMENT = 'TASK_COMMENT',
  TASK_SHARED = 'TASK_SHARED',
  SYSTEM = 'SYSTEM',
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ProductFiltersInput {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  inStock?: boolean;
  origin?: string;
  units?: string[];
}

export interface GetProductsInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: ProductFiltersInput;
}

export interface TaskFilterInput {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigneeId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  tags?: string[];
}

export interface CategoryFilterInput {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}

// ============================================================================
// GraphQL Query Result Types
// ============================================================================

export interface GetProductsResult {
  products: PaginatedResult<ProductType>;
}

export interface GetTasksResult {
  tasks: PaginatedResult<TaskType>;
}

export interface GetCategoriesResult {
  categories: PaginatedResult<CategoryType>;
}