import { CartService } from '../../services/cart.service';
import { AddToCartInput, UpdateCartItemInput, RemoveFromCartInput, ApplyCouponInput, MergeCartsInput, AddToCartResponse, UpdateCartResponse, RemoveFromCartResponse, ClearCartResponse, ApplyCouponResponse, MergeCartsResponse, ValidateCartResponse } from '../schemas/ecommerce/cart.schema';
export declare class CartResolver {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(sessionId?: string, context?: any): Promise<any>;
    addToCart(input: AddToCartInput, context?: any): Promise<AddToCartResponse>;
    updateCartItem(input: UpdateCartItemInput, sessionId?: string, context?: any): Promise<UpdateCartResponse>;
    removeFromCart(input: RemoveFromCartInput, sessionId?: string, context?: any): Promise<RemoveFromCartResponse>;
    clearCart(sessionId?: string, context?: any): Promise<ClearCartResponse>;
    applyCoupon(input: ApplyCouponInput, context?: any): Promise<ApplyCouponResponse>;
    mergeCarts(input: MergeCartsInput, context?: any): Promise<MergeCartsResponse>;
    validateCart(sessionId?: string, context?: any): Promise<ValidateCartResponse>;
}
