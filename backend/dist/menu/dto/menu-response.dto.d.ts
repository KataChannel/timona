import { Menu } from '@prisma/client';
export declare class MenuResponseDto {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    type: string;
    parentId?: string | null;
    order: number;
    level: number;
    path?: string | null;
    url?: string | null;
    route?: string | null;
    externalUrl?: string | null;
    target: string;
    icon?: string | null;
    iconType?: string | null;
    badge?: string | null;
    badgeColor?: string | null;
    image?: string | null;
    cssClass?: string | null;
    linkType?: string | null;
    productId?: string | null;
    blogPostId?: string | null;
    pageId?: string | null;
    categoryId?: string | null;
    blogCategoryId?: string | null;
    queryConditions?: string | null;
    customData?: Record<string, any> | null;
    metadata?: Record<string, any> | null;
    requiredPermissions: string[];
    requiredRoles: string[];
    isPublic: boolean;
    isActive: boolean;
    isVisible: boolean;
    isProtected: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    children?: MenuResponseDto[];
    static fromEntity(menu: Menu & {
        children?: Menu[];
    }): MenuResponseDto;
    static fromEntities(menus: (Menu & {
        children?: Menu[];
    })[]): MenuResponseDto[];
}
export declare class MenuPaginationResponseDto {
    items: MenuResponseDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}
