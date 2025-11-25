import { Role, Permission } from './rbac.model';
export declare class User {
    id: string;
    email?: string;
    username: string;
    password?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    roleType?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    isActive: boolean;
    isVerified: boolean;
    isTwoFactorEnabled: boolean;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    roles?: Role[];
    permissions?: Permission[];
    posts?: any[];
    comments?: any[];
}
export declare class UserSearchResult {
    users: User[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}
export declare class UserStats {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsersThisMonth: number;
    adminUsers: number;
    regularUsers: number;
    guestUsers: number;
}
export declare class BulkUserActionResult {
    success: boolean;
    affectedCount: number;
    errors: string[];
    message: string;
}
export declare class AdminResetPasswordResult {
    success: boolean;
    message: string;
    newPassword: string;
    user: User;
}
