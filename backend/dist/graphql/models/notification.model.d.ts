import { User } from './user.model';
export declare class Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    user: User;
    userId: string;
}
