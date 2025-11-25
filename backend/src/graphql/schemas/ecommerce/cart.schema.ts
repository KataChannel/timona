import { Field, ObjectType, InputType, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

/**
 * Cart GraphQL Schema
 * 
 * Comprehensive shopping cart system với:
 * - Session-based và User-based carts
 * - Real-time stock validation
 * - Price snapshot
 * - Coupon support
 */

// ============================================================================
// OBJECT TYPES
// ============================================================================

// Define ProductSummaryType and ProductVariantSummaryType first to avoid circular dependency
@ObjectType()
export class ProductSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int)
  stock: number;

  @Field()
  status: string;
}

@ObjectType()
export class ProductVariantSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class CartItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  cartId: string;

  @Field(() => ID)
  productId: string;

  @Field(() => ProductSummaryType)
  product: ProductSummaryType;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ProductVariantSummaryType, { nullable: true })
  variant?: ProductVariantSummaryType;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number; // Price snapshot at time of adding

  @Field(() => Float)
  subtotal: number; // quantity * price

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any; // Gift message, special instructions, etc.

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Computed fields
  @Field(() => Boolean)
  isAvailable: boolean; // Stock check

  @Field(() => Boolean)
  isPriceChanged: boolean; // Price changed since adding
}

@ObjectType()
export class CartType {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  sessionId?: string;

  @Field(() => [CartItemType])
  items: CartItemType[];

  @Field(() => Int)
  itemCount: number; // Total number of items

  @Field(() => Float)
  subtotal: number; // Sum of all item subtotals

  @Field(() => Float)
  shippingFee: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number; // subtotal + shipping + tax - discount

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any; // Coupon code, notes, etc.

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  productId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  variantId?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string; // For guest carts

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  itemId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class RemoveFromCartInput {
  @Field(() => ID)
  itemId: string;
}

@InputType()
export class ApplyCouponInput {
  @Field(() => ID, { nullable: true })
  cartId?: string;

  @Field()
  couponCode: string;

  @Field(() => String, { nullable: true })
  sessionId?: string;
}

@InputType()
export class MergeCartsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  sessionId: string; // Guest cart session

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string; // Target user ID after login (optional - will use context if not provided)
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

@ObjectType()
export class AddToCartResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class UpdateCartResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class RemoveFromCartResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class ClearCartResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class ApplyCouponResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class MergeCartsResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartType, { nullable: true })
  cart?: CartType;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class ValidateCartResponse {
  @Field()
  isValid: boolean;

  @Field(() => [String])
  errors: string[];

  @Field(() => [String])
  warnings: string[];

  @Field(() => CartType, { nullable: true })
  cart?: CartType;
}
