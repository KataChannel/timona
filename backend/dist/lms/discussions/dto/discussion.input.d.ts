export declare class CreateDiscussionInput {
    courseId: string;
    lessonId?: string;
    title: string;
    content: string;
}
export declare class CreateReplyInput {
    discussionId: string;
    content: string;
    parentId?: string;
}
export declare class UpdateDiscussionInput {
    id: string;
    title?: string;
    content?: string;
}
