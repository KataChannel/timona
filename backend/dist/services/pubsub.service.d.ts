export declare class PubSubService {
    private readonly pubSub;
    constructor();
    publish(event: string, payload: any): Promise<void>;
    asyncIterator(event: string | string[]): any;
    publishPostCreated(post: any): void;
    publishPostUpdated(post: any): void;
    publishPostDeleted(postId: string): void;
    publishNewComment(comment: any, postId: string): void;
    publishUserRegistered(user: any): void;
    publishTaskCreated(task: any): void;
    publishTaskUpdated(task: any): void;
    publishTaskCommentCreated(comment: any): void;
    getPostCreatedIterator(): any;
    getPostUpdatedIterator(): any;
    getTaskCreatedIterator(): any;
    getTaskUpdatedIterator(): any;
    getTaskCommentCreatedIterator(): any;
    getPostDeletedIterator(): any;
    getNewCommentIterator(): any;
    getUserRegisteredIterator(): any;
}
