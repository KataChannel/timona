export declare enum GuideType {
    QUICK_START = "QUICK_START",
    TUTORIAL = "TUTORIAL",
    USER_GUIDE = "USER_GUIDE",
    API_REFERENCE = "API_REFERENCE",
    TROUBLESHOOTING = "TROUBLESHOOTING",
    FAQ = "FAQ",
    VIDEO_GUIDE = "VIDEO_GUIDE",
    BEST_PRACTICES = "BEST_PRACTICES"
}
declare class GuideAuthor {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
}
export declare class SystemGuide {
    id: string;
    title: string;
    description?: string;
    content: string;
    type: GuideType;
    category?: string;
    tags: string[];
    difficulty?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    attachmentUrls: string[];
    icon?: string;
    orderIndex: number;
    order: number;
    parentId?: string;
    parent?: SystemGuide;
    children: SystemGuide[];
    relatedGuideIds: string[];
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    isPublished: boolean;
    publishedAt?: Date;
    viewCount: number;
    helpfulCount: number;
    notHelpfulCount: number;
    readingTime?: number;
    createdAt: Date;
    updatedAt: Date;
    authorId?: string;
    updatedById?: string;
    author?: GuideAuthor;
    updatedBy?: GuideAuthor;
}
export { SystemGuide as SystemGuideEntity };
