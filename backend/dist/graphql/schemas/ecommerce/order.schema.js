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
exports.OrderStatisticsResponse = exports.OrderListResponse = exports.CancelOrderResponse = exports.UpdateOrderResponse = exports.CreateOrderResponse = exports.OrderFilterInput = exports.CancelOrderInput = exports.UpdateOrderStatusInput = exports.OrderItemInput = exports.CreateOrderInput = exports.ShippingAddressInput = exports.OrderType = exports.PaymentType = exports.OrderTrackingType = exports.OrderTrackingEventType = exports.OrderItemType = exports.ShippingMethod = exports.PaymentMethod = exports.PaymentStatus = exports.OrderStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["PACKAGING"] = "PACKAGING";
    OrderStatus["READY_TO_SHIP"] = "READY_TO_SHIP";
    OrderStatus["SHIPPING"] = "SHIPPING";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["MOMO"] = "MOMO";
    PaymentMethod["ZALOPAY"] = "ZALOPAY";
    PaymentMethod["VNPAY"] = "VNPAY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ShippingMethod;
(function (ShippingMethod) {
    ShippingMethod["STANDARD"] = "STANDARD";
    ShippingMethod["EXPRESS"] = "EXPRESS";
    ShippingMethod["SAME_DAY"] = "SAME_DAY";
    ShippingMethod["PICKUP"] = "PICKUP";
})(ShippingMethod || (exports.ShippingMethod = ShippingMethod = {}));
(0, graphql_1.registerEnumType)(OrderStatus, { name: 'OrderStatus' });
(0, graphql_1.registerEnumType)(PaymentStatus, { name: 'PaymentStatus' });
(0, graphql_1.registerEnumType)(PaymentMethod, { name: 'PaymentMethod' });
(0, graphql_1.registerEnumType)(ShippingMethod, { name: 'ShippingMethod' });
let OrderItemType = class OrderItemType {
};
exports.OrderItemType = OrderItemType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemType.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], OrderItemType.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderItemType.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderItemType.prototype, "variantName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderItemType.prototype, "sku", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderItemType.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderItemType.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderItemType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderItemType.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], OrderItemType.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OrderItemType.prototype, "createdAt", void 0);
exports.OrderItemType = OrderItemType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderItemType);
let OrderTrackingEventType = class OrderTrackingEventType {
};
exports.OrderTrackingEventType = OrderTrackingEventType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderTrackingEventType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderTrackingEventType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderTrackingEventType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderTrackingEventType.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OrderTrackingEventType.prototype, "eventTime", void 0);
exports.OrderTrackingEventType = OrderTrackingEventType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderTrackingEventType);
let OrderTrackingType = class OrderTrackingType {
};
exports.OrderTrackingType = OrderTrackingType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "carrier", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "trackingNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderTrackingType.prototype, "trackingUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderTrackingType.prototype, "estimatedDelivery", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderTrackingType.prototype, "actualDelivery", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderTrackingEventType]),
    __metadata("design:type", Array)
], OrderTrackingType.prototype, "events", void 0);
exports.OrderTrackingType = OrderTrackingType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderTrackingType);
let PaymentType = class PaymentType {
};
exports.PaymentType = PaymentType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], PaymentType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PaymentType.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PaymentType.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentMethod),
    __metadata("design:type", String)
], PaymentType.prototype, "method", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentStatus),
    __metadata("design:type", String)
], PaymentType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], PaymentType.prototype, "gatewayTransactionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], PaymentType.prototype, "paidAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], PaymentType.prototype, "createdAt", void 0);
exports.PaymentType = PaymentType = __decorate([
    (0, graphql_1.ObjectType)()
], PaymentType);
let OrderType = class OrderType {
};
exports.OrderType = OrderType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderType.prototype, "orderNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "guestEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "guestPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "guestName", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStatus),
    __metadata("design:type", String)
], OrderType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentStatus),
    __metadata("design:type", String)
], OrderType.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderItemType]),
    __metadata("design:type", Array)
], OrderType.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderType.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderType.prototype, "shippingFee", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderType.prototype, "tax", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderType.prototype, "discount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShippingMethod),
    __metadata("design:type", String)
], OrderType.prototype, "shippingMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], OrderType.prototype, "shippingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], OrderType.prototype, "billingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderTrackingType, { nullable: true }),
    __metadata("design:type", OrderTrackingType)
], OrderType.prototype, "tracking", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentMethod),
    __metadata("design:type", String)
], OrderType.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentType, { nullable: true }),
    __metadata("design:type", PaymentType)
], OrderType.prototype, "payment", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "customerNote", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderType.prototype, "internalNote", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], OrderType.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderType.prototype, "confirmedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderType.prototype, "shippedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderType.prototype, "deliveredAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OrderType.prototype, "cancelledAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OrderType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OrderType.prototype, "updatedAt", void 0);
exports.OrderType = OrderType = __decorate([
    (0, graphql_1.ObjectType)()
], OrderType);
let ShippingAddressInput = class ShippingAddressInput {
};
exports.ShippingAddressInput = ShippingAddressInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "district", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "ward", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingAddressInput.prototype, "zipCode", void 0);
exports.ShippingAddressInput = ShippingAddressInput = __decorate([
    (0, graphql_1.InputType)()
], ShippingAddressInput);
let CreateOrderInput = class CreateOrderInput {
};
exports.CreateOrderInput = CreateOrderInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "guestEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "guestPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "guestName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderItemInput], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateOrderInput.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "cartId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShippingAddressInput),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", ShippingAddressInput)
], CreateOrderInput.prototype, "shippingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShippingAddressInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ShippingAddressInput)
], CreateOrderInput.prototype, "billingAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => ShippingMethod, { defaultValue: ShippingMethod.STANDARD }),
    (0, class_validator_1.IsEnum)(ShippingMethod),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "shippingMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentMethod, { defaultValue: PaymentMethod.CASH_ON_DELIVERY }),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderInput.prototype, "customerNote", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateOrderInput.prototype, "metadata", void 0);
exports.CreateOrderInput = CreateOrderInput = __decorate([
    (0, graphql_1.InputType)()
], CreateOrderInput);
let OrderItemInput = class OrderItemInput {
};
exports.OrderItemInput = OrderItemInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderItemInput.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], OrderItemInput.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderItemInput.prototype, "quantity", void 0);
exports.OrderItemInput = OrderItemInput = __decorate([
    (0, graphql_1.InputType)()
], OrderItemInput);
let UpdateOrderStatusInput = class UpdateOrderStatusInput {
};
exports.UpdateOrderStatusInput = UpdateOrderStatusInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStatus),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "internalNote", void 0);
exports.UpdateOrderStatusInput = UpdateOrderStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateOrderStatusInput);
let CancelOrderInput = class CancelOrderInput {
};
exports.CancelOrderInput = CancelOrderInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CancelOrderInput.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CancelOrderInput.prototype, "reason", void 0);
exports.CancelOrderInput = CancelOrderInput = __decorate([
    (0, graphql_1.InputType)()
], CancelOrderInput);
let OrderFilterInput = class OrderFilterInput {
};
exports.OrderFilterInput = OrderFilterInput;
__decorate([
    (0, graphql_1.Field)(() => [OrderStatus], { nullable: true }),
    __metadata("design:type", Array)
], OrderFilterInput.prototype, "statuses", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStatus, { nullable: true }),
    __metadata("design:type", String)
], OrderFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PaymentStatus], { nullable: true }),
    __metadata("design:type", Array)
], OrderFilterInput.prototype, "paymentStatuses", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaymentStatus, { nullable: true }),
    __metadata("design:type", String)
], OrderFilterInput.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFilterInput.prototype, "dateFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFilterInput.prototype, "dateTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderFilterInput.prototype, "searchQuery", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    __metadata("design:type", Number)
], OrderFilterInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    __metadata("design:type", Number)
], OrderFilterInput.prototype, "take", void 0);
exports.OrderFilterInput = OrderFilterInput = __decorate([
    (0, graphql_1.InputType)()
], OrderFilterInput);
let CreateOrderResponse = class CreateOrderResponse {
};
exports.CreateOrderResponse = CreateOrderResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CreateOrderResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateOrderResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderType, { nullable: true }),
    __metadata("design:type", OrderType)
], CreateOrderResponse.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateOrderResponse.prototype, "errors", void 0);
exports.CreateOrderResponse = CreateOrderResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CreateOrderResponse);
let UpdateOrderResponse = class UpdateOrderResponse {
};
exports.UpdateOrderResponse = UpdateOrderResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UpdateOrderResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateOrderResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderType, { nullable: true }),
    __metadata("design:type", OrderType)
], UpdateOrderResponse.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateOrderResponse.prototype, "errors", void 0);
exports.UpdateOrderResponse = UpdateOrderResponse = __decorate([
    (0, graphql_1.ObjectType)()
], UpdateOrderResponse);
let CancelOrderResponse = class CancelOrderResponse {
};
exports.CancelOrderResponse = CancelOrderResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CancelOrderResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CancelOrderResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderType, { nullable: true }),
    __metadata("design:type", OrderType)
], CancelOrderResponse.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CancelOrderResponse.prototype, "errors", void 0);
exports.CancelOrderResponse = CancelOrderResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CancelOrderResponse);
let OrderListResponse = class OrderListResponse {
};
exports.OrderListResponse = OrderListResponse;
__decorate([
    (0, graphql_1.Field)(() => [OrderType]),
    __metadata("design:type", Array)
], OrderListResponse.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], OrderListResponse.prototype, "hasMore", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderListResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], OrderListResponse.prototype, "errors", void 0);
exports.OrderListResponse = OrderListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], OrderListResponse);
let OrderStatisticsResponse = class OrderStatisticsResponse {
};
exports.OrderStatisticsResponse = OrderStatisticsResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], OrderStatisticsResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OrderStatisticsResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStatisticsResponse.prototype, "totalOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderStatisticsResponse.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], OrderStatisticsResponse.prototype, "byStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], OrderStatisticsResponse.prototype, "byPaymentStatus", void 0);
exports.OrderStatisticsResponse = OrderStatisticsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], OrderStatisticsResponse);
//# sourceMappingURL=order.schema.js.map