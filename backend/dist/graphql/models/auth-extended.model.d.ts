import { $Enums } from '@prisma/client';
export declare class AuthMethod {
    id: string;
    provider: $Enums.AuthProvider;
    providerId?: string;
    isVerified: boolean;
    createdAt: Date;
}
export declare class VerificationToken {
    id: string;
    token: string;
    type: $Enums.TokenType;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}
export declare class UserSession {
    id: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
    expiresAt: Date;
    createdAt: Date;
}
export declare class AuditLog {
    id: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
