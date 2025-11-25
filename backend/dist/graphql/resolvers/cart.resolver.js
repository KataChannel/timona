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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const cart_service_1 = require("../../services/cart.service");
const cart_schema_1 = require("../schemas/ecommerce/cart.schema");
let CartResolver = class CartResolver {
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getCart(sessionId, context) {
        const userId = context?.req?.user?.id;
        return this.cartService.getCart(userId, sessionId);
    }
    async addToCart(input, context) {
        try {
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async updateCartItem(input, sessionId, context) {
        try {
            const userId = context?.req?.user?.id;
            const { itemId, quantity } = input;
            const cart = await this.cartService.updateItem(itemId, quantity, userId, sessionId);
            return {
                success: true,
                message: 'Cart item updated successfully',
                cart,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async removeFromCart(input, sessionId, context) {
        try {
            const userId = context?.req?.user?.id;
            const { itemId } = input;
            const cart = await this.cartService.removeItem(itemId, userId, sessionId);
            return {
                success: true,
                message: 'Item removed from cart successfully',
                cart,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async clearCart(sessionId, context) {
        try {
            const userId = context?.req?.user?.id;
            const cart = await this.cartService.clearCart(userId, sessionId);
            return {
                success: true,
                message: 'Cart cleared successfully',
                cart,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async applyCoupon(input, context) {
        try {
            const userId = context?.req?.user?.id;
            const cart = await this.cartService.applyCoupon(input, userId);
            return {
                success: true,
                message: 'Coupon applied successfully',
                cart,
                discountAmount: cart.discount || 0,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async mergeCarts(input, context) {
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async validateCart(sessionId, context) {
        const userId = context?.req?.user?.id;
        const validation = await this.cartService.validateCart(userId, sessionId);
        return {
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: [],
            cart: validation.cart,
        };
    }
};
exports.CartResolver = CartResolver;
__decorate([
    (0, graphql_1.Query)(() => cart_schema_1.CartType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('sessionId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "getCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.AddToCartResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_schema_1.AddToCartInput, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "addToCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.UpdateCartResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('sessionId', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_schema_1.UpdateCartItemInput, String, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "updateCartItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.RemoveFromCartResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Args)('sessionId', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_schema_1.RemoveFromCartInput, String, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "removeFromCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.ClearCartResponse),
    __param(0, (0, graphql_1.Args)('sessionId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "clearCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.ApplyCouponResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_schema_1.ApplyCouponInput, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "applyCoupon", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_schema_1.MergeCartsResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cart_schema_1.MergeCartsInput, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "mergeCarts", null);
__decorate([
    (0, graphql_1.Query)(() => cart_schema_1.ValidateCartResponse),
    __param(0, (0, graphql_1.Args)('sessionId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "validateCart", null);
exports.CartResolver = CartResolver = __decorate([
    (0, graphql_1.Resolver)(() => cart_schema_1.CartType),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartResolver);
//# sourceMappingURL=cart.resolver.js.map