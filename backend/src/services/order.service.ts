import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { 
  CreateOrderInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
  OrderFilterInput 
} from '../graphql/schemas/ecommerce/order.schema';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create order from cart
   */
  async createFromCart(input: CreateOrderInput, userId?: string) {
    const { shippingAddress, billingAddress, paymentMethod, shippingMethod, sessionId } = input;

    console.log('[OrderService] createFromCart input:', {
      userId,
      sessionId,
      hasShippingAddress: !!shippingAddress,
      paymentMethod,
      shippingMethod
    });

    // Get cart with validation
    const cartValidation = await this.cartService.validateCart(userId, sessionId);
    
    if (!cartValidation.isValid) {
      throw new BadRequestException(`Cart validation failed: ${cartValidation.errors.join(', ')}`);
    }

    const cart = cartValidation.cart;

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const price = item.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        
        // Required snapshot fields
        productName: item.product.name,
        variantName: item.variant?.name || null,
        sku: item.variant?.sku || item.product.sku || null,
        thumbnail: item.product.thumbnail || 
          (item.product.images && item.product.images[0] 
            ? (typeof item.product.images[0] === 'string' 
                ? item.product.images[0] 
                : item.product.images[0]?.url || item.product.images[0]?.src || null)
            : null),
        
        // Quantities
        quantity: item.quantity,
        quantityOrdered: item.quantity,
        quantityDelivered: 0,
        quantityReceived: 0,
        quantityCancelled: 0,
        
        // Pricing
        price, // Unit price snapshot
        subtotal: itemSubtotal,
        totalDelivered: 0,
        totalReceived: 0,
        totalAfterVAT: itemSubtotal,
        vat: 0,
        
        // Metadata - store full product snapshot
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

    // Calculate shipping (simplified - implement actual calculation)
    const shippingFee = this.calculateShippingFee(shippingMethod, subtotal, shippingAddress);
    
    // Calculate tax if needed
    const tax = 0; // Implement tax calculation if needed

    const total = subtotal + shippingFee + tax;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Reserve inventory
      for (const item of cart.items) {
        const variant = item.variant;
        const product = item.product;

        if (variant) {
          // Check and update variant stock
          const currentVariant = await tx.productVariant.findUnique({
            where: { id: variant.id }
          });

          if (currentVariant!.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${product.name}`);
          }

          const beforeStock = currentVariant!.stock;
          const afterStock = beforeStock - item.quantity;

          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: afterStock }
          });

          // Log inventory change
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
        } else {
          // Check and update product stock
          const currentProduct = await tx.product.findUnique({
            where: { id: product.id }
          });

          if (currentProduct!.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${product.name}`);
          }

          const beforeStock = currentProduct!.stock;
          const afterStock = beforeStock - item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { stock: afterStock }
          });

          // Log inventory change
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

      // Create order
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

      // Clear cart after successful order
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return newOrder;
    });

    // 🆕 Gửi notification sau khi tạo order thành công
    try {
      await this.notificationService.createOrderNotification(
        userId,
        input.guestEmail,
        order.orderNumber,
        order.total,
        order,
      );
    } catch (error) {
      // Log error nhưng không throw để không ảnh hưởng order creation
      console.error('Failed to send order notification:', error);
    }

    return order;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId?: string) {
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
      throw new NotFoundException('Order not found');
    }

    // Verify ownership (allow access to own orders or guest orders with email)
    if (userId && order.userId && order.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return order;
  }

  /**
   * Get order by order number (for tracking)
   * Note: This is a public endpoint for order tracking, so we allow viewing without strict auth
   * For more sensitive operations, use getOrder() which requires userId verification
   */
  async getOrderByNumber(orderNumber: string, email?: string) {
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
      throw new NotFoundException('Order not found');
    }

    // Optional: For guest orders, verify email if provided (for additional security)
    // But don't require it - allow viewing order details with just order number
    // This matches common e-commerce UX where order number alone is sufficient
    if (email && !order.userId && order.guestEmail && order.guestEmail !== email) {
      throw new BadRequestException('Invalid order number or email');
    }

    return order;
  }

  /**
   * List orders with filters
   */
  async listOrders(filter?: OrderFilterInput, userId?: string) {
    const where: any = {};

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

  /**
   * Update order status
   */
  async updateStatus(input: UpdateOrderStatusInput, adminUserId: string) {
    const { orderId, status } = input;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { tracking: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Update order
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

    // Add tracking event
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

      // Map OrderStatus to ShippingStatus for tracking
      const shippingStatus = this.mapOrderStatusToShippingStatus(status);
      if (shippingStatus) {
        await this.prisma.orderTracking.update({
          where: { id: order.tracking.id },
          data: { status: shippingStatus as any }
        });
      }
    }

    // TODO: Send notification email

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  async cancelOrder(input: CancelOrderInput, userId?: string) {
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
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (userId && order.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    // Restore inventory in transaction
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId }
          });
          
          const beforeStock = variant!.stock;
          const afterStock = beforeStock + item.quantity;

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: afterStock }
          });

          // Log inventory restoration
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
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          const beforeStock = product!.stock;
          const afterStock = beforeStock + item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: afterStock }
          });

          // Log inventory restoration
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

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        }
      });

      // Add tracking event
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

  /**
   * Add tracking event
   */
  async addTrackingEvent(orderId: string, description: string, location: string, status?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { tracking: true }
    });

    if (!order || !order.tracking) {
      throw new NotFoundException('Order or tracking not found');
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

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders today
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

  /**
   * Calculate shipping fee (simplified)
   */
  private calculateShippingFee(method: string, subtotal: number, address: any): number {
    // Free shipping for orders over 500k
    if (subtotal >= 500000) {
      return 0;
    }

    // Calculate based on method
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

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
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
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Get status description
   */
  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
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

  /**
   * Get order statistics (for admin dashboard)
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalOrders,
      totalRevenue,
      statusCounts,
      paymentStatusCounts
    ] = await Promise.all([
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
      }, {} as Record<string, number>),
      byPaymentStatus: paymentStatusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Map OrderStatus to ShippingStatus
   */
  private mapOrderStatusToShippingStatus(orderStatus: string): string | null {
    const mapping: Record<string, string> = {
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
}
