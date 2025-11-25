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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cart_service_1 = require("./cart.service");
const notification_service_1 = require("./notification.service");
let OrderService = class OrderService {
    constructor(prisma, cartService, notificationService) {
        this.prisma = prisma;
        this.cartService = cartService;
        this.notificationService = notificationService;
    }
    async createFromCart(input, userId) {
        const { shippingAddress, billingAddress, paymentMethod, shippingMethod, sessionId } = input;
        console.log('[OrderService] createFromCart input:', {
            userId,
            sessionId,
            hasShippingAddress: !!shippingAddress,
            paymentMethod,
            shippingMethod
        });
        const cartValidation = await this.cartService.validateCart(userId, sessionId);
        if (!cartValidation.isValid) {
            throw new common_1.BadRequestException(`Cart validation failed: ${cartValidation.errors.join(', ')}`);
        }
        const cart = cartValidation.cart;
        if (cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let subtotal = 0;
        const orderItems = [];
        for (const item of cart.items) {
            const price = item.price;
            const itemSubtotal = price * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                productId: item.productId,
                variantId: item.variantId || null,
                productName: item.product.name,
                variantName: item.variant?.name || null,
                sku: item.variant?.sku || item.product.sku || null,
                thumbnail: item.product.thumbnail ||
                    (item.product.images && item.product.images[0]
                        ? (typeof item.product.images[0] === 'string'
                            ? item.product.images[0]
                            : item.product.images[0]?.url || item.product.images[0]?.src || null)
                        : null),
                quantity: item.quantity,
                quantityOrdered: item.quantity,
                quantityDelivered: 0,
                quantityReceived: 0,
                quantityCancelled: 0,
                price,
                subtotal: itemSubtotal,
                totalDelivered: 0,
                totalReceived: 0,
                totalAfterVAT: itemSubtotal,
                vat: 0,
                metadata: {
                    productSnapshot: {
                        name: item.product.name,
                        slug: item.product.slug,
                        images: item.product.images,
                        attributes: item.variant?.attributes || {},
                    },
                },
            });
        }
        const shippingFee = this.calculateShippingFee(shippingMethod, subtotal, shippingAddress);
        const tax = 0;
        const total = subtotal + shippingFee + tax;
        const orderNumber = await this.generateOrderNumber();
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of cart.items) {
                const variant = item.variant;
                const product = item.product;
                if (variant) {
                    const currentVariant = await tx.productVariant.findUnique({
                        where: { id: variant.id }
                    });
                    if (currentVariant.stock < item.quantity) {
                        throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
                    }
                    const beforeStock = currentVariant.stock;
                    const afterStock = beforeStock - item.quantity;
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: afterStock }
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            variantId: item.variantId,
                            type: 'SALE',
                            quantity: -item.quantity,
                            beforeStock,
                            afterStock,
                            reason: `Order ${orderNumber}`,
                            performedBy: userId,
                        }
                    });
                }
                else {
                    const currentProduct = await tx.product.findUnique({
                        where: { id: product.id }
                    });
                    if (currentProduct.stock < item.quantity) {
                        throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
                    }
                    const beforeStock = currentProduct.stock;
                    const afterStock = beforeStock - item.quantity;
                    await tx.product.update({
                        where: { id: product.id },
                        data: { stock: afterStock }
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            type: 'SALE',
                            quantity: -item.quantity,
                            beforeStock,
                            afterStock,
                            reason: `Order ${orderNumber}`,
                            performedBy: userId,
                        }
                    });
                }
            }
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    guestEmail: input.guestEmail,
                    guestName: shippingAddress.name,
                    guestPhone: shippingAddress.phone,
                    subtotal,
                    shippingFee,
                    tax,
                    discount: 0,
                    total,
                    status: 'PENDING',
                    shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
                    billingAddress: billingAddress ? JSON.parse(JSON.stringify(billingAddress)) : JSON.parse(JSON.stringify(shippingAddress)),
                    shippingMethod,
                    items: {
                        create: orderItems,
                    },
                    tracking: {
                        create: {
                            status: 'PENDING',
                        }
                    },
                    payment: {
                        create: {
                            method: paymentMethod,
                            status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
                            amount: total,
                        }
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        }
                    },
                    tracking: true,
                    payment: true,
                }
            });
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            return newOrder;
        });
        try {
            await this.notificationService.createOrderNotification(userId, input.guestEmail, order.orderNumber, order.total, order);
        }
        catch (error) {
            console.error('Failed to send order notification:', error);
        }
        return order;
    }
    async getOrder(orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    }
                },
                tracking: {
                    include: {
                        events: {
                            orderBy: { eventTime: 'desc' }
                        }
                    }
                },
                payment: true,
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userId && order.userId && order.userId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        return order;
    }
    async getOrderByNumber(orderNumber, email) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    }
                },
                tracking: {
                    include: {
                        events: {
                            orderBy: { eventTime: 'desc' }
                        }
                    }
                },
                payment: true,
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (email && !order.userId && order.guestEmail && order.guestEmail !== email) {
            throw new common_1.BadRequestException('Invalid order number or email');
        }
        return order;
    }
    async listOrders(filter, userId) {
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (filter?.status) {
            where.status = filter.status;
        }
        if (filter?.paymentStatus) {
            where.payment = {
                status: filter.paymentStatus
            };
        }
        if (filter?.dateFrom || filter?.dateTo) {
            where.createdAt = {};
            if (filter.dateFrom) {
                where.createdAt.gte = new Date(filter.dateFrom);
            }
            if (filter.dateTo) {
                where.createdAt.lte = new Date(filter.dateTo);
            }
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: true,
                        }
                    },
                    tracking: true,
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: filter?.skip || 0,
                take: filter?.take || 20,
            }),
            this.prisma.order.count({ where })
        ]);
        return {
            orders,
            total,
            hasMore: (filter?.skip || 0) + orders.length < total,
        };
    }
    async updateStatus(input, adminUserId) {
        const { orderId, status } = input;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { tracking: true }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        this.validateStatusTransition(order.status, status);
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                updatedAt: new Date(),
            },
            include: {
                items: true,
                tracking: true,
                payment: true,
            }
        });
        if (order.tracking) {
            await this.prisma.orderTrackingEvent.create({
                data: {
                    trackingId: order.tracking.id,
                    status: status,
                    description: this.getStatusDescription(status),
                    location: 'System',
                    eventTime: new Date(),
                }
            });
            const shippingStatus = this.mapOrderStatusToShippingStatus(status);
            if (shippingStatus) {
                await this.prisma.orderTracking.update({
                    where: { id: order.tracking.id },
                    data: { status: shippingStatus }
                });
            }
        }
        return updatedOrder;
    }
    async cancelOrder(input, userId) {
        const { orderId, reason } = input;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    }
                },
                tracking: true,
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userId && order.userId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be cancelled at this stage');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                if (item.variantId) {
                    const variant = await tx.productVariant.findUnique({
                        where: { id: item.variantId }
                    });
                    const beforeStock = variant.stock;
                    const afterStock = beforeStock + item.quantity;
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: afterStock }
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            variantId: item.variantId,
                            type: 'RETURN',
                            quantity: item.quantity,
                            beforeStock,
                            afterStock,
                            reason: `Order ${order.orderNumber} cancelled: ${reason}`,
                            performedBy: userId,
                        }
                    });
                }
                else {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId }
                    });
                    const beforeStock = product.stock;
                    const afterStock = beforeStock + item.quantity;
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: afterStock }
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            type: 'RETURN',
                            quantity: item.quantity,
                            beforeStock,
                            afterStock,
                            reason: `Order ${order.orderNumber} cancelled: ${reason}`,
                            performedBy: userId,
                        }
                    });
                }
            }
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                }
            });
            if (order.tracking) {
                await tx.orderTrackingEvent.create({
                    data: {
                        trackingId: order.tracking.id,
                        status: 'CANCELLED',
                        description: `Order cancelled: ${reason}`,
                        location: 'System',
                        eventTime: new Date(),
                    }
                });
                await tx.orderTracking.update({
                    where: { id: order.tracking.id },
                    data: { status: 'FAILED' }
                });
            }
        });
        return this.getOrder(orderId, userId);
    }
    async addTrackingEvent(orderId, description, location, status) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { tracking: true }
        });
        if (!order || !order.tracking) {
            throw new common_1.NotFoundException('Order or tracking not found');
        }
        await this.prisma.orderTrackingEvent.create({
            data: {
                trackingId: order.tracking.id,
                status: status || order.status,
                description,
                location: location || 'System',
                eventTime: new Date(),
            }
        });
        return this.getOrder(orderId);
    }
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        const todayCount = await this.prisma.order.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        });
        const sequence = String(todayCount + 1).padStart(4, '0');
        return `ORD-${year}${month}${day}-${sequence}`;
    }
    calculateShippingFee(method, subtotal, address) {
        if (subtotal >= 500000) {
            return 0;
        }
        switch (method) {
            case 'STANDARD':
                return 30000;
            case 'EXPRESS':
                return 50000;
            case 'SAME_DAY':
                return 80000;
            case 'PICKUP':
                return 0;
            default:
                return 30000;
        }
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['shipped', 'cancelled'],
            shipped: ['out_for_delivery'],
            out_for_delivery: ['delivered', 'failed'],
            delivered: ['completed', 'return_requested'],
            failed: ['pending', 'cancelled'],
            return_requested: ['returned', 'completed'],
            returned: [],
            cancelled: [],
            completed: [],
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
    getStatusDescription(status) {
        const descriptions = {
            pending: 'Order is pending confirmation',
            confirmed: 'Order confirmed and being prepared',
            processing: 'Order is being processed',
            shipped: 'Order has been shipped',
            out_for_delivery: 'Order is out for delivery',
            delivered: 'Order has been delivered',
            completed: 'Order completed successfully',
            cancelled: 'Order has been cancelled',
            failed: 'Delivery failed',
            return_requested: 'Return has been requested',
            returned: 'Order has been returned',
        };
        return descriptions[status] || 'Status updated';
    }
    async getStatistics(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [totalOrders, totalRevenue, statusCounts, paymentStatusCounts] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.aggregate({
                where,
                _sum: { total: true }
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.payment.groupBy({
                by: ['status'],
                _count: true,
            })
        ]);
        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            byStatus: statusCounts.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            byPaymentStatus: paymentStatusCounts.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
        };
    }
    mapOrderStatusToShippingStatus(orderStatus) {
        const mapping = {
            'PENDING': 'PENDING',
            'CONFIRMED': 'PREPARING',
            'PROCESSING': 'PREPARING',
            'PACKAGING': 'PREPARING',
            'READY_TO_SHIP': 'PICKED_UP',
            'SHIPPING': 'IN_TRANSIT',
            'DELIVERED': 'DELIVERED',
            'CANCELLED': 'FAILED',
            'RETURNED': 'RETURNED',
        };
        return mapping[orderStatus] || null;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_service_1.CartService,
        notification_service_1.NotificationService])
], OrderService);
//# sourceMappingURL=order.service.js.map