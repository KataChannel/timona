"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let CartService = class CartService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.CART_TTL = 86400 * 7;
        this.CACHE_TTL = 3600;
    }
    async getCart(userId, sessionId) {
        const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
        const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;
        if (!normalizedUserId && !normalizedSessionId) {
            return null;
        }
        const cacheKey = this.getCartCacheKey(normalizedUserId, normalizedSessionId);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            try {
                const parsedCart = this.deserializeCart(cached);
                if (this.isValidCachedCart(parsedCart)) {
                    return parsedCart;
                }
                await this.redis.del(cacheKey);
            }
            catch (error) {
                await this.redis.del(cacheKey);
            }
        }
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
        if (!cart) {
            return null;
        }
        const cartWithTotals = await this.calculateTotals(cart);
        await this.redis.setex(cacheKey, this.CACHE_TTL, this.serializeCart(cartWithTotals));
        return cartWithTotals;
    }
    async getOrCreateCart(userId, sessionId) {
        const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
        const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;
        if (!normalizedUserId && !normalizedSessionId) {
            throw new common_1.BadRequestException('Either userId or sessionId is required');
        }
        const cacheKey = this.getCartCacheKey(normalizedUserId, normalizedSessionId);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            try {
                const parsedCart = this.deserializeCart(cached);
                if (this.isValidCachedCart(parsedCart)) {
                    return parsedCart;
                }
                await this.redis.del(cacheKey);
                console.log('[CartCache] Deleted invalid cache for:', cacheKey);
            }
            catch (error) {
                await this.redis.del(cacheKey);
                console.error('[CartCache] Error parsing cache, deleted:', error.message);
            }
        }
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
        const cartWithTotals = await this.calculateTotals(cart);
        await this.redis.setex(cacheKey, this.CACHE_TTL, this.serializeCart(cartWithTotals));
        return cartWithTotals;
    }
    async addItem(input, userId) {
        const { productId, variantId, quantity, sessionId, metadata } = input;
        const normalizedUserId = userId && userId.trim() !== '' ? userId : undefined;
        const normalizedSessionId = sessionId && sessionId.trim() !== '' ? sessionId : undefined;
        if (!normalizedUserId && !normalizedSessionId) {
            throw new common_1.BadRequestException('Either userId or sessionId is required');
        }
        if (!productId) {
            throw new common_1.BadRequestException('Product ID is required');
        }
        if (!quantity || quantity < 1) {
            throw new common_1.BadRequestException('Quantity must be at least 1');
        }
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: variantId ? { where: { id: variantId } } : undefined,
            }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Product is not available');
        }
        const variant = variantId ? product.variants?.[0] : null;
        const availableStock = variant ? variant.stock : product.stock;
        if (availableStock < quantity) {
            throw new common_1.BadRequestException(`Only ${availableStock} items available in stock`);
        }
        const cart = await this.getOrCreateCart(normalizedUserId, normalizedSessionId);
        const existingItem = cart.items.find(item => item.productId === productId && item.variantId === variantId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                throw new common_1.BadRequestException(`Cannot add ${quantity} more items. Only ${availableStock - existingItem.quantity} available`);
            }
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: newQuantity,
                    updatedAt: new Date(),
                }
            });
        }
        else {
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
        await this.invalidateCartCache(normalizedUserId, normalizedSessionId);
        return this.getOrCreateCart(normalizedUserId, normalizedSessionId);
    }
    async updateItem(itemId, quantity, userId, sessionId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
                variant: true,
            }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (userId) {
            if (cartItem.cart.userId !== userId) {
                throw new common_1.BadRequestException('Cart item does not belong to user');
            }
        }
        else if (sessionId) {
            if (cartItem.cart.sessionId !== sessionId) {
                throw new common_1.BadRequestException('Cart item does not belong to session');
            }
        }
        else {
            throw new common_1.BadRequestException('Either userId or sessionId is required');
        }
        const availableStock = cartItem.variant?.stock ?? cartItem.product.stock;
        if (quantity > availableStock) {
            throw new common_1.BadRequestException(`Only ${availableStock} items available in stock`);
        }
        await this.prisma.cartItem.update({
            where: { id: itemId },
            data: {
                quantity,
                updatedAt: new Date(),
            }
        });
        await this.invalidateCartCache(userId, sessionId);
        return this.getOrCreateCart(userId, sessionId);
    }
    async removeItem(itemId, userId, sessionId) {
        const cartItem = await this.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (userId) {
            if (cartItem.cart.userId !== userId) {
                throw new common_1.BadRequestException('Cart item does not belong to user');
            }
        }
        else if (sessionId) {
            if (cartItem.cart.sessionId !== sessionId) {
                throw new common_1.BadRequestException('Cart item does not belong to session');
            }
        }
        else {
            throw new common_1.BadRequestException('Either userId or sessionId is required');
        }
        await this.prisma.cartItem.delete({
            where: { id: itemId }
        });
        await this.invalidateCartCache(userId, sessionId);
        return this.getOrCreateCart(userId, sessionId);
    }
    async clearCart(userId, sessionId) {
        const cart = await this.getOrCreateCart(userId, sessionId);
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });
        await this.invalidateCartCache(userId, sessionId);
        return this.getOrCreateCart(userId, sessionId);
    }
    async applyCoupon(input, userId) {
        const { couponCode, sessionId } = input;
        const coupon = await this.validateCoupon(couponCode);
        const cart = await this.getOrCreateCart(userId, sessionId);
        await this.prisma.cart.update({
            where: { id: cart.id },
            data: {
                metadata: {
                    ...(cart.metadata || {}),
                    coupon: {
                        code: couponCode,
                        discount: coupon.discount,
                        type: coupon.type,
                    }
                }
            }
        });
        await this.invalidateCartCache(userId, sessionId);
        return this.getOrCreateCart(userId, sessionId);
    }
    async mergeCarts(input) {
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
            await this.prisma.cart.update({
                where: { id: sessionCart.id },
                data: {
                    userId,
                    sessionId: null,
                }
            });
        }
        else {
            for (const sessionItem of sessionCart.items) {
                const existingItem = userCart.items.find(item => item.productId === sessionItem.productId &&
                    item.variantId === sessionItem.variantId);
                if (existingItem) {
                    await this.prisma.cartItem.update({
                        where: { id: existingItem.id },
                        data: {
                            quantity: existingItem.quantity + sessionItem.quantity
                        }
                    });
                }
                else {
                    await this.prisma.cartItem.update({
                        where: { id: sessionItem.id },
                        data: { cartId: userCart.id }
                    });
                }
            }
            await this.prisma.cart.delete({
                where: { id: sessionCart.id }
            });
        }
        await this.invalidateCartCache(userId, sessionId);
        return this.getOrCreateCart(userId);
    }
    async validateCart(userId, sessionId) {
        console.log('[CartService] validateCart called with:', {
            userId,
            sessionId,
            userIdType: typeof userId,
            sessionIdType: typeof sessionId
        });
        const cart = await this.getOrCreateCart(userId, sessionId);
        const errors = [];
        for (const item of cart.items) {
            if (item.product.status !== 'ACTIVE') {
                errors.push(`Product "${item.product.name}" is no longer available (status: ${item.product.status})`);
                continue;
            }
            const availableStock = item.variant?.stock ?? item.product.stock;
            if (availableStock < item.quantity) {
                errors.push(`Product "${item.product.name}" only has ${availableStock} items in stock (you have ${item.quantity} in cart)`);
            }
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
    async calculateTotals(cart) {
        let subtotal = 0;
        let itemCount = 0;
        for (const item of cart.items || []) {
            const price = item.salePrice ?? item.price ?? 0;
            subtotal += price * item.quantity;
            itemCount += item.quantity;
        }
        let discount = 0;
        if (cart.metadata?.coupon) {
            const coupon = cart.metadata.coupon;
            if (coupon.type === 'percentage') {
                discount = (subtotal * coupon.discount) / 100;
            }
            else {
                discount = coupon.discount;
            }
        }
        const shippingFee = this.calculateShippingFee(subtotal, itemCount);
        const tax = this.calculateTax(subtotal);
        const total = subtotal + shippingFee + tax - discount;
        return {
            ...cart,
            itemCount,
            subtotal: Math.max(0, subtotal),
            shippingFee: Math.max(0, shippingFee),
            tax: Math.max(0, tax),
            discount: Math.max(0, discount),
            total: Math.max(0, total),
            createdAt: cart.createdAt instanceof Date ? cart.createdAt : new Date(cart.createdAt),
            updatedAt: cart.updatedAt instanceof Date ? cart.updatedAt : new Date(cart.updatedAt),
            expiresAt: cart.expiresAt ? (cart.expiresAt instanceof Date ? cart.expiresAt : new Date(cart.expiresAt)) : null,
        };
    }
    calculateShippingFee(subtotal, itemCount) {
        const FREE_SHIPPING_THRESHOLD = 500000;
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            return 0;
        }
        const BASE_SHIPPING_FEE = 30000;
        const PER_ITEM_FEE = 5000;
        const additionalFee = itemCount > 1 ? (itemCount - 1) * PER_ITEM_FEE : 0;
        return BASE_SHIPPING_FEE + additionalFee;
    }
    calculateTax(subtotal) {
        const VAT_RATE = 0;
        return subtotal * VAT_RATE;
    }
    async validateCoupon(code) {
        return {
            code,
            discount: 10,
            type: 'percentage',
        };
    }
    getCartCacheKey(userId, sessionId) {
        if (userId)
            return `cart:user:${userId}`;
        if (sessionId)
            return `cart:session:${sessionId}`;
        throw new common_1.BadRequestException('Either userId or sessionId is required');
    }
    async invalidateCartCache(userId, sessionId) {
        const cacheKey = this.getCartCacheKey(userId, sessionId);
        await this.redis.del(cacheKey);
    }
    isValidCachedCart(cart) {
        if (!cart || typeof cart !== 'object') {
            return false;
        }
        const requiredFields = ['id', 'items', 'itemCount', 'subtotal', 'shippingFee', 'tax', 'discount', 'total', 'createdAt', 'updatedAt'];
        for (const field of requiredFields) {
            if (cart[field] === null || cart[field] === undefined) {
                console.log(`[CartCache] Invalid cache - missing field: ${field}`);
                return false;
            }
        }
        const numericFields = ['itemCount', 'subtotal', 'shippingFee', 'tax', 'discount', 'total'];
        for (const field of numericFields) {
            if (typeof cart[field] !== 'number' || isNaN(cart[field])) {
                console.log(`[CartCache] Invalid cache - ${field} is not a valid number`);
                return false;
            }
        }
        const dateFields = ['createdAt', 'updatedAt'];
        for (const field of dateFields) {
            try {
                const date = new Date(cart[field]);
                if (isNaN(date.getTime())) {
                    console.log(`[CartCache] Invalid cache - ${field} is not a valid date`);
                    return false;
                }
            }
            catch (error) {
                console.log(`[CartCache] Invalid cache - ${field} cannot be parsed as date`);
                return false;
            }
        }
        return true;
    }
    serializeCart(cart) {
        return JSON.stringify(cart, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        });
    }
    deserializeCart(cached) {
        const parsed = JSON.parse(cached);
        if (parsed.createdAt && typeof parsed.createdAt === 'string') {
            parsed.createdAt = new Date(parsed.createdAt);
        }
        if (parsed.updatedAt && typeof parsed.updatedAt === 'string') {
            parsed.updatedAt = new Date(parsed.updatedAt);
        }
        if (parsed.expiresAt && typeof parsed.expiresAt === 'string') {
            parsed.expiresAt = new Date(parsed.expiresAt);
        }
        if (Array.isArray(parsed.items)) {
            parsed.items = parsed.items.map((item) => {
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
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CartService);
//# sourceMappingURL=cart.service.js.map