/**
 * ============================================================================
 * UNIVERSAL DYNAMIC GRAPHQL CLIENT - ENTERPRISE LEVEL
 * ============================================================================
 * 
 * A type-safe, universal GraphQL client for all models
 * Code once, use everywhere! 🚀
 * 
 * Features:
 * - Auto-generated queries/mutations for all operations
 * - Type-safe with TypeScript generics
 * - Prisma-like syntax
 * - Built-in caching
 * - Error handling
 * - Loading states
 * 
 * @author Senior Full-Stack Engineer
 * @version 2.0.0
 */

import { gql } from '@apollo/client';

// ========================================
// QUERY OPERATIONS
// ========================================

/**
 * Find Many Records
 * Usage: FIND_MANY('task', { where: { status: 'ACTIVE' } })
 */
export const FIND_MANY = gql`
  query FindMany(
    $modelName: String!
    $input: UnifiedFindManyInput
  ) {
    findMany(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Find Unique Record
 */
export const FIND_UNIQUE = gql`
  query FindUnique(
    $modelName: String!
    $input: UnifiedFindByIdInput!
  ) {
    findById(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Find First Record
 */
export const FIND_FIRST = gql`
  query FindFirst(
    $modelName: String!
    $input: UnifiedFindManyInput
  ) {
    findMany(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Find with Pagination
 */
export const FIND_MANY_PAGINATED = gql`
  query FindManyPaginated(
    $modelName: String!
    $input: UnifiedPaginatedInput
  ) {
    findManyPaginated(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Count Records
 */
export const COUNT = gql`
  query Count(
    $modelName: String!
    $where: JSON
  ) {
    count(
      modelName: $modelName
      where: $where
    )
  }
`;

/**
 * Aggregate Operations
 */
export const AGGREGATE = gql`
  query Aggregate(
    $model: String!
    $options: JSON!
  ) {
    aggregate(
      model: $model
      options: $options
    )
  }
`;

/**
 * Group By
 */
export const GROUP_BY = gql`
  query GroupBy(
    $model: String!
    $options: JSON!
  ) {
    groupBy(
      model: $model
      options: $options
    )
  }
`;

// ========================================
// MUTATION OPERATIONS
// ========================================

/**
 * Create One Record
 */
export const CREATE_ONE = gql`
  mutation CreateOne(
    $modelName: String!
    $input: UnifiedCreateInput!
  ) {
    createOne(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Create Many Records
 */
export const CREATE_MANY = gql`
  mutation CreateMany(
    $model: String!
    $data: [JSON!]!
    $skipDuplicates: Boolean
  ) {
    createMany(
      model: $model
      data: $data
      skipDuplicates: $skipDuplicates
    )
  }
`;

/**
 * Update One Record
 */
export const UPDATE_ONE = gql`
  mutation UpdateOne(
    $modelName: String!
    $input: UnifiedUpdateInput!
  ) {
    updateOne(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Update Many Records
 */
export const UPDATE_MANY = gql`
  mutation UpdateMany(
    $model: String!
    $where: JSON
    $data: JSON!
  ) {
    updateMany(
      model: $model
      where: $where
      data: $data
    )
  }
`;

/**
 * Delete One Record
 */
export const DELETE_ONE = gql`
  mutation DeleteOne(
    $modelName: String!
    $input: UnifiedDeleteInput!
  ) {
    deleteOne(
      modelName: $modelName
      input: $input
    )
  }
`;

/**
 * Delete Many Records
 */
export const DELETE_MANY = gql`
  mutation DeleteMany(
    $model: String!
    $where: JSON
  ) {
    deleteMany(
      model: $model
      where: $where
    )
  }
`;

/**
 * Upsert Record
 */
export const UPSERT = gql`
  mutation Upsert(
    $model: String!
    $where: JSON!
    $create: JSON!
    $update: JSON!
    $select: JSON
    $include: JSON
  ) {
    upsert(
      model: $model
      where: $where
      create: $create
      update: $update
      select: $select
      include: $include
    )
  }
`;

// ========================================
// UTILITY OPERATIONS
// ========================================

/**
 * Get Available Models
 */
export const GET_AVAILABLE_MODELS = gql`
  query GetAvailableModels {
    getAvailableModels
  }
`;

/**
 * Clear Cache
 */
export const CLEAR_CACHE = gql`
  mutation ClearCache {
    clearCache
  }
`;
