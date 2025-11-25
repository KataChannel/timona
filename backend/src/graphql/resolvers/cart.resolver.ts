import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from '../../services/cart.service';
import {
  CartType,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  ApplyCouponInput,
  MergeCartsInput,
  AddToCartResponse,
  UpdateCartResponse,
  RemoveFromCartResponse,
  ClearCartResponse,
  ApplyCouponResponse,
  MergeCartsResponse,
  ValidateCartResponse,
} from '../schemas/ecommerce/cart.schema';

@Resolver(() => CartType)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart or session cart
   * Returns null if cart doesn't exist or is empty (doesn't auto-create)
   */
  @Query(() => CartType, { nullable: true })
  async getCart(
    @Args('sessionId', { type: () => String, nullable: true }) sessionId?: string,
    @Context() context?: any,
  ) {
    const userId = context?.req?.user?.id;
    return this.cartService.getCart(userId, sessionId);
  }

  /**
   * Add item to cart
   */
  @Mutation(() => AddToCartResponse)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @Context() context?: any,
  ): Promise<AddToCartResponse> {
    try {
      // Validate input
      if (!input || !input.productId) {
        return {
          success: false,
          message: 'Product ID is required',
          errors: ['Product ID is required'],
        };
      }

      const userId = context?.req?.user?.id;
      const cart = await this.cartService.addItem(input, userId);
      
      return {
        success: true,
        message: 'Item added to cart successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Update cart item quantity
   */
  @Mutation(() => UpdateCartResponse)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @Args('sessionId', { type: () => String, nullable: true }) sessionId?: string,
    @Context() context?: any,
  ): Promise<UpdateCartResponse> {
    try {
      const userId = context?.req?.user?.id;
      const { itemId, quantity } = input;
      
      const cart = await this.cartService.updateItem(itemId, quantity, userId, sessionId);
      
      return {
        success: true,
        message: 'Cart item updated successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Remove item from cart
   */
  @Mutation(() => RemoveFromCartResponse)
  async removeFromCart(
    @Args('input') input: RemoveFromCartInput,
    @Args('sessionId', { type: () => String, nullable: true }) sessionId?: string,
    @Context() context?: any,
  ): Promise<RemoveFromCartResponse> {
    try {
      const userId = context?.req?.user?.id;
      const { itemId } = input;
      
      const cart = await this.cartService.removeItem(itemId, userId, sessionId);
      
      return {
        success: true,
        message: 'Item removed from cart successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Clear entire cart
   */
  @Mutation(() => ClearCartResponse)
  async clearCart(
    @Args('sessionId', { type: () => String, nullable: true }) sessionId?: string,
    @Context() context?: any,
  ): Promise<ClearCartResponse> {
    try {
      const userId = context?.req?.user?.id;
      const cart = await this.cartService.clearCart(userId, sessionId);
      
      return {
        success: true,
        message: 'Cart cleared successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Apply coupon to cart
   */
  @Mutation(() => ApplyCouponResponse)
  async applyCoupon(
    @Args('input') input: ApplyCouponInput,
    @Context() context?: any,
  ): Promise<ApplyCouponResponse> {
    try {
      const userId = context?.req?.user?.id;
      const cart = await this.cartService.applyCoupon(input, userId);
      
      return {
        success: true,
        message: 'Coupon applied successfully',
        cart,
        discountAmount: cart.discount || 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Merge session cart into user cart after login
   */
  @Mutation(() => MergeCartsResponse)
  async mergeCarts(
    @Args('input') input: MergeCartsInput,
    @Context() context?: any,
  ): Promise<MergeCartsResponse> {
    try {
      const userId = context?.req?.user?.id || input.userId;
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const cart = await this.cartService.mergeCarts({
        userId,
        sessionId: input.sessionId,
      });
      
      return {
        success: true,
        message: 'Carts merged successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: [error.message],
      };
    }
  }

  /**
   * Validate cart before checkout
   */
  @Query(() => ValidateCartResponse)
  async validateCart(
    @Args('sessionId', { type: () => String, nullable: true }) sessionId?: string,
    @Context() context?: any,
  ): Promise<ValidateCartResponse> {
    const userId = context?.req?.user?.id;
    const validation = await this.cartService.validateCart(userId, sessionId);
    
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: [], // Add warnings if needed (e.g., price changes)
      cart: validation.cart,
    };
  }
}
