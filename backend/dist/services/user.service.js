"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../auth/auth.service");
const bcrypt = __importStar(require("bcryptjs"));
let UserService = class UserService {
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async findById(id) {
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
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
    async findByEmailOrUsername(emailOrUsername) {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername },
                ],
            },
        });
    }
    async findAll() {
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
    async create(input) {
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
                throw new common_1.ConflictException('Email already exists');
            }
            if (existingUser.username === input.username) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        const hashedPassword = await bcrypt.hash(input.password, 12);
        const defaultRole = await this.prisma.role.findUnique({
            where: { name: 'user' }
        });
        if (!defaultRole) {
            throw new common_1.NotFoundException('Default user role not found. Please run RBAC seeder first.');
        }
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
    async update(id, input) {
        const user = await this.findById(id);
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
                    throw new common_1.ConflictException('Email already exists');
                }
                if (existingUser.username === input.username) {
                    throw new common_1.ConflictException('Username already exists');
                }
            }
        }
        return this.prisma.user.update({
            where: { id },
            data: input,
        });
    }
    async delete(id) {
        await this.findById(id);
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password);
    }
    async searchUsers(searchInput) {
        const { search, roleType, isActive, isVerified, createdAfter, createdBefore, page = 0, size = 20, sortBy = 'createdAt', sortOrder = 'desc', } = searchInput;
        const where = {};
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
    async getUserStats() {
        const [totalUsers, activeUsers, verifiedUsers, newUsersThisMonth, adminUsers, regularUsers, guestUsers,] = await Promise.all([
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
            this.prisma.user.count({ where: { roleType: client_1.$Enums.UserRoleType.ADMIN } }),
            this.prisma.user.count({ where: { roleType: client_1.$Enums.UserRoleType.USER } }),
            this.prisma.user.count({ where: { roleType: client_1.$Enums.UserRoleType.GUEST } }),
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
    async bulkUserAction(actionInput) {
        const { userIds, action, newRole } = actionInput;
        const errors = [];
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
        }
        catch (error) {
            return {
                success: false,
                affectedCount: 0,
                errors: [error.message || 'Unknown error occurred'],
                message: 'Bulk action failed',
            };
        }
    }
    async adminUpdateUser(id, input) {
        const existingUser = await this.findById(id);
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
                    throw new common_1.ConflictException('Email already exists');
                }
                if (conflictUser.username === input.username) {
                    throw new common_1.ConflictException('Username already exists');
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
    async adminCreateUser(input) {
        if (input.email) {
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email: input.email },
            });
            if (existingUserByEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const existingUserByUsername = await this.prisma.user.findUnique({
            where: { username: input.username },
        });
        if (existingUserByUsername) {
            throw new common_1.ConflictException('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        return this.prisma.user.create({
            data: {
                username: input.username,
                email: input.email,
                password: hashedPassword,
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone,
                roleType: input.roleType || client_1.$Enums.UserRoleType.USER,
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
    async adminResetPassword(userId, adminId) {
        return this.authService.adminResetPassword(userId, adminId);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=user.service.js.map