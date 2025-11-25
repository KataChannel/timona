import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { 
  AddToCartInput, 
  UpdateCartItemInput, 
  RemoveFromCartInput,
  ApplyCouponInput,
  MergeCartsInput 
} from '../graphql/schemas/ecommerce/cart.schema';

@Injectable()
export class CartService {
  private readonly CART_TTL = 86400 * 7; // 7 days in seconds
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get cart without creating if not exists (for read-only operations like checkout page)
   * Returns cart object even if empty, or null if not exists
   * This ensures consistency after add/update operations
   */
  async getCart(userId?: string, sessionId?: string) {
    // Normalize empty strings to undefined
    const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
    const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;

    if (!normalizedUserId && !normalizedSessionId) {
      return null; // No identifier, no cart
    }

    // Try cache first
    const cacheKey = this.getCartCacheKey(normalizedUserId, normalizedSessionId);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const parsedCart = this.deserializeCart(cached);
        // Validate cached cart
        if (this.isValidCachedCart(parsedCart)) {
          return parsedCart; // ✅ Return cart even if empty (items = [])
        }
        // Invalid cache, delete it
        await this.redis.del(cacheKey);
      } catch (error) {
        // Invalid JSON, delete cache
        await this.redis.del(cacheKey);
      }
    }

    // Find existing cart from database
    const cart = await this.prisma.cart.findFirst({
      where: normalizedUserId ? { userId: normalizedUserId } : { sessionId: normalizedSessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                images: true,
                stock: true,
                status: true,
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                price: true,
                stock: true,
                attributes: true,
              }
            }
          }
        }
      }
    });

    // Return null only if cart doesn't exist at all
    if (!cart) {
      return null;
    }

    // Calculate totals (even for empty cart)
    const cartWithTotals = await this.calculateTotals(cart);

    // Cache for 1 hour
    await this.redis.setex(cacheKey, this.CACHE_TTL, this.serializeCart(cartWithTotals));

    return cartWithTotals;
  }

  /**
   * Get or create cart for user/session
   */
  async getOrCreateCart(userId?: string, sessionId?: string) {
    // Normalize empty strings to undefined
    const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
    const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;

    if (!normalizedUserId && !normalizedSessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    // Try cache first
    const cacheKey = this.getCartCacheKey(normalizedUserId, normalizedSessionId);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const parsedCart = this.deserializeCart(cached);
        // Validate cached cart has all required fields
        if (this.isValidCachedCart(parsedCart)) {
          return parsedCart;
        }
        // Invalid cache, delete it
        await this.redis.del(cacheKey);
        console.log('[CartCache] Deleted invalid cache for:', cacheKey);
      } catch (error) {
        // Invalid JSON, delete cache
        await this.redis.del(cacheKey);
        console.error('[CartCache] Error parsing cache, deleted:', error.message);
      }
    }

    // Find existing cart
    let cart = await this.prisma.cart.findFirst({
      where: normalizedUserId ? { userId: normalizedUserId } : { sessionId: normalizedSessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                images: true,
                stock: true,
                status: true,
              }
            },
            variant: {
              select: {
                id: true,
                sku: true,
                price: true,
                stock: true,
                attributes: true,
              }
            }
          }
        }
      }
    });

    // Create new cart if not found
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: normalizedUserId,
          sessionId: normalizedSessionId,
          expiresAt: new Date(Date.now() + this.CART_TTL * 1000),
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  originalPrice: true,
                  images: true,
                  stock: true,
                  status: true,
                }
              },
              variant: {
                select: {
                  id: true,
                  sku: true,
                  price: true,
                  stock: true,
                  attributes: true,
                }
              }
            }
          }
        }
      });
    }

    // Calculate totals
    const cartWithTotals = await this.calculateTotals(cart);

    // Cache for 1 hour with proper serialization
    await this.redis.setex(cacheKey, this.CACHE_TTL, this.serializeCart(cartWithTotals));

    return cartWithTotals;
  }

  /**
   * Add item to cart
   */
  async addItem(input: AddToCartInput, userId?: string) {
    const { productId, variantId, quantity, sessionId, metadata } = input;

    // Normalize userId and sessionId
    const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
    const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;

    // Validate: Either userId or sessionId must be provided
    if (!normalizedUserId && !normalizedSessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    // Validate input
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    if (!quantity || quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Validate product and variant
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: variantId ? { where: { id: variantId } } : undefined,
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available');
    }

    // Check stock
    const variant = variantId ? product.variants?.[0] : null;
    const availableStock = variant ? variant.stock : product.stock;
    
    if (availableStock < quantity) {
      throw new BadRequestException(`Only ${availableStock} items available in stock`);
    }

    // Get or create cart - use sessionId from input if provided
    const cart = await this.getOrCreateCart(normalizedUserId, normalizedSessionId);

    // Check if item already exists
    const existingItem = cart.items.find(
      item => item.productId === productId && item.variantId === variantId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > availableStock) {
        throw new BadRequestException(`Cannot add ${quantity} more items. Only ${availableStock - existingItem.quantity} available`);
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: newQuantity,
          updatedAt: new Date(),
        }
      });
    } else {
      // Create new cart item with price snapshot
      const price = variant?.price ?? product.price;

      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          price,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        }
      });
    }

    // Invalidate cache
    await this.invalidateCartCache(normalizedUserId, normalizedSessionId);

    // Return updated cart
    return this.getOrCreateCart(normalizedUserId, normalizedSessionId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number, userId?: string, sessionId?: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
        variant: true,
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify cart ownership - prioritize userId over sessionId
    if (userId) {
      // Authenticated user - only check userId
      if (cartItem.cart.userId !== userId) {
        throw new BadRequestException('Cart item does not belong to user');
      }
    } else if (sessionId) {
      // Guest user - check sessionId
      if (cartItem.cart.sessionId !== sessionId) {
        throw new BadRequestException('Cart item does not belong to session');
      }
    } else {
      // No identifier provided
      throw new BadRequestException('Either userId or sessionId is required');
    }

    // Check stock
    const availableStock = cartItem.variant?.stock ?? cartItem.product.stock;
    if (quantity > availableStock) {
      throw new BadRequestException(`Only ${availableStock} items available in stock`);
    }

    // Update quantity
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { 
        quantity,
        updatedAt: new Date(),
      }
    });

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);

    return this.getOrCreateCart(userId, sessionId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify cart ownership - prioritize userId over sessionId
    if (userId) {
      // Authenticated user - only check userId
      if (cartItem.cart.userId !== userId) {
        throw new BadRequestException('Cart item does not belong to user');
      }
    } else if (sessionId) {
      // Guest user - check sessionId
      if (cartItem.cart.sessionId !== sessionId) {
        throw new BadRequestException('Cart item does not belong to session');
      }
    } else {
      // No identifier provided
      throw new BadRequestException('Either userId or sessionId is required');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId }
    });

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);

    return this.getOrCreateCart(userId, sessionId);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);

    return this.getOrCreateCart(userId, sessionId);
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(input: ApplyCouponInput, userId?: string) {
    const { couponCode, sessionId } = input;

    // Validate coupon (implement based on your coupon system)
    // This is a placeholder - implement actual coupon validation
    const coupon = await this.validateCoupon(couponCode);

    const cart = await this.getOrCreateCart(userId, sessionId);

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        // Store discount details in metadata
        metadata: {
          ...(cart.metadata as object || {}),
          coupon: {
            code: couponCode,
            discount: coupon.discount,
            type: coupon.type,
          }
        }
      }
    });

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);

    return this.getOrCreateCart(userId, sessionId);
  }

  /**
   * Merge session cart into user cart after login
   */
  async mergeCarts(input: MergeCartsInput) {
    const { userId, sessionId } = input;

    const [userCart, sessionCart] = await Promise.all([
      this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true }
      }),
      this.prisma.cart.findFirst({
        where: { sessionId },
        include: { items: true }
      })
    ]);

    if (!sessionCart || sessionCart.items.length === 0) {
      return this.getOrCreateCart(userId);
    }

    if (!userCart) {
      // Move session cart to user
      await this.prisma.cart.update({
        where: { id: sessionCart.id },
        data: { 
          userId,
          sessionId: null,
        }
      });
    } else {
      // Merge items from session cart into user cart
      for (const sessionItem of sessionCart.items) {
        const existingItem = userCart.items.find(
          item => item.productId === sessionItem.productId && 
                  item.variantId === sessionItem.variantId
        );

        if (existingItem) {
          // Update quantity
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { 
              quantity: existingItem.quantity + sessionItem.quantity 
            }
          });
        } else {
          // Move item to user cart
          await this.prisma.cartItem.update({
            where: { id: sessionItem.id },
            data: { cartId: userCart.id }
          });
        }
      }

      // Delete empty session cart
      await this.prisma.cart.delete({
        where: { id: sessionCart.id }
      });
    }

    // Invalidate both caches
    await this.invalidateCartCache(userId, sessionId);

    return this.getOrCreateCart(userId);
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(userId?: string, sessionId?: string) {
    console.log('[CartService] validateCart called with:', {
      userId,
      sessionId,
      userIdType: typeof userId,
      sessionIdType: typeof sessionId
    });
    
    const cart = await this.getOrCreateCart(userId, sessionId);
    const errors: string[] = [];

    for (const item of cart.items) {
      // Check product availability - ACTIVE is the only valid status for checkout
      if (item.product.status !== 'ACTIVE') {
        errors.push(`Product "${item.product.name}" is no longer available (status: ${item.product.status})`);
        continue;
      }

      // Check stock
      const availableStock = item.variant?.stock ?? item.product.stock;
      if (availableStock < item.quantity) {
        errors.push(`Product "${item.product.name}" only has ${availableStock} items in stock (you have ${item.quantity} in cart)`);
      }

      // Check price changes
      const currentPrice = item.variant?.salePrice ?? item.variant?.price ?? item.product.salePrice ?? item.product.price;
      const cartPrice = item.salePrice ?? item.price;
      
      if (currentPrice !== cartPrice) {
        errors.push(`Price of "${item.product.name}" has changed from ${cartPrice} to ${currentPrice}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      cart,
    };
  }

  /**
   * Calculate cart totals
   * Ensures all required fields (tax, shippingFee, discount, total) are always present
   */
  private async calculateTotals(cart: any) {
    let subtotal = 0;
    let itemCount = 0;

    // Calculate subtotal and item count
    for (const item of cart.items || []) {
      const price = item.salePrice ?? item.price ?? 0;
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    }

    // Apply coupon discount if exists
    let discount = 0;
    if (cart.metadata?.coupon) {
      const coupon = cart.metadata.coupon;
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.discount) / 100;
      } else {
        discount = coupon.discount;
      }
    }

    // Calculate shipping fee (can be dynamic based on weight, location, etc.)
    const shippingFee = this.calculateShippingFee(subtotal, itemCount);

    // Calculate tax (can be dynamic based on location, product type, etc.)
    const tax = this.calculateTax(subtotal);

    // Total = subtotal + shipping + tax - discount
    const total = subtotal + shippingFee + tax - discount;

    return {
      ...cart,
      itemCount,
      subtotal: Math.max(0, subtotal), // Ensure non-negative
      shippingFee: Math.max(0, shippingFee),
      tax: Math.max(0, tax),
      discount: Math.max(0, discount),
      total: Math.max(0, total),
      // Ensure DateTime fields are Date objects (not strings from cache)
      createdAt: cart.createdAt instanceof Date ? cart.createdAt : new Date(cart.createdAt),
      updatedAt: cart.updatedAt instanceof Date ? cart.updatedAt : new Date(cart.updatedAt),
      expiresAt: cart.expiresAt ? (cart.expiresAt instanceof Date ? cart.expiresAt : new Date(cart.expiresAt)) : null,
    };
  }

  /**
   * Calculate shipping fee based on subtotal and item count
   * TODO: Implement dynamic shipping calculation based on:
   * - Customer location (city, district)
   * - Total weight
   * - Shipping provider rates
   * - Free shipping threshold
   */
  private calculateShippingFee(subtotal: number, itemCount: number): number {
    // Free shipping for orders above threshold
    const FREE_SHIPPING_THRESHOLD = 500000; // 500k VND
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    // Base shipping fee
    const BASE_SHIPPING_FEE = 30000; // 30k VND

    // Additional fee per item
    const PER_ITEM_FEE = 5000; // 5k VND per item
    const additionalFee = itemCount > 1 ? (itemCount - 1) * PER_ITEM_FEE : 0;

    return BASE_SHIPPING_FEE + additionalFee;
  }

  /**
   * Calculate tax based on subtotal
   * TODO: Implement dynamic tax calculation based on:
   * - Product category (some products may be tax-exempt)
   * - Customer type (business vs individual)
   * - Location (different tax rates by region)
   */
  private calculateTax(subtotal: number): number {
    // Vietnam VAT rate (10% for most products)
    const VAT_RATE = 0; // Currently 0% - will be enabled later
    return subtotal * VAT_RATE;
  }

  /**
   * Validate coupon code (placeholder)
   */
  private async validateCoupon(code: string) {
    // TODO: Implement actual coupon validation
    // Check if coupon exists, is valid, not expired, etc.
    // This is a placeholder implementation
    return {
      code,
      discount: 10,
      type: 'percentage',
    };
  }

  /**
   * Get cache key for cart
   */
  private getCartCacheKey(userId?: string, sessionId?: string): string {
    if (userId) return `cart:user:${userId}`;
    if (sessionId) return `cart:session:${sessionId}`;
    throw new BadRequestException('Either userId or sessionId is required');
  }

  /**
   * Invalidate cart cache
   */
  private async invalidateCartCache(userId?: string, sessionId?: string) {
    const cacheKey = this.getCartCacheKey(userId, sessionId);
    await this.redis.del(cacheKey);
  }

  /**
   * Validate cached cart has all required fields
   * Prevents returning null for non-nullable GraphQL fields
   */
  private isValidCachedCart(cart: any): boolean {
    if (!cart || typeof cart !== 'object') {
      return false;
    }

    // Check all required non-nullable fields
    const requiredFields = ['id', 'items', 'itemCount', 'subtotal', 'shippingFee', 'tax', 'discount', 'total', 'createdAt', 'updatedAt'];
    
    for (const field of requiredFields) {
      if (cart[field] === null || cart[field] === undefined) {
        console.log(`[CartCache] Invalid cache - missing field: ${field}`);
        return false;
      }
    }

    // Check numeric fields are actually numbers
    const numericFields = ['itemCount', 'subtotal', 'shippingFee', 'tax', 'discount', 'total'];
    for (const field of numericFields) {
      if (typeof cart[field] !== 'number' || isNaN(cart[field])) {
        console.log(`[CartCache] Invalid cache - ${field} is not a valid number`);
        return false;
      }
    }

    // Check DateTime fields can be parsed
    const dateFields = ['createdAt', 'updatedAt'];
    for (const field of dateFields) {
      try {
        const date = new Date(cart[field]);
        if (isNaN(date.getTime())) {
          console.log(`[CartCache] Invalid cache - ${field} is not a valid date`);
          return false;
        }
      } catch (error) {
        console.log(`[CartCache] Invalid cache - ${field} cannot be parsed as date`);
        return false;
      }
    }

    return true;
  }

  /**
   * Serialize cart for Redis cache
   * Converts Date objects to ISO strings for JSON compatibility
   */
  private serializeCart(cart: any): string {
    return JSON.stringify(cart, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  }

  /**
   * Deserialize cart from Redis cache
   * Converts ISO date strings back to Date objects for GraphQL compatibility
   */
  private deserializeCart(cached: string): any {
    const parsed = JSON.parse(cached);
    
    // Convert date strings back to Date objects
    if (parsed.createdAt && typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (parsed.updatedAt && typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }
    if (parsed.expiresAt && typeof parsed.expiresAt === 'string') {
      parsed.expiresAt = new Date(parsed.expiresAt);
    }
    
    // Convert date strings in items if needed
    if (Array.isArray(parsed.items)) {
      parsed.items = parsed.items.map((item: any) => {
        if (item.createdAt && typeof item.createdAt === 'string') {
          item.createdAt = new Date(item.createdAt);
        }
        if (item.updatedAt && typeof item.updatedAt === 'string') {
          item.updatedAt = new Date(item.updatedAt);
        }
        return item;
      });
    }
    
    return parsed;
  }

  /**
   * Clean up expired carts (should be run as cron job)
   */
  async cleanupExpiredCarts() {
    const deleted = await this.prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return { deletedCount: deleted.count };
  }
}
