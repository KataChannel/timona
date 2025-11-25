import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsUUID, IsEnum, IsInt, Min, Max, IsJSON, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';

// Permission Inputs
@InputType()
export class CreatePermissionInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  displayName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  resource: string;

  @Field()
  @IsString()
  action: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scope?: string;

  @Field({ defaultValue: 'general' })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class UpdatePermissionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scope?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class PermissionSearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resource?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number;

  @Field({ nullable: true, defaultValue: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}

// Role Inputs
@InputType()
export class CreateRoleInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  displayName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  permissionIds?: string[];
}

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class RoleSearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number;

  @Field({ nullable: true, defaultValue: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}

// Role-Permission Assignment Inputs
@InputType()
export class AssignRolePermissionInput {
  @Field()
  @IsUUID()
  roleId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(0)
  permissionIds: string[];

  @Field({ defaultValue: 'allow' })
  @IsOptional()
  @IsEnum(['allow', 'deny'])
  effect?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;
}

// User Role/Permission Assignment Inputs
@InputType()
export class RoleAssignmentInput {
  @Field()
  @IsString()
  roleId: string;

  @Field({ defaultValue: 'allow' })
  @IsString()
  @IsEnum(['allow', 'deny'])
  effect: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class AssignUserRoleInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => [RoleAssignmentInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleAssignmentInput)
  assignments: RoleAssignmentInput[];
}

@InputType()
export class PermissionAssignmentInput {
  @Field()
  @IsString()
  permissionId: string;

  @Field({ defaultValue: 'allow' })
  @IsString()
  @IsEnum(['allow', 'deny'])
  effect: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class AssignUserPermissionInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => [PermissionAssignmentInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionAssignmentInput)
  assignments: PermissionAssignmentInput[];
}