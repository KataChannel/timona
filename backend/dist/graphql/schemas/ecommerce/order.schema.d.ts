export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    PACKAGING = "PACKAGING",
    READY_TO_SHIP = "READY_TO_SHIP",
    SHIPPING = "SHIPPING",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export declare enum PaymentMethod {
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    BANK_TRANSFER = "BANK_TRANSFER",
    CREDIT_CARD = "CREDIT_CARD",
    MOMO = "MOMO",
    ZALOPAY = "ZALOPAY",
    VNPAY = "VNPAY"
}
export declare enum ShippingMethod {
    STANDARD = "STANDARD",
    EXPRESS = "EXPRESS",
    SAME_DAY = "SAME_DAY",
    PICKUP = "PICKUP"
}
export declare class OrderItemType {
    id: string;
    orderId: string;
    productId?: string;
    productName: string;
    variantName?: string;
    sku?: string;
    thumbnail?: string;
    quantity: number;
    price: number;
    subtotal: number;
    metadata?: any;
    createdAt: Date;
}
export declare class OrderTrackingEventType {
    id: string;
    status: string;
    description: string;
    location?: string;
    eventTime: Date;
}
export declare class OrderTrackingType {
    id: string;
    orderId: string;
    status: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    events: OrderTrackingEventType[];
}
export declare class PaymentType {
    id: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    gatewayTransactionId?: string;
    paidAt?: Date;
    createdAt: Date;
}
export declare class OrderType {
    id: string;
    orderNumber: string;
    userId?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestName?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    items: OrderItemType[];
    subtotal: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
    shippingMethod: ShippingMethod;
    shippingAddress: any;
    billingAddress?: any;
    tracking?: OrderTrackingType;
    paymentMethod: PaymentMethod;
    payment?: PaymentType;
    customerNote?: string;
    internalNote?: string;
    metadata?: any;
    confirmedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ShippingAddressInput {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    zipCode?: string;
}
export declare class CreateOrderInput {
    guestEmail?: string;
    guestPhone?: string;
    guestName?: string;
    sessionId?: string;
    items?: OrderItemInput[];
    cartId?: string;
    shippingAddress: ShippingAddressInput;
    billingAddress?: ShippingAddressInput;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
    customerNote?: string;
    metadata?: any;
}
export declare class OrderItemInput {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class UpdateOrderStatusInput {
    orderId: string;
    status: OrderStatus;
    internalNote?: string;
}
export declare class CancelOrderInput {
    orderId: string;
    reason?: string;
}
export declare class OrderFilterInput {
    statuses?: OrderStatus[];
    status?: OrderStatus;
    paymentStatuses?: PaymentStatus[];
    paymentStatus?: PaymentStatus;
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;
    skip?: number;
    take?: number;
}
export declare class CreateOrderResponse {
    success: boolean;
    message?: string;
    order?: OrderType;
    errors?: string[];
}
export declare class UpdateOrderResponse {
    success: boolean;
    message?: string;
    order?: OrderType;
    errors?: string[];
}
export declare class CancelOrderResponse {
    success: boolean;
    message?: string;
    order?: OrderType;
    errors?: string[];
}
export declare class OrderListResponse {
    orders: OrderType[];
    total: number;
    hasMore: boolean;
    message?: string;
    errors?: string[];
}
export declare class OrderStatisticsResponse {
    success: boolean;
    message?: string;
    totalOrders: number;
    totalRevenue: number;
    byStatus: any;
    byPaymentStatus: any;
}
