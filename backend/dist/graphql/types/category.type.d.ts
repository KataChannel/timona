import { ProductType } from './product.type';
export declare class CategoryType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    parentId?: string;
    parent?: CategoryType;
    children?: CategoryType[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    displayOrder: number;
    isActive: boolean;
    isFeatured: boolean;
    products?: ProductType[];
    productCount?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
}
export declare class PaginatedCategories {
    items: CategoryType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
