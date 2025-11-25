import { PrismaService } from '../prisma/prisma.service';
export declare class TaskMediaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByTaskId(taskId: string): Promise<({
        uploader: {
            password: string | null;
            id: string;
            isVerified: boolean;
            createdAt: Date;
            isActive: boolean;
            email: string | null;
            username: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            roleType: import("@prisma/client").$Enums.UserRoleType;
            isTwoFactorEnabled: boolean;
            address: string | null;
            city: string | null;
            district: string | null;
            ward: string | null;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            updatedAt: Date;
            departmentId: string | null;
        };
    } & {
        type: import("@prisma/client").$Enums.MediaType;
        id: string;
        createdAt: Date;
        size: number;
        updatedAt: Date;
        url: string;
        filename: string;
        mimeType: string;
        caption: string | null;
        taskId: string;
        uploadedBy: string;
    })[]>;
    create(taskId: string, uploaderId: string, mediaData: any): Promise<{
        uploader: {
            password: string | null;
            id: string;
            isVerified: boolean;
            createdAt: Date;
            isActive: boolean;
            email: string | null;
            username: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            avatar: string | null;
            roleType: import("@prisma/client").$Enums.UserRoleType;
            isTwoFactorEnabled: boolean;
            address: string | null;
            city: string | null;
            district: string | null;
            ward: string | null;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
            updatedAt: Date;
            departmentId: string | null;
        };
    } & {
        type: import("@prisma/client").$Enums.MediaType;
        id: string;
        createdAt: Date;
        size: number;
        updatedAt: Date;
        url: string;
        filename: string;
        mimeType: string;
        caption: string | null;
        taskId: string;
        uploadedBy: string;
    }>;
    delete(mediaId: string, userId: string): Promise<void>;
}
