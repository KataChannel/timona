import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AddToCartInput, ApplyCouponInput, MergeCartsInput } from '../graphql/schemas/ecommerce/cart.schema';
export declare class CartService {
    private readonly prisma;
    private readonly redis;
    private readonly CART_TTL;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService, redis: RedisService);
    getCart(userId?: string, sessionId?: string): Promise<any>;
    getOrCreateCart(userId?: string, sessionId?: string): Promise<any>;
    addItem(input: AddToCartInput, userId?: string): Promise<any>;
    updateItem(itemId: string, quantity: number, userId?: string, sessionId?: string): Promise<any>;
    removeItem(itemId: string, userId?: string, sessionId?: string): Promise<any>;
    clearCart(userId?: string, sessionId?: string): Promise<any>;
    applyCoupon(input: ApplyCouponInput, userId?: string): Promise<any>;
    mergeCarts(input: MergeCartsInput): Promise<any>;
    validateCart(userId?: string, sessionId?: string): Promise<{
        isValid: boolean;
        errors: string[];
        cart: any;
    }>;
    private calculateTotals;
    private calculateShippingFee;
    private calculateTax;
    private validateCoupon;
    private getCartCacheKey;
    private invalidateCartCache;
    private isValidCachedCart;
    private serializeCart;
    private deserializeCart;
    cleanupExpiredCarts(): Promise<{
        deletedCount: number;
    }>;
}
