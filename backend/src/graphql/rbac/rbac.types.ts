/**
 * RBAC GraphQL Object Types
 * Type definitions cho GraphQL schema
 */

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class PermissionType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field()
  resource: string;

  @Field()
  action: string;

  @Field(() => String, { nullable: true })
  scope: string | null;

  @Field(() => String, { nullable: true })
  category: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isSystemPerm: boolean;

  @Field()
  isActive: boolean;

  @Field(() => String, { nullable: true })
  source?: string; // 'role' or 'direct'

  @Field(() => String, { nullable: true })
  roleName?: string; // If from role

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RoleType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isSystemRole: boolean;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  priority: number;

  @Field(() => String, { nullable: true })
  parentId: string | null;

  @Field(() => [RolePermissionType], { nullable: true })
  permissions?: RolePermissionType[];

  @Field(() => [UserRoleAssignmentType], { nullable: true })
  userRoles?: UserRoleAssignmentType[];

  @Field(() => Int, { nullable: true })
  userCount?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RolePermissionType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  roleId: string;

  @Field(() => ID)
  permissionId: string;

  @Field()
  effect: string; // 'allow' or 'deny'

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => PermissionType)
  permission: PermissionType;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UserBasicType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  username: string | null;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class UserRoleAssignmentType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  roleId: string;

  @Field()
  effect: string; // 'allow' or 'deny'

  @Field(() => String, { nullable: true })
  assignedBy: string | null;

  @Field()
  assignedAt: Date;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => RoleType, { nullable: true })
  role?: RoleType;

  @Field(() => UserBasicType, { nullable: true })
  user?: UserBasicType;
}

@ObjectType()
export class RemoveRoleResultType {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class PermissionsByCategoryType {
  @Field(() => GraphQLJSON)
  data: Record<string, PermissionType[]>;
}

@ObjectType()
export class RoleSearchResultType {
  @Field(() => [RoleType])
  roles: RoleType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class PermissionSearchResultType {
  @Field(() => [PermissionType])
  permissions: PermissionType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}
