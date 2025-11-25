export declare enum PageStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum BlockType {
    TEXT = "TEXT",
    RICH_TEXT = "RICH_TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    CAROUSEL = "CAROUSEL",
    HERO = "HERO",
    BUTTON = "BUTTON",
    DIVIDER = "DIVIDER",
    SPACER = "SPACER",
    TEAM = "TEAM",
    STATS = "STATS",
    CONTACT_INFO = "CONTACT_INFO",
    GALLERY = "GALLERY",
    CARD = "CARD",
    TESTIMONIAL = "TESTIMONIAL",
    FAQ = "FAQ",
    CONTACT_FORM = "CONTACT_FORM",
    COMPLETED_TASKS = "COMPLETED_TASKS",
    SEARCH = "SEARCH",
    BOOKMARK = "BOOKMARK",
    CONTAINER = "CONTAINER",
    SECTION = "SECTION",
    GRID = "GRID",
    FLEX_ROW = "FLEX_ROW",
    FLEX_COLUMN = "FLEX_COLUMN",
    COLUMN = "COLUMN",
    ROW = "ROW",
    DYNAMIC = "DYNAMIC",
    PRODUCT_LIST = "PRODUCT_LIST",
    PRODUCT_DETAIL = "PRODUCT_DETAIL",
    PRODUCT_CAROUSEL = "PRODUCT_CAROUSEL",
    BLOG_CAROUSEL = "BLOG_CAROUSEL"
}
export declare class PageBlock {
    id: string;
    type: BlockType;
    content: any;
    style?: any;
    order: number;
    isVisible: boolean;
    pageId: string;
    parentId?: string;
    children?: PageBlock[];
    depth: number;
    config?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Page {
    id: string;
    title: string;
    slug: string;
    description?: string;
    content?: any;
    status: PageStatus;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: string;
    isHomepage: boolean;
    isDynamic: boolean;
    dynamicConfig?: any;
    blocks: PageBlock[];
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    createdBy: string;
    updatedBy?: string;
}
export declare class PagePaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedPages {
    items: Page[];
    pagination: PagePaginationInfo;
}
