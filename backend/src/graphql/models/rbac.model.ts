import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Permission {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  resource: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  scope?: string;

  @Field()
  isSystemPerm: boolean;

  @Field()
  isActive: boolean;

  @Field()
  category: string;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RolePermission {
  @Field(() => ID)
  id: string;

  @Field()
  effect: string; // 'allow' | 'deny'

  @Field(() => Permission)
  permission: Permission;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}

@ObjectType()
export class Role {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => Role, { nullable: true })
  parent?: Role;

  @Field(() => [Role])
  children: Role[];

  @Field()
  isSystemRole: boolean;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  priority: number;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => [RolePermission])
  permissions: RolePermission[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserRoleAssignment {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  roleId: string;

  @Field()
  effect: string;

  @Field({ nullable: true })
  scope?: string;

  @Field({ nullable: true })
  assignedBy?: string;

  @Field()
  assignedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => Role)
  role: Role;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserPermission {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  permissionId: string;

  @Field()
  effect: string;

  @Field({ nullable: true })
  scope?: string;

  @Field({ nullable: true })
  assignedBy?: string;

  @Field()
  assignedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => Permission)
  permission: Permission;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RoleSearchResult {
  @Field(() => [Role])
  roles: Role[];

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
export class PermissionSearchResult {
  @Field(() => [Permission])
  permissions: Permission[];

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
export class UserSummary {
  @Field(() => Int)
  totalDirectPermissions: number;

  @Field(() => Int)
  totalRoleAssignments: number;

  @Field(() => Int)
  totalEffectivePermissions: number;

  @Field()
  lastUpdated: Date;
}

@ObjectType()
export class UserRolePermissionSummary {
  @Field()
  userId: string;

  @Field(() => [UserRoleAssignment])
  roleAssignments: UserRoleAssignment[];

  @Field(() => [UserPermission])
  directPermissions: UserPermission[];

  @Field(() => [Permission])
  effectivePermissions: Permission[];

  @Field(() => UserSummary)
  summary: UserSummary;
}