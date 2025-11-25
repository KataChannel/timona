/**
 * TypeScript Types for Universal Dynamic Query System
 * 
 * Khớp với backend input types trong:
 * /backend/src/graphql/inputs/universal-query.input.ts
 */

// ==================== BASE TYPES ====================

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

// ==================== PAGINATION ====================

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total?: number;
  count: number;
  hasMore: boolean;
}

// ==================== UNIVERSAL QUERY INPUT ====================

export interface UniversalQueryInput {
  model: string;
  operation: 
    | 'findMany' 
    | 'findUnique' 
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'count'
    | 'aggregate'
    | 'groupBy';
  where?: Record<string, any>;
  data?: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
  orderBy?: Record<string, any>;
  skip?: number;
  take?: number;
  cursor?: Record<string, any>;
  distinct?: string[];
}

// ==================== FIND INPUTS ====================

export interface FindManyInput {
  model: string;
  where?: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
  orderBy?: Record<string, any>;
  pagination?: PaginationInput;
}

export interface FindUniqueInput {
  model: string;
  where: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
}

export interface FindFirstInput {
  model: string;
  where?: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
  orderBy?: Record<string, any>;
}

// ==================== CREATE INPUTS ====================

export interface CreateInput {
  model: string;
  data: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
}

export interface CreateManyInput {
  model: string;
  data: Array<Record<string, any>>;
  skipDuplicates?: boolean;
}

// ==================== UPDATE INPUTS ====================

export interface UpdateInput {
  model: string;
  where: Record<string, any>;
  data: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
}

export interface UpdateManyInput {
  model: string;
  where: Record<string, any>;
  data: Record<string, any>;
}

export interface UpsertInput {
  model: string;
  where: Record<string, any>;
  create: Record<string, any>;
  update: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
}

// ==================== DELETE INPUTS ====================

export interface DeleteInput {
  model: string;
  where: Record<string, any>;
  select?: Record<string, any>;
  include?: Record<string, any>;
}

export interface DeleteManyInput {
  model: string;
  where: Record<string, any>;
}

// ==================== AGGREGATION INPUTS ====================

export interface CountInput {
  model: string;
  where?: Record<string, any>;
}

export interface AggregateInput {
  model: string;
  where?: Record<string, any>;
  _count?: Record<string, boolean> | boolean;
  _sum?: Record<string, boolean>;
  _avg?: Record<string, boolean>;
  _min?: Record<string, boolean>;
  _max?: Record<string, boolean>;
}

export interface GroupByInput {
  model: string;
  by: string[];
  where?: Record<string, any>;
  having?: Record<string, any>;
  orderBy?: Record<string, any>;
  skip?: number;
  take?: number;
  _count?: Record<string, boolean> | boolean;
  _sum?: Record<string, boolean>;
  _avg?: Record<string, boolean>;
  _min?: Record<string, boolean>;
  _max?: Record<string, boolean>;
}

// ==================== RESPONSE TYPES ====================

export interface DynamicQueryResult<T = any> {
  data: T | T[];
  count?: number;
  total?: number;
  hasMore?: boolean;
}

export interface CreateManyResult {
  count: number;
}

export interface UpdateManyResult {
  count: number;
}

export interface DeleteManyResult {
  count: number;
}

export interface CountResult {
  _all?: number;
  [key: string]: number | undefined;
}

export interface AggregateResult {
  _count?: CountResult | number;
  _sum?: Record<string, number>;
  _avg?: Record<string, number>;
  _min?: Record<string, any>;
  _max?: Record<string, any>;
}

export interface GroupByResult {
  [key: string]: any;
  _count?: CountResult | number;
  _sum?: Record<string, number>;
  _avg?: Record<string, number>;
  _min?: Record<string, any>;
  _max?: Record<string, any>;
}

// ==================== WHERE FILTER TYPES ====================

/**
 * Prisma Where Filters
 * https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting
 */

export interface StringFilter {
  equals?: string;
  not?: string | StringFilter;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'default' | 'insensitive';
}

export interface NumberFilter {
  equals?: number;
  not?: number | NumberFilter;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
}

export interface BooleanFilter {
  equals?: boolean;
  not?: boolean | BooleanFilter;
}

export interface DateTimeFilter {
  equals?: string | Date;
  not?: string | Date | DateTimeFilter;
  in?: (string | Date)[];
  notIn?: (string | Date)[];
  lt?: string | Date;
  lte?: string | Date;
  gt?: string | Date;
  gte?: string | Date;
}

// ==================== MODEL NAMES ====================

/**
 * All available Prisma models
 */
export type ModelName = 
  // Core
  | 'user'
  | 'post'
  | 'comment'
  | 'task'
  | 'tag'
  | 'category'
  
  // Auth & Security
  | 'authMethod'
  | 'verificationToken'
  | 'userSession'
  | 'auditLog'
  | 'role'
  | 'permission'
  | 'rolePermission'
  | 'userRoleAssignment'
  | 'userPermission'
  | 'resourceAccess'
  | 'userMfaSettings'
  
  // Content
  | 'postTag'
  | 'like'
  | 'taskComment'
  | 'taskMedia'
  | 'taskShare'
  | 'notification'
  | 'menu'
  | 'page'
  | 'pageBlock'
  
  // AI & Chat
  | 'chatbotModel'
  | 'trainingData'
  | 'chatConversation'
  | 'chatMessage'
  
  // Affiliate
  | 'affUser'
  | 'affCampaign'
  | 'affCampaignAffiliate'
  | 'affLink'
  | 'affClick'
  | 'affConversion'
  | 'affPaymentRequest'
  
  // Invoice & Accounting
  | 'ext_listhoadon'
  | 'ext_detailhoadon'
  | 'ext_dmhanghoa'
  | 'ext_dmkhachhang'
  | 'ext_vattukho'
  | 'ext_dmdonvi'
  | 'ext_dmsodo'
  | 'ext_trungtamcp'
  | 'ext_tieude';

// ==================== UTILITY TYPES ====================

/**
 * Make all properties of T required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties of T partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys from object type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// ==================== OPERATION TYPES ====================

export type QueryOperation = 
  | 'findMany'
  | 'findUnique'
  | 'findFirst'
  | 'count'
  | 'aggregate'
  | 'groupBy';

export type MutationOperation =
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany';

export type DynamicOperation = QueryOperation | MutationOperation;

// ==================== HOOK OPTIONS ====================

export interface DynamicQueryOptions {
  skip?: boolean;
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only' | 'no-cache';
  pollInterval?: number;
  notifyOnNetworkStatusChange?: boolean;
}

export interface DynamicMutationOptions {
  refetchQueries?: string[] | 'active' | 'all';
  awaitRefetchQueries?: boolean;
  optimisticResponse?: any;
  update?: (cache: any, result: any) => void;
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

// ==================== ERROR TYPES ====================

export interface DynamicQueryError {
  message: string;
  code?: string;
  path?: string[];
  extensions?: Record<string, any>;
}

export interface DynamicQueryResponse<T = any> {
  data?: T;
  error?: DynamicQueryError;
  loading: boolean;
}
