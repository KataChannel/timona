import { ProductStatus, ProductUnit } from '../types/product.type';
export declare class CreateProductInput {
    name: string;
    slug: string;
    description?: string;
    shortDesc?: string;
    price: number;
    originalPrice?: number;
    costPrice?: number;
    sku?: string;
    barcode?: string;
    stock: number;
    minStock: number;
    maxStock?: number;
    unit: ProductUnit;
    weight?: number;
    origin?: string;
    status: ProductStatus;
    categoryId: string;
    thumbnail?: string;
    attributes?: any;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    isOnSale: boolean;
    displayOrder: number;
}
export declare class UpdateProductInput {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    shortDesc?: string;
    shortDescription?: string;
    price?: number;
    originalPrice?: number;
    costPrice?: number;
    sku?: string;
    barcode?: string;
    stock?: number;
    minStock?: number;
    maxStock?: number;
    unit?: ProductUnit;
    weight?: number;
    origin?: string;
    status?: ProductStatus;
    categoryId?: string;
    thumbnail?: string;
    imageUrl?: string;
    attributes?: any;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
    isOnSale?: boolean;
    isOrganic?: boolean;
    dimensions?: string;
    manufacturer?: string;
    displayOrder?: number;
}
export declare class ProductFiltersInput {
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isOnSale?: boolean;
    inStock?: boolean;
    origin?: string;
    units?: ProductUnit[];
}
export declare class GetProductsInput {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: ProductFiltersInput;
}
export declare class CreateProductImageInput {
    productId: string;
    url: string;
    alt?: string;
    title?: string;
    isPrimary: boolean;
    order: number;
}
export declare class CreateProductVariantInput {
    productId: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock: number;
    attributes?: any;
    isActive: boolean;
    order: number;
}
export declare class UpdateProductVariantInput {
    id: string;
    name?: string;
    sku?: string;
    barcode?: string;
    price?: number;
    stock?: number;
    attributes?: any;
    isActive?: boolean;
    order?: number;
}
