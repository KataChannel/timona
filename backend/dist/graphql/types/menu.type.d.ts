export declare enum MenuTypeEnum {
    SIDEBAR = "SIDEBAR",
    HEADER = "HEADER",
    FOOTER = "FOOTER",
    MOBILE = "MOBILE",
    CUSTOM = "CUSTOM"
}
export declare enum MenuTargetEnum {
    SELF = "SELF",
    BLANK = "BLANK",
    MODAL = "MODAL"
}
export declare enum MenuLinkTypeEnum {
    URL = "URL",
    PRODUCT_LIST = "PRODUCT_LIST",
    PRODUCT_DETAIL = "PRODUCT_DETAIL",
    BLOG_LIST = "BLOG_LIST",
    BLOG_DETAIL = "BLOG_DETAIL",
    PAGE = "PAGE",
    CATEGORY = "CATEGORY",
    BLOG_CATEGORY = "BLOG_CATEGORY"
}
export declare class MenuType {
    id: string;
    title: string;
    slug: string;
    description?: string;
    type: string;
    parentId?: string;
    children?: MenuType[];
    order: number;
    level: number;
    path?: string;
    url?: string;
    route?: string;
    externalUrl?: string;
    target: string;
    linkType?: string;
    productId?: string;
    blogPostId?: string;
    pageId?: string;
    categoryId?: string;
    blogCategoryId?: string;
    queryConditions?: any;
    icon?: string;
    iconType?: string;
    badge?: string;
    badgeColor?: string;
    image?: string;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    isPublic: boolean;
    isActive: boolean;
    isVisible: boolean;
    isProtected: boolean;
    metadata?: any;
    cssClass?: string;
    customData?: any;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    finalUrl?: string;
}
