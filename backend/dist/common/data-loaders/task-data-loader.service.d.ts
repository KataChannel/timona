import { PrismaService } from '../../prisma/prisma.service';
export declare class TaskDataLoaderService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    private readonly userLoader;
    private readonly commentsLoader;
    private readonly mediaLoader;
    private readonly taskCountsLoader;
    loadUser(userId: string): Promise<any | null>;
    loadComments(taskId: string): Promise<any[]>;
    loadMedia(taskId: string): Promise<any[]>;
    loadTaskCounts(taskId: string): Promise<{
        comments: number;
        media: number;
        subtasks: number;
    }>;
    clearUser(userId: string): void;
    clearComments(taskId: string): void;
    clearMedia(taskId: string): void;
    clearTaskCounts(taskId: string): void;
    clearAll(): void;
}
