import { User } from '../../../graphql/models/user.model';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../courses/entities/lesson.entity';
export declare class DiscussionReply {
    id: string;
    content: string;
    user: User;
    parentId?: string;
    children?: DiscussionReply[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class Discussion {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    user: User;
    course?: Course;
    lesson?: Lesson;
    replies: DiscussionReply[];
    createdAt: Date;
    updatedAt: Date;
}
