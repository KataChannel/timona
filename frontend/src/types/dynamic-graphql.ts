/**
 * ============================================================================
 * DYNAMIC GRAPHQL TYPES - FRONTEND
 * ============================================================================
 * 
 * Type definitions for Dynamic GraphQL operations
 * 
 * @version 2.0.0
 */

// ========================================
// COMMON TYPES
// ========================================

export type WhereInput = Record<string, any>;
export type OrderByInput = Record<string, 'asc' | 'desc'>;
export type SelectInput = Record<string, boolean>;
export type IncludeInput = Record<string, boolean | { where?: WhereInput; select?: SelectInput }>;

// ========================================
// QUERY OPTIONS
// ========================================

export interface FindManyOptions {
  where?: WhereInput;
  orderBy?: OrderByInput;
  skip?: number;
  take?: number;
  select?: SelectInput;
  include?: IncludeInput;
  distinct?: string[];
}

export interface FindUniqueOptions {
  select?: SelectInput;
  include?: IncludeInput;
}

export interface FindFirstOptions {
  where?: WhereInput;
  orderBy?: OrderByInput;
  select?: SelectInput;
  include?: IncludeInput;
}

export interface PaginatedOptions {
  page?: number;
  limit?: number;
  where?: WhereInput;
  orderBy?: OrderByInput;
  select?: SelectInput;
  include?: IncludeInput;
}

export interface CountOptions {
  where?: WhereInput;
}

export interface AggregateOptions {
  _count?: boolean | { [field: string]: boolean };
  _sum?: { [field: string]: boolean };
  _avg?: { [field: string]: boolean };
  _min?: { [field: string]: boolean };
  _max?: { [field: string]: boolean };
  where?: WhereInput;
}

export interface GroupByOptions {
  by: string[];
  _count?: boolean | { [field: string]: boolean };
  _sum?: { [field: string]: boolean };
  _avg?: { [field: string]: boolean };
  _min?: { [field: string]: boolean };
  _max?: { [field: string]: boolean };
  where?: WhereInput;
  orderBy?: OrderByInput;
  having?: WhereInput;
}

// ========================================
// MUTATION OPTIONS
// ========================================

export interface CreateOptions<T = any> {
  data: Partial<T>;
  select?: SelectInput;
  include?: IncludeInput;
}

export interface CreateManyOptions<T = any> {
  data: Partial<T>[];
  skipDuplicates?: boolean;
}

export interface UpdateOptions<T = any> {
  where: WhereInput;
  data: Partial<T>;
  select?: SelectInput;
  include?: IncludeInput;
}

export interface UpdateManyOptions<T = any> {
  where?: WhereInput;
  data: Partial<T>;
}

export interface DeleteOptions {
  where: WhereInput;
  select?: SelectInput;
}

export interface DeleteManyOptions {
  where?: WhereInput;
}

export interface UpsertOptions<T = any> {
  where: WhereInput;
  create: Partial<T>;
  update: Partial<T>;
  select?: SelectInput;
  include?: IncludeInput;
}

// ========================================
// RESULT TYPES
// ========================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface MutationResult {
  success: boolean;
  count?: number;
  error?: string;
}

export interface AggregateResult {
  _count?: any;
  _sum?: any;
  _avg?: any;
  _min?: any;
  _max?: any;
}

export interface GroupByResult {
  [key: string]: any;
  _count?: any;
  _sum?: any;
  _avg?: any;
  _min?: any;
  _max?: any;
}

// ========================================
// HOOK RETURN TYPES
// ========================================

export interface QueryHookResult<T> {
  data: T | undefined;
  loading: boolean;
  error: any;
  refetch: () => void;
}

export interface PaginatedHookResult<T> {
  data: T[] | undefined;
  meta: PaginationMeta | undefined;
  loading: boolean;
  error: any;
  refetch: () => void;
  page: number;
  limit: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  changeLimit: (limit: number) => void;
}

export interface MutationHookResult<T, TVariables> {
  mutate: (variables: TVariables) => Promise<T>;
  data: T | undefined;
  loading: boolean;
  error: any;
}

// ========================================
// MODEL TYPES (Auto-generated from Prisma)
// ========================================

// You can import these from Prisma generated types
// or define them manually

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  tasks?: Task[];
  posts?: Post[];
  comments?: Comment[];
  _count?: {
    tasks: number;
    posts: number;
    comments: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  dueDate?: Date;
  completedAt?: Date;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user?: User;
  assignedTo?: User[];
  comments?: TaskComment[];
  _count?: {
    comments: number;
  };
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  author?: User;
  comments?: Comment[];
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  post?: Post;
  user?: User;
  parent?: Comment;
  replies?: Comment[];
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  task?: Task;
  user?: User;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  category?: Category;
  images?: any[];
  variants?: any[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  parent?: Category;
  children?: Category[];
  products?: Product[];
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  customerId?: string;
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  customer?: User;
  items?: any[];
}

// Add more model types as needed...

// ========================================
// HELPER TYPES
// ========================================

export type ModelName = 
  | 'user'
  | 'task'
  | 'post'
  | 'comment'
  | 'taskComment'
  | 'product'
  | 'category'
  | 'invoice'
  | 'page'
  | 'pageBlock'
  | 'notification'
  | 'auditLog'
  | 'role'
  | 'permission'
  // Add more model names as needed
  | string;

export type OperationType = 
  | 'findMany'
  | 'findUnique'
  | 'findFirst'
  | 'findManyPaginated'
  | 'count'
  | 'aggregate'
  | 'groupBy'
  | 'createOne'
  | 'createMany'
  | 'updateOne'
  | 'updateMany'
  | 'deleteOne'
  | 'deleteMany'
  | 'upsert';
