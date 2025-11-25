export declare class CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    thumbnail?: string;
    icon?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
}
export declare class UpdateCategoryInput {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string;
    thumbnail?: string;
    icon?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
}
export declare class CategoryFiltersInput {
    search?: string;
    parentId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    hasProducts?: boolean;
}
export declare class GetCategoriesInput {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: CategoryFiltersInput;
    includeChildren?: boolean;
}
