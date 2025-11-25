import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscussionInput, CreateReplyInput, UpdateDiscussionInput } from './dto/discussion.input';
export declare class DiscussionsService {
    private prisma;
    constructor(prisma: PrismaService);
    createDiscussion(userId: string, input: CreateDiscussionInput): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        lesson: {
            id: string;
            title: string;
        };
        replies: {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            parentId: string | null;
            content: string;
            discussionId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        title: string;
        content: string;
        isPinned: boolean;
        courseId: string;
        lessonId: string | null;
        replyCount: number;
    }>;
    getCourseDiscussions(courseId: string, lessonId?: string): Promise<({
        user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        lesson: {
            id: string;
            title: string;
        };
        replies: ({
            user: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            parentId: string | null;
            content: string;
            discussionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        title: string;
        content: string;
        isPinned: boolean;
        courseId: string;
        lessonId: string | null;
        replyCount: number;
    })[]>;
    getDiscussion(id: string): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        course: {
            id: string;
            title: string;
            slug: string;
        };
        lesson: {
            id: string;
            title: string;
        };
        replies: ({
            user: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                avatar: string;
            };
            children: ({
                user: {
                    id: string;
                    username: string;
                    firstName: string;
                    lastName: string;
                    avatar: string;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                updatedAt: Date;
                parentId: string | null;
                content: string;
                discussionId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            parentId: string | null;
            content: string;
            discussionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        title: string;
        content: string;
        isPinned: boolean;
        courseId: string;
        lessonId: string | null;
        replyCount: number;
    }>;
    createReply(userId: string, input: CreateReplyInput): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        parentId: string | null;
        content: string;
        discussionId: string;
    }>;
    updateDiscussion(userId: string, input: UpdateDiscussionInput): Promise<{
        user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        title: string;
        content: string;
        isPinned: boolean;
        courseId: string;
        lessonId: string | null;
        replyCount: number;
    }>;
    deleteDiscussion(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    togglePin(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        title: string;
        content: string;
        isPinned: boolean;
        courseId: string;
        lessonId: string | null;
        replyCount: number;
    }>;
}
