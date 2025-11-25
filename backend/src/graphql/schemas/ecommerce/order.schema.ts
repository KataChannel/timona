import { Field, ObjectType, InputType, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsOptional, IsString, IsNotEmpty, IsEnum } from 'class-validator';

/**
 * Order GraphQL Schema
 * 
 * Complete order management system với:
 * - Guest và User orders
 * - Status workflow
 * - Payment integration
 * - Shipping tracking
 * - Order history
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKAGING = 'PACKAGING',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
  PICKUP = 'PICKUP',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
registerEnumType(ShippingMethod, { name: 'ShippingMethod' });

// ============================================================================
// OBJECT TYPES
// ============================================================================

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field()
  productName: string;

  @Field({ nullable: true })
  variantName?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number; // Unit price

  @Field(() => Float)
  subtotal: number; // quantity * price

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class OrderTrackingEventType {
  @Field(() => ID)
  id: string;

  @Field()
  status: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  eventTime: Date;
}

@ObjectType()
export class OrderTrackingType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  carrier?: string;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  trackingUrl?: string;

  @Field({ nullable: true })
  estimatedDelivery?: Date;

  @Field({ nullable: true })
  actualDelivery?: Date;

  @Field(() => [OrderTrackingEventType])
  events: OrderTrackingEventType[];
}

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  gatewayTransactionId?: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  // Pricing
  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  shippingFee: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  // Shipping
  @Field(() => ShippingMethod)
  shippingMethod: ShippingMethod;

  @Field(() => GraphQLJSON)
  shippingAddress: any;

  @Field(() => GraphQLJSON, { nullable: true })
  billingAddress?: any;

  @Field(() => OrderTrackingType, { nullable: true })
  tracking?: OrderTrackingType;

  // Payment
  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => PaymentType, { nullable: true })
  payment?: PaymentType;

  @Field({ nullable: true })
  customerNote?: string;

  @Field({ nullable: true })
  internalNote?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  // Timestamps
  @Field({ nullable: true })
  confirmedAt?: Date;

  @Field({ nullable: true })
  shippedAt?: Date;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

@InputType()
export class ShippingAddressInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  city: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  district: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  ward: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

@InputType()
export class CreateOrderInput {
  // Customer info (for guest orders)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  // Session ID for guest cart
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  // Order items (if not from cart)
  @Field(() => [OrderItemInput], { nullable: true })
  @IsOptional()
  items?: OrderItemInput[];

  // Or create from cart
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  cartId?: string;

  @Field(() => ShippingAddressInput)
  @IsNotEmpty()
  shippingAddress: ShippingAddressInput;

  @Field(() => ShippingAddressInput, { nullable: true })
  @IsOptional()
  billingAddress?: ShippingAddressInput;

  @Field(() => ShippingMethod, { defaultValue: ShippingMethod.STANDARD })
  @IsEnum(ShippingMethod)
  shippingMethod: ShippingMethod;

  @Field(() => PaymentMethod, { defaultValue: PaymentMethod.CASH_ON_DELIVERY })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => ID)
  orderId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field({ nullable: true })
  internalNote?: string;
}

@InputType()
export class CancelOrderInput {
  @Field(() => ID)
  orderId: string;

  @Field({ nullable: true })
  reason?: string;
}

@InputType()
export class OrderFilterInput {
  @Field(() => [OrderStatus], { nullable: true })
  statuses?: OrderStatus[];

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => [PaymentStatus], { nullable: true })
  paymentStatuses?: PaymentStatus[];

  @Field(() => PaymentStatus, { nullable: true })
  paymentStatus?: PaymentStatus;

  @Field({ nullable: true })
  dateFrom?: string;

  @Field({ nullable: true })
  dateTo?: string;

  @Field({ nullable: true })
  searchQuery?: string; // Order number, customer name/email/phone

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  take?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

@ObjectType()
export class CreateOrderResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => OrderType, { nullable: true })
  order?: OrderType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class UpdateOrderResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => OrderType, { nullable: true })
  order?: OrderType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class CancelOrderResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => OrderType, { nullable: true })
  order?: OrderType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class OrderListResponse {
  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class OrderStatisticsResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => GraphQLJSON)
  byStatus: any;

  @Field(() => GraphQLJSON)
  byPaymentStatus: any;
}
