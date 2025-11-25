import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, $Enums } from '@prisma/client';
import { RegisterUserInput, UpdateUserInput, UserSearchInput, BulkUserActionInput, AdminUpdateUserInput, AdminCreateUserInput } from '../graphql/inputs/user.input';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        comments: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        posts: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(input: RegisterUserInput): Promise<User> {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { username: input.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === input.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Find default 'user' role
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      throw new NotFoundException('Default user role not found. Please run RBAC seeder first.');
    }

    // Create user with default role
    return this.prisma.user.create({
      data: {
        ...input,
        password: hashedPassword,
        userRoles: {
          create: {
            roleId: defaultRole.id,
            assignedBy: 'system',
          }
        }
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);

    // Check if email or username conflicts with existing users
    if (input.email || input.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                input.email ? { email: input.email } : {},
                input.username ? { username: input.username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === input.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.username === input.username) {
          throw new ConflictException('Username already exists');
        }
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Check if user exists

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // Advanced user management methods for admin

  async searchUsers(searchInput: any): Promise<any> {
    const {
      search,
      roleType,
      isActive,
      isVerified,
      createdAfter,
      createdBefore,
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchInput;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleType !== undefined) {
      where.roleType = roleType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) {
        where.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        where.createdAt.lte = new Date(createdBefore);
      }
    }

    // Execute queries
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { [sortBy]: sortOrder },
        include: {
          posts: {
            select: { id: true },
          },
          comments: {
            select: { id: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getUserStats(): Promise<any> {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      adminUsers,
      regularUsers,
      guestUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.user.count({ where: { roleType: $Enums.UserRoleType.ADMIN } }),
      this.prisma.user.count({ where: { roleType: $Enums.UserRoleType.USER } }),
      this.prisma.user.count({ where: { roleType: $Enums.UserRoleType.GUEST } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      adminUsers,
      regularUsers,
      guestUsers,
    };
  }

  async bulkUserAction(actionInput: any): Promise<any> {
    const { userIds, action, newRole } = actionInput;
    const errors: string[] = [];
    let affectedCount = 0;

    try {
      switch (action) {
        case 'activate':
          const activateResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isActive: true },
          });
          affectedCount = activateResult.count;
          break;

        case 'deactivate':
          const deactivateResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isActive: false },
          });
          affectedCount = deactivateResult.count;
          break;

        case 'verify':
          const verifyResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isVerified: true },
          });
          affectedCount = verifyResult.count;
          break;

        case 'changeRole':
          if (!newRole) {
            errors.push('New role is required for role change action');
            break;
          }
          const roleResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { roleType: newRole },
          });
          affectedCount = roleResult.count;
          break;

        case 'delete':
          // Soft delete by deactivating instead of hard delete to preserve data integrity
          const deleteResult = await this.prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isActive: false },
          });
          affectedCount = deleteResult.count;
          break;

        default:
          errors.push(`Unknown action: ${action}`);
      }

      return {
        success: errors.length === 0,
        affectedCount,
        errors,
        message: errors.length === 0 
          ? `Successfully ${action}d ${affectedCount} user(s)` 
          : `Action failed with ${errors.length} error(s)`,
      };
    } catch (error) {
      return {
        success: false,
        affectedCount: 0,
        errors: [error.message || 'Unknown error occurred'],
        message: 'Bulk action failed',
      };
    }
  }

  async adminUpdateUser(id: string, input: any): Promise<User> {
    // Check if user exists
    const existingUser = await this.findById(id);

    // Check for email/username conflicts
    if (input.email || input.username) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                input.email ? { email: input.email } : {},
                input.username ? { username: input.username } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (conflictUser) {
        if (conflictUser.email === input.email) {
          throw new ConflictException('Email already exists');
        }
        if (conflictUser.username === input.username) {
          throw new ConflictException('Username already exists');
        }
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        posts: {
          select: { id: true },
        },
        comments: {
          select: { id: true },
        },
      },
    });
  }

  async adminCreateUser(input: AdminCreateUserInput): Promise<User> {
    // Check if email or username already exists
    if (input.email) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username: input.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    return this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        roleType: input.roleType || $Enums.UserRoleType.USER,
        isActive: input.isActive ?? true,
        isVerified: input.isVerified ?? false,
        avatar: input.avatar,
      },
      include: {
        posts: {
          select: { id: true },
        },
        comments: {
          select: { id: true },
        },
      },
    });
  }

  /**
   * Admin reset password cho người dùng
   * - Call authService để generate password ngẫu nhiên
   * - Trả về password mới cho admin gửi cho user
   */
  async adminResetPassword(
    userId: string,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    newPassword: string;
    user: User;
  }> {
    return this.authService.adminResetPassword(userId, adminId);
  }
}
