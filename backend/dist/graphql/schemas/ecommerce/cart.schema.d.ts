export declare class ProductSummaryType {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail?: string;
    stock: number;
    status: string;
}
export declare class ProductVariantSummaryType {
    id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
}
export declare class CartItemType {
    id: string;
    cartId: string;
    productId: string;
    product: ProductSummaryType;
    variantId?: string;
    variant?: ProductVariantSummaryType;
    quantity: number;
    price: number;
    subtotal: number;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
    isAvailable: boolean;
    isPriceChanged: boolean;
}
export declare class CartType {
    id: string;
    userId?: string;
    sessionId?: string;
    items: CartItemType[];
    itemCount: number;
    subtotal: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
}
export declare class AddToCartInput {
    productId: string;
    variantId?: string;
    quantity: number;
    sessionId?: string;
    metadata?: any;
}
export declare class UpdateCartItemInput {
    itemId: string;
    quantity: number;
}
export declare class RemoveFromCartInput {
    itemId: string;
}
export declare class ApplyCouponInput {
    cartId?: string;
    couponCode: string;
    sessionId?: string;
}
export declare class MergeCartsInput {
    sessionId: string;
    userId?: string;
}
export declare class AddToCartResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    errors?: string[];
}
export declare class UpdateCartResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    errors?: string[];
}
export declare class RemoveFromCartResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    errors?: string[];
}
export declare class ClearCartResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    errors?: string[];
}
export declare class ApplyCouponResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    discountAmount?: number;
    errors?: string[];
}
export declare class MergeCartsResponse {
    success: boolean;
    message?: string;
    cart?: CartType;
    errors?: string[];
}
export declare class ValidateCartResponse {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    cart?: CartType;
}
