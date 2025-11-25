import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from '../../services/order.service';
import {
  OrderType,
  CreateOrderInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
  OrderFilterInput,
  CreateOrderResponse,
  UpdateOrderResponse,
  CancelOrderResponse,
  OrderListResponse,
  OrderStatisticsResponse,
} from '../schemas/ecommerce/order.schema';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create order from cart (checkout)
   */
  @Mutation(() => CreateOrderResponse)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @Context() context?: any,
  ): Promise<CreateOrderResponse> {
    try {
      const userId = context?.req?.user?.id;
      
      console.log('[OrderResolver] ========================================');
      console.log('[OrderResolver] createOrder FULL INPUT:', {
        // User context
        userId,
        hasUserId: !!userId,
        
        // Session
        sessionId: input.sessionId,
        sessionIdType: typeof input.sessionId,
        hasSessionId: !!input.sessionId,
        
        // Shipping address
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
        
        // Methods
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        
        // Notes
        customerNote: input.customerNote,
        
        // Full input object
        fullInput: JSON.stringify(input, null, 2),
      });
      console.log('[OrderResolver] ========================================');
      
      const order = await this.orderService.createFromCart(input, userId);
      
      return {
        success: true,
        message: `Order ${order.orderNumber} created successfully`,
        order: order as any,
      };
    } catch (error) {
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

  /**
   * Get order by ID
   */
  @Query(() => OrderType, { nullable: true })
  async getOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Context() context?: any,
  ) {
    const userId = context?.req?.user?.id;
    return this.orderService.getOrder(orderId, userId);
  }

  /**
   * Get order by order number (for tracking)
   */
  @Query(() => OrderType, { nullable: true })
  async getOrderByNumber(
    @Args('orderNumber') orderNumber: string,
    @Args('email', { nullable: true }) email?: string,
  ) {
    return this.orderService.getOrderByNumber(orderNumber, email);
  }

  /**
   * List orders (user's own orders or admin view)
   */
  @Query(() => OrderListResponse)
  async listOrders(
    @Args('filter', { nullable: true }) filter?: OrderFilterInput,
    @Context() context?: any,
  ): Promise<OrderListResponse> {
    try {
      const userId = context?.req?.user?.id;
      const result = await this.orderService.listOrders(filter, userId);
      
      return {
        orders: result.orders as any[],
        total: result.total,
        hasMore: result.hasMore,
      };
    } catch (error) {
      return {
        message: error.message,
        errors: [error.message],
        orders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Get user's own orders
   */
  @Query(() => OrderListResponse)
  async getMyOrders(
    @Args('skip', { type: () => Number, nullable: true, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Number, nullable: true, defaultValue: 20 }) take: number,
    @Context() context?: any,
  ): Promise<OrderListResponse> {
    try {
      const userId = context?.req?.user?.id;
      
      if (!userId) {
        throw new Error('Authentication required');
      }

      const filter: OrderFilterInput = { skip, take };
      const result = await this.orderService.listOrders(filter, userId);
      
      return {
        orders: result.orders as any[],
        total: result.total,
        hasMore: result.hasMore,
      };
    } catch (error) {
      return {
        message: error.message,
        errors: [error.message],
        orders: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Update order status (admin only)
   */
  @Mutation(() => UpdateOrderResponse)
  // @UseGuards(AdminGuard) // Uncomment when auth is implemented
  async updateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
    @Context() context?: any,
  ): Promise<UpdateOrderResponse> {
    try {
      const adminUserId = context?.req?.user?.id || 'system';
      const order = await this.orderService.updateStatus(input, adminUserId);
      
      return {
        success: true,
        message: `Order status updated to ${input.status}`,
        order: order as any,
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
   * Cancel order (user can cancel own orders)
   */
  @Mutation(() => CancelOrderResponse)
  async cancelOrder(
    @Args('input') input: CancelOrderInput,
    @Context() context?: any,
  ): Promise<CancelOrderResponse> {
    try {
      const userId = context?.req?.user?.id;
      const order = await this.orderService.cancelOrder(input, userId);
      
      return {
        success: true,
        message: 'Order cancelled successfully',
        order: order as any,
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
   * Add tracking event (admin only)
   */
  @Mutation(() => OrderType)
  // @UseGuards(AdminGuard) // Uncomment when auth is implemented
  async addTrackingEvent(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('description') description: string,
    @Args('location') location: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.orderService.addTrackingEvent(orderId, description, location, status);
  }

  /**
   * Get order statistics (admin only)
   */
  @Query(() => OrderStatisticsResponse)
  // @UseGuards(AdminGuard) // Uncomment when auth is implemented
  async getOrderStatistics(
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
  ): Promise<OrderStatisticsResponse> {
    try {
      const stats = await this.orderService.getStatistics(startDate, endDate);
      
      return {
        success: true,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        byStatus: stats.byStatus,
        byPaymentStatus: stats.byPaymentStatus,
      };
    } catch (error) {
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
}
