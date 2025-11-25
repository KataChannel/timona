import { gql } from '@apollo/client';

/**
 * Universal Dynamic Query System - Frontend Integration
 * 
 * Tích hợp với backend Dynamic Query System mới
 * Backend resolvers: universalQuery, universalMutation, dynamicFindMany, etc.
 */

// ==================== UNIVERSAL QUERIES ====================

/**
 * Universal Query - Execute any Prisma query operation
 */
export const UNIVERSAL_QUERY = gql`
  query UniversalQuery($input: UniversalQueryInput!) {
    universalQuery(input: $input)
  }
`;

/**
 * Universal Mutation - Execute any Prisma mutation operation
 */
export const UNIVERSAL_MUTATION = gql`
  mutation UniversalMutation($input: UniversalQueryInput!) {
    universalMutation(input: $input)
  }
`;

// ==================== FIND QUERIES ====================

/**
 * Dynamic Find Many - Get multiple records with pagination
 * Uses old API: dynamicFindMany
 */
export const DYNAMIC_FIND_MANY = gql`
  query DynamicFindMany($input: FindManyInput!) {
    dynamicFindMany(input: $input)
  }
`;

/**
 * Find Many (New Unified API)
 * Uses new API: findMany
 */
export const FIND_MANY_UNIFIED = gql`
  query FindManyUnified($input: UnifiedFindManyInput, $modelName: String!) {
    findMany(modelName: $modelName, input: $input)
  }
`;

/**
 * Dynamic Find Unique - Get single record by unique identifier
 */
export const DYNAMIC_FIND_UNIQUE = gql`
  query DynamicFindUnique($input: FindUniqueInput!) {
    dynamicFindUnique(input: $input)
  }
`;

/**
 * Dynamic Find First - Get first matching record
 */
export const DYNAMIC_FIND_FIRST = gql`
  query DynamicFindFirst($input: FindManyInput!) {
    dynamicFindFirst(input: $input)
  }
`;

// ==================== CREATE MUTATIONS ====================

/**
 * Dynamic Create - Create single record
 */
export const DYNAMIC_CREATE = gql`
  mutation DynamicCreate($input: CreateInput!) {
    dynamicCreate(input: $input)
  }
`;

/**
 * Dynamic Create Many - Bulk create records
 */
export const DYNAMIC_CREATE_MANY = gql`
  mutation DynamicCreateMany($input: CreateManyInput!) {
    dynamicCreateMany(input: $input)
  }
`;

// ==================== UPDATE MUTATIONS ====================

/**
 * Dynamic Update - Update single record
 */
export const DYNAMIC_UPDATE = gql`
  mutation DynamicUpdate($input: UpdateInput!) {
    dynamicUpdate(input: $input)
  }
`;

/**
 * Dynamic Update Many - Bulk update records
 */
export const DYNAMIC_UPDATE_MANY = gql`
  mutation DynamicUpdateMany($input: UpdateManyInput!) {
    dynamicUpdateMany(input: $input)
  }
`;

/**
 * Dynamic Upsert - Create or update record
 */
export const DYNAMIC_UPSERT = gql`
  mutation DynamicUpsert($input: UpsertInput!) {
    dynamicUpsert(input: $input)
  }
`;

// ==================== DELETE MUTATIONS ====================

/**
 * Dynamic Delete - Delete single record
 */
export const DYNAMIC_DELETE = gql`
  mutation DynamicDelete($input: DeleteInput!) {
    dynamicDelete(input: $input)
  }
`;

/**
 * Dynamic Delete Many - Bulk delete records
 */
export const DYNAMIC_DELETE_MANY = gql`
  mutation DynamicDeleteMany($input: DeleteManyInput!) {
    dynamicDeleteMany(input: $input)
  }
`;

// ==================== AGGREGATION QUERIES ====================

/**
 * Dynamic Count - Count records matching criteria
 */
export const DYNAMIC_COUNT = gql`
  query DynamicCount($input: CountInput!) {
    dynamicCount(input: $input)
  }
`;

/**
 * Dynamic Aggregate - Compute aggregations (sum, avg, min, max, count)
 */
export const DYNAMIC_AGGREGATE = gql`
  query DynamicAggregate($input: AggregateInput!) {
    dynamicAggregate(input: $input)
  }
`;

/**
 * Dynamic Group By - Group records and compute aggregations
 */
export const DYNAMIC_GROUP_BY = gql`
  query DynamicGroupBy($input: GroupByInput!) {
    dynamicGroupBy(input: $input)
  }
`;

// ==================== UTILITY QUERIES ====================

/**
 * List Available Models - Get all available Prisma models
 */
export const LIST_AVAILABLE_MODELS = gql`
  query ListAvailableModels {
    listAvailableModels
  }
`;

// ==================== QUERY/MUTATION MAP ====================

/**
 * Map of all dynamic queries and mutations
 */
export const DYNAMIC_OPERATIONS = {
  // Universal
  universalQuery: UNIVERSAL_QUERY,
  universalMutation: UNIVERSAL_MUTATION,
  
  // Find operations
  findMany: DYNAMIC_FIND_MANY,
  findUnique: DYNAMIC_FIND_UNIQUE,
  findFirst: DYNAMIC_FIND_FIRST,
  
  // Create operations
  create: DYNAMIC_CREATE,
  createMany: DYNAMIC_CREATE_MANY,
  
  // Update operations
  update: DYNAMIC_UPDATE,
  updateMany: DYNAMIC_UPDATE_MANY,
  upsert: DYNAMIC_UPSERT,
  
  // Delete operations
  delete: DYNAMIC_DELETE,
  deleteMany: DYNAMIC_DELETE_MANY,
  
  // Aggregation operations
  count: DYNAMIC_COUNT,
  aggregate: DYNAMIC_AGGREGATE,
  groupBy: DYNAMIC_GROUP_BY,
  
  // Utility
  listModels: LIST_AVAILABLE_MODELS,
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get query/mutation by operation type
 */
export function getDynamicOperation(operationType: keyof typeof DYNAMIC_OPERATIONS) {
  return DYNAMIC_OPERATIONS[operationType];
}

/**
 * Check if operation is a query (read-only)
 */
export function isQueryOperation(operationType: string): boolean {
  return [
    'universalQuery',
    'findMany',
    'findUnique',
    'findFirst',
    'count',
    'aggregate',
    'groupBy',
    'listModels',
  ].includes(operationType);
}

/**
 * Check if operation is a mutation (write)
 */
export function isMutationOperation(operationType: string): boolean {
  return [
    'universalMutation',
    'create',
    'createMany',
    'update',
    'updateMany',
    'upsert',
    'delete',
    'deleteMany',
  ].includes(operationType);
}
