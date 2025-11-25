import { $Enums } from '@prisma/client';
import '../models/auth-extended.model';
export declare class RegisterUserInput {
    email?: string;
    username: string;
    password?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}
export declare class LoginUserInput {
    emailOrUsername: string;
    password: string;
    rememberMe?: boolean;
}
export declare class PhoneLoginInput {
    phone: string;
    otp: string;
    rememberMe?: boolean;
}
export declare class SocialLoginInput {
    token: string;
    provider: $Enums.AuthProvider;
    email?: string;
    providerId?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rememberMe?: boolean;
}
export declare class ForgotPasswordInput {
    email: string;
}
export declare class ResetPasswordInput {
    token: string;
    newPassword: string;
}
export declare class VerifyEmailInput {
    token: string;
}
export declare class VerifyPhoneInput {
    phone: string;
    otp: string;
}
export declare class UpdateUserInput {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}
export declare class ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}
export declare class RequestPhoneVerificationInput {
    phone: string;
}
export declare class UserSearchInput {
    search?: string;
    roleType?: $Enums.UserRoleType;
    isActive?: boolean;
    isVerified?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class BulkUserActionInput {
    userIds: string[];
    action: string;
    newRole?: $Enums.UserRoleType;
}
export declare class AdminUpdateUserInput {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleType?: $Enums.UserRoleType;
    isActive?: boolean;
    isVerified?: boolean;
    isTwoFactorEnabled?: boolean;
    avatar?: string;
}
export declare class AdminCreateUserInput {
    username: string;
    email?: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleType?: $Enums.UserRoleType;
    isActive?: boolean;
    isVerified?: boolean;
    avatar?: string;
}
export declare class UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
}
export declare class SetPasswordInput {
    password: string;
    confirmPassword: string;
}
export declare class AdminResetPasswordInput {
    userId: string;
}
