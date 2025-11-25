import { CategoryType } from './category.type';
export declare enum ProductStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    DISCONTINUED = "DISCONTINUED"
}
export declare enum ProductUnit {
    KG = "KG",
    G = "G",
    BUNDLE = "BUNDLE",
    PIECE = "PIECE",
    BAG = "BAG",
    BOX = "BOX"
}
export declare class ProductImageType {
    id: string;
    productId: string;
    url: string;
    alt?: string;
    title?: string;
    isPrimary: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductVariantType {
    id: string;
    productId: string;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    stock: number;
    attributes?: any;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    shortDesc?: string;
    shortDescription?: string;
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
    category?: CategoryType;
    images?: ProductImageType[];
    thumbnail?: string;
    imageUrl?: string;
    variants?: ProductVariantType[];
    attributes?: any;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isNew?: boolean;
    isBestSeller: boolean;
    isOnSale: boolean;
    isOrganic?: boolean;
    dimensions?: string;
    manufacturer?: string;
    displayOrder: number;
    viewCount: number;
    soldCount: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    discountPercentage?: number;
    profitMargin?: number;
}
export declare class PaginatedProducts {
    items: ProductType[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
