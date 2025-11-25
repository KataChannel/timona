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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateCartResponse = exports.MergeCartsResponse = exports.ApplyCouponResponse = exports.ClearCartResponse = exports.RemoveFromCartResponse = exports.UpdateCartResponse = exports.AddToCartResponse = exports.MergeCartsInput = exports.ApplyCouponInput = exports.RemoveFromCartInput = exports.UpdateCartItemInput = exports.AddToCartInput = exports.CartType = exports.CartItemType = exports.ProductVariantSummaryType = exports.ProductSummaryType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const class_validator_1 = require("class-validator");
let ProductSummaryType = class ProductSummaryType {
};
exports.ProductSummaryType = ProductSummaryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProductSummaryType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSummaryType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSummaryType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductSummaryType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ProductSummaryType.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductSummaryType.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductSummaryType.prototype, "status", void 0);
exports.ProductSummaryType = ProductSummaryType = __decorate([
    (0, graphql_1.ObjectType)()
], ProductSummaryType);
let ProductVariantSummaryType = class ProductVariantSummaryType {
};
exports.ProductVariantSummaryType = ProductVariantSummaryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ProductVariantSummaryType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ProductVariantSummaryType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductVariantSummaryType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductVariantSummaryType.prototype, "stock", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ProductVariantSummaryType.prototype, "isActive", void 0);
exports.ProductVariantSummaryType = ProductVariantSummaryType = __decorate([
    (0, graphql_1.ObjectType)()
], ProductVariantSummaryType);
let CartItemType = class CartItemType {
};
exports.CartItemType = CartItemType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CartItemType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CartItemType.prototype, "cartId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CartItemType.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProductSummaryType),
    __metadata("design:type", ProductSummaryType)
], CartItemType.prototype, "product", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CartItemType.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => ProductVariantSummaryType, { nullable: true }),
    __metadata("design:type", ProductVariantSummaryType)
], CartItemType.prototype, "variant", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CartItemType.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartItemType.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartItemType.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CartItemType.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CartItemType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CartItemType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CartItemType.prototype, "isAvailable", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CartItemType.prototype, "isPriceChanged", void 0);
exports.CartItemType = CartItemType = __decorate([
    (0, graphql_1.ObjectType)()
], CartItemType);
let CartType = class CartType {
};
exports.CartType = CartType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CartType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CartType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CartType.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CartItemType]),
    __metadata("design:type", Array)
], CartType.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CartType.prototype, "itemCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartType.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartType.prototype, "shippingFee", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartType.prototype, "tax", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartType.prototype, "discount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CartType.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CartType.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CartType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CartType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CartType.prototype, "expiresAt", void 0);
exports.CartType = CartType = __decorate([
    (0, graphql_1.ObjectType)()
], CartType);
let AddToCartInput = class AddToCartInput {
};
exports.AddToCartInput = AddToCartInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Product ID is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddToCartInput.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddToCartInput.prototype, "variantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'Quantity must be at least 1' }),
    __metadata("design:type", Number)
], AddToCartInput.prototype, "quantity", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddToCartInput.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AddToCartInput.prototype, "metadata", void 0);
exports.AddToCartInput = AddToCartInput = __decorate([
    (0, graphql_1.InputType)()
], AddToCartInput);
let UpdateCartItemInput = class UpdateCartItemInput {
};
exports.UpdateCartItemInput = UpdateCartItemInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UpdateCartItemInput.prototype, "itemId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], UpdateCartItemInput.prototype, "quantity", void 0);
exports.UpdateCartItemInput = UpdateCartItemInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCartItemInput);
let RemoveFromCartInput = class RemoveFromCartInput {
};
exports.RemoveFromCartInput = RemoveFromCartInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RemoveFromCartInput.prototype, "itemId", void 0);
exports.RemoveFromCartInput = RemoveFromCartInput = __decorate([
    (0, graphql_1.InputType)()
], RemoveFromCartInput);
let ApplyCouponInput = class ApplyCouponInput {
};
exports.ApplyCouponInput = ApplyCouponInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], ApplyCouponInput.prototype, "cartId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ApplyCouponInput.prototype, "couponCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ApplyCouponInput.prototype, "sessionId", void 0);
exports.ApplyCouponInput = ApplyCouponInput = __decorate([
    (0, graphql_1.InputType)()
], ApplyCouponInput);
let MergeCartsInput = class MergeCartsInput {
};
exports.MergeCartsInput = MergeCartsInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MergeCartsInput.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MergeCartsInput.prototype, "userId", void 0);
exports.MergeCartsInput = MergeCartsInput = __decorate([
    (0, graphql_1.InputType)()
], MergeCartsInput);
let AddToCartResponse = class AddToCartResponse {
};
exports.AddToCartResponse = AddToCartResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AddToCartResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddToCartResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], AddToCartResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AddToCartResponse.prototype, "errors", void 0);
exports.AddToCartResponse = AddToCartResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AddToCartResponse);
let UpdateCartResponse = class UpdateCartResponse {
};
exports.UpdateCartResponse = UpdateCartResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UpdateCartResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCartResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], UpdateCartResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateCartResponse.prototype, "errors", void 0);
exports.UpdateCartResponse = UpdateCartResponse = __decorate([
    (0, graphql_1.ObjectType)()
], UpdateCartResponse);
let RemoveFromCartResponse = class RemoveFromCartResponse {
};
exports.RemoveFromCartResponse = RemoveFromCartResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RemoveFromCartResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], RemoveFromCartResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], RemoveFromCartResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], RemoveFromCartResponse.prototype, "errors", void 0);
exports.RemoveFromCartResponse = RemoveFromCartResponse = __decorate([
    (0, graphql_1.ObjectType)()
], RemoveFromCartResponse);
let ClearCartResponse = class ClearCartResponse {
};
exports.ClearCartResponse = ClearCartResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ClearCartResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ClearCartResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], ClearCartResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ClearCartResponse.prototype, "errors", void 0);
exports.ClearCartResponse = ClearCartResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ClearCartResponse);
let ApplyCouponResponse = class ApplyCouponResponse {
};
exports.ApplyCouponResponse = ApplyCouponResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ApplyCouponResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ApplyCouponResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], ApplyCouponResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ApplyCouponResponse.prototype, "discountAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ApplyCouponResponse.prototype, "errors", void 0);
exports.ApplyCouponResponse = ApplyCouponResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ApplyCouponResponse);
let MergeCartsResponse = class MergeCartsResponse {
};
exports.MergeCartsResponse = MergeCartsResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MergeCartsResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MergeCartsResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], MergeCartsResponse.prototype, "cart", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MergeCartsResponse.prototype, "errors", void 0);
exports.MergeCartsResponse = MergeCartsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], MergeCartsResponse);
let ValidateCartResponse = class ValidateCartResponse {
};
exports.ValidateCartResponse = ValidateCartResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ValidateCartResponse.prototype, "isValid", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ValidateCartResponse.prototype, "errors", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ValidateCartResponse.prototype, "warnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => CartType, { nullable: true }),
    __metadata("design:type", CartType)
], ValidateCartResponse.prototype, "cart", void 0);
exports.ValidateCartResponse = ValidateCartResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ValidateCartResponse);
//# sourceMappingURL=cart.schema.js.map