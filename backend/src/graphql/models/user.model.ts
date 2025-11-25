import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PrismaClient } from '@prisma/client';
import { Role, Permission } from './rbac.model';

// Get enum from Prisma client types
const prisma = new PrismaClient();
const UserRoleTypeValues = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
};

// Register the UserRoleType enum
registerEnumType(UserRoleTypeValues, {
  name: 'UserRole',
  description: 'User role types',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  username: string;

  // Password is not exposed in GraphQL
  password?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  roleType?: string;

  // Shipping/Address information
  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  district?: string;

  @Field({ nullable: true })
  ward?: string;

  @Field()
  isActive: boolean;

  @Field()
  isVerified: boolean;

  @Field()
  isTwoFactorEnabled: boolean;

  @Field()
  failedLoginAttempts: number;

  @Field({ nullable: true })
  lockedUntil?: Date;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // RBAC Fields - User's assigned roles and permissions
  @Field(() => [Role], { nullable: true })
  roles?: Role[];

  @Field(() => [Permission], { nullable: true })
  permissions?: Permission[];

  // Relations - handled by field resolvers to avoid circular dependencies
  posts?: any[];
  comments?: any[];
}

@ObjectType()
export class UserSearchResult {
  @Field(() => [User])
  users: User[];

  @Field()
  total: number;

  @Field()
  page: number;

  @Field()
  size: number;

  @Field()
  totalPages: number;
}

@ObjectType()
export class UserStats {
  @Field()
  totalUsers: number;

  @Field()
  activeUsers: number;

  @Field()
  verifiedUsers: number;

  @Field()
  newUsersThisMonth: number;

  @Field()
  adminUsers: number;

  @Field()
  regularUsers: number;

  @Field()
  guestUsers: number;
}

@ObjectType()
export class BulkUserActionResult {
  @Field()
  success: boolean;

  @Field()
  affectedCount: number;

  @Field(() => [String])
  errors: string[];

  @Field()
  message: string;
}

/**
 * Result model cho admin reset password
 * - Trả về password mới đã được tạo
 * - Trả về user đã được cập nhật
 */
@ObjectType()
export class AdminResetPasswordResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  newPassword: string;

  @Field()
  user: User;
}
