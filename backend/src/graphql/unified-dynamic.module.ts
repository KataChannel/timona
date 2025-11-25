import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UnifiedDynamicResolver } from './resolvers/unified-dynamic.resolver';
import { DynamicCRUDService } from '../services/dynamic-crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../services/user.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Unified Dynamic GraphQL Module
 * 
 * This module provides a single, unified GraphQL API for all models with Prisma-like syntax.
 * 
 * Supported Operations:
 * - Queries: findMany, findManyPaginated, findById, count, exists
 * - Mutations: createOne, updateOne, deleteOne, createMany, updateMany, deleteMany, upsert
 * 
 * Features:
 * - Prisma-like query syntax (where, orderBy, select, include, etc.)
 * - Support for all models and nested relationships
 * - Bulk operations for high performance
 * - Built-in pagination and filtering
 * - Type-safe with GraphQL schema validation
 * - Automatic caching for performance
 * 
 * Usage Examples:
 * 
 * Query all tasks:
 * ```graphql
 * query {
 *   findMany(modelName: "task") {
 *     id
 *     title
 *     status
 *   }
 * }
 * ```
 * 
 * Query tasks with filters and includes:
 * ```graphql
 * query {
 *   findMany(
 *     modelName: "task"
 *     input: {
 *       where: { status: "ACTIVE" }
 *       include: { author: true, comments: true }
 *       orderBy: { createdAt: "desc" }
 *       take: 10
 *     }
 *   ) {
 *     id
 *     title
 *     author { id email }
 *     comments { id content }
 *   }
 * }
 * ```
 * 
 * Create a new task:
 * ```graphql
 * mutation {
 *   createOne(
 *     modelName: "task"
 *     input: {
 *       data: {
 *         title: "New Task"
 *         description: "Task description"
 *         status: "ACTIVE"
 *         userId: "user-id"
 *       }
 *       include: { author: true }
 *     }
 *   ) {
 *     id
 *     title
 *     author { email }
 *   }
 * }
 * ```
 * 
 * Bulk create tasks:
 * ```graphql
 * mutation {
 *   createMany(
 *     modelName: "task"
 *     input: {
 *       data: [
 *         { title: "Task 1", status: "ACTIVE", userId: "user-id" }
 *         { title: "Task 2", status: "PENDING", userId: "user-id" }
 *       ]
 *       skipDuplicates: true
 *     }
 *   ) {
 *     success
 *     count
 *     errors
 *   }
 * }
 * ```
 * 
 * Paginated query:
 * ```graphql
 * query {
 *   findManyPaginated(
 *     modelName: "task"
 *     input: {
 *       where: { status: "ACTIVE" }
 *       page: 1
 *       limit: 10
 *       orderBy: { createdAt: "desc" }
 *     }
 *   ) {
 *     data { id title }
 *     meta {
 *       total
 *       page
 *       totalPages
 *       hasNextPage
 *     }
 *   }
 * }
 * ```
 */
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule, // Import AuthModule to provide AuthService for UserService
  ],
  providers: [
    UnifiedDynamicResolver,
    DynamicCRUDService,
    PrismaService,
    UserService
  ],
  exports: [
    UnifiedDynamicResolver,
    DynamicCRUDService
  ]
})
export class UnifiedDynamicModule {}

// Export all the types and classes for use in other modules
export { UnifiedDynamicResolver } from './resolvers/unified-dynamic.resolver';
export { DynamicCRUDService } from '../services/dynamic-crud.service';
export * from './inputs/unified-dynamic.inputs';

// Model enum for reference
export enum SupportedModel {
  User = 'user',
  Task = 'task',
  Post = 'post',
  Comment = 'comment',
  Page = 'page',
  PageBlock = 'pageBlock',
  TaskComment = 'taskComment',
  Notification = 'notification',
  AuditLog = 'auditLog',
  Role = 'role',
  Permission = 'permission'
}

/**
 * Helper function to validate model names
 */
export function isSupportedModel(modelName: string): boolean {
  return Object.values(SupportedModel).includes(modelName as SupportedModel);
}

/**
 * Helper function to get all supported model names
 */
export function getSupportedModels(): string[] {
  return Object.values(SupportedModel);
}