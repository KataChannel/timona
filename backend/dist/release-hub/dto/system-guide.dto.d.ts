import { GuideType } from '../entities/system-guide.entity';
export declare class CreateSystemGuideInput {
    title: string;
    type: GuideType;
    description?: string;
    content?: string;
    icon?: string;
    order?: number;
    parentId?: string;
    isPublished?: boolean;
}
export declare class UpdateSystemGuideInput {
    id: string;
    title?: string;
    type?: GuideType;
    description?: string;
    content?: string;
    icon?: string;
    order?: number;
    parentId?: string;
    isPublished?: boolean;
}
