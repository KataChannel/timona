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
exports.OrderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const order_service_1 = require("../../services/order.service");
const order_schema_1 = require("../schemas/ecommerce/order.schema");
let OrderResolver = class OrderResolver {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(input, context) {
        try {
            const userId = context?.req?.user?.id;
            console.log('[OrderResolver] ========================================');
            console.log('[OrderResolver] createOrder FULL INPUT:', {
                userId,
                hasUserId: !!userId,
                sessionId: input.sessionId,
                sessionIdType: typeof input.sessionId,
                hasSessionId: !!input.sessionId,
                shippingAddress: input.shippingAddress,
                hasShippingAddress: !!input.shippingAddress,
                shippingAddressKeys: input.shippingAddress ? Object.keys(input.shippingAddress) : [],
                shippingAddressValues: input.shippingAddress ? {
                    name: input.shippingAddress.name,
                    phone: input.shippingAddress.phone,
                    address: input.shippingAddress.address,
                    city: input.shippingAddress.city,
                    district: input.shippingAddress.district,
                    ward: input.shippingAddress.ward,
                } : null,
                paymentMethod: input.paymentMethod,
                shippingMethod: input.shippingMethod,
                customerNote: input.customerNote,
                fullInput: JSON.stringify(input, null, 2),
            });
            console.log('[OrderResolver] ========================================');
            const order = await this.orderService.createFromCart(input, userId);
            return {
                success: true,
                message: `Order ${order.orderNumber} created successfully`,
                order: order,
            };
        }
        catch (error) {
            console.error('[OrderResolver] createOrder ERROR:', {
                error,
                message: error.message,
                stack: error.stack,
            });
            return {
                success: false,
                message: error.message,
                errors: [error.message],
            };
        }
    }
    async getOrder(orderId, context) {
        const userId = context?.req?.user?.id;
        return this.orderService.getOrder(orderId, userId);
    }
    async getOrderByNumber(orderNumber, email) {
        return this.orderService.getOrderByNumber(orderNumber, email);
    }
    async listOrders(filter, context) {
        try {
            const userId = context?.req?.user?.id;
            const result = await this.orderService.listOrders(filter, userId);
            return {
                orders: result.orders,
                total: result.total,
                hasMore: result.hasMore,
            };
        }
        catch (error) {
            return {
                message: error.message,
                errors: [error.message],
                orders: [],
                total: 0,
                hasMore: false,
            };
        }
    }
    async getMyOrders(skip, take, context) {
        try {
            const userId = context?.req?.user?.id;
            if (!userId) {
                throw new Error('Authentication required');
            }
            const filter = { skip, take };
            const result = await this.orderService.listOrders(filter, userId);
            return {
                orders: result.orders,
                total: result.total,
                hasMore: result.hasMore,
            };
        }
        catch (error) {
            return {
                message: error.message,
                errors: [error.message],
                orders: [],
                total: 0,
                hasMore: false,
            };
        }
    }
    async updateOrderStatus(input, context) {
        try {
            const adminUserId = context?.req?.user?.id || 'system';
            const order = await this.orderService.updateStatus(input, adminUserId);
            return {
                success: true,
                message: `Order status updated to ${input.status}`,
                order: order,
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
    async cancelOrder(input, context) {
        try {
            const userId = context?.req?.user?.id;
            const order = await this.orderService.cancelOrder(input, userId);
            return {
                success: true,
                message: 'Order cancelled successfully',
                order: order,
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
    async addTrackingEvent(orderId, description, location, status) {
        return this.orderService.addTrackingEvent(orderId, description, location, status);
    }
    async getOrderStatistics(startDate, endDate) {
        try {
            const stats = await this.orderService.getStatistics(startDate, endDate);
            return {
                success: true,
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
                byStatus: stats.byStatus,
                byPaymentStatus: stats.byPaymentStatus,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                totalOrders: 0,
                totalRevenue: 0,
                byStatus: {},
                byPaymentStatus: {},
            };
        }
    }
};
exports.OrderResolver = OrderResolver;
__decorate([
    (0, graphql_1.Mutation)(() => order_schema_1.CreateOrderResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.CreateOrderInput, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "createOrder", null);
__decorate([
    (0, graphql_1.Query)(() => order_schema_1.OrderType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getOrder", null);
__decorate([
    (0, graphql_1.Query)(() => order_schema_1.OrderType, { nullable: true }),
    __param(0, (0, graphql_1.Args)('orderNumber')),
    __param(1, (0, graphql_1.Args)('email', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getOrderByNumber", null);
__decorate([
    (0, graphql_1.Query)(() => order_schema_1.OrderListResponse),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.OrderFilterInput, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "listOrders", null);
__decorate([
    (0, graphql_1.Query)(() => order_schema_1.OrderListResponse),
    __param(0, (0, graphql_1.Args)('skip', { type: () => Number, nullable: true, defaultValue: 0 })),
    __param(1, (0, graphql_1.Args)('take', { type: () => Number, nullable: true, defaultValue: 20 })),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getMyOrders", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_schema_1.UpdateOrderResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.UpdateOrderStatusInput, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "updateOrderStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_schema_1.CancelOrderResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_schema_1.CancelOrderInput, Object]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "cancelOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_schema_1.OrderType),
    __param(0, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('description')),
    __param(2, (0, graphql_1.Args)('location')),
    __param(3, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "addTrackingEvent", null);
__decorate([
    (0, graphql_1.Query)(() => order_schema_1.OrderStatisticsResponse),
    __param(0, (0, graphql_1.Args)('startDate', { type: () => Date, nullable: true })),
    __param(1, (0, graphql_1.Args)('endDate', { type: () => Date, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date]),
    __metadata("design:returntype", Promise)
], OrderResolver.prototype, "getOrderStatistics", null);
exports.OrderResolver = OrderResolver = __decorate([
    (0, graphql_1.Resolver)(() => order_schema_1.OrderType),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderResolver);
//# sourceMappingURL=order.resolver.js.map