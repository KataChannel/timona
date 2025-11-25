import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ProductStatus, ProductUnit } from '../types/product.type';

// Create Product Input
@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  shortDesc?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  originalPrice?: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => Int, { defaultValue: 0 })
  stock: number;

  @Field(() => Int, { defaultValue: 0 })
  minStock: number;

  @Field(() => Int, { nullable: true })
  maxStock?: number;

  @Field(() => ProductUnit, { defaultValue: ProductUnit.KG })
  unit: ProductUnit;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  origin?: string;

  @Field(() => ProductStatus, { defaultValue: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Field(() => ID)
  categoryId: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  @Field({ defaultValue: false })
  isFeatured: boolean;

  @Field({ defaultValue: false })
  isNewArrival: boolean;

  @Field({ defaultValue: false })
  isBestSeller: boolean;

  @Field({ defaultValue: false })
  isOnSale: boolean;

  @Field(() => Int, { defaultValue: 0 })
  displayOrder: number;
}

// Update Product Input
@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDescription?: string; // Alias for shortDesc

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  barcode?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  minStock?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @Field(() => ProductUnit, { nullable: true })
  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  origin?: string;

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string; // Alias for thumbnail

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  attributes?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean; // Alias for isNewArrival

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

// Product Filters
@InputType()
export class ProductFiltersInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  isFeatured?: boolean;

  @Field({ nullable: true })
  isNewArrival?: boolean;

  @Field({ nullable: true })
  isBestSeller?: boolean;

  @Field({ nullable: true })
  isOnSale?: boolean;

  @Field({ nullable: true })
  inStock?: boolean;

  @Field({ nullable: true })
  origin?: string;

  @Field(() => [ProductUnit], { nullable: true })
  units?: ProductUnit[];
}

// Get Products Input
@InputType()
export class GetProductsInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field({ nullable: true, defaultValue: 'createdAt' })
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'desc' })
  sortOrder?: 'asc' | 'desc';

  @Field(() => ProductFiltersInput, { nullable: true })
  filters?: ProductFiltersInput;
}

// Product Image Input
@InputType()
export class CreateProductImageInput {
  @Field(() => ID)
  productId: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  alt?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ defaultValue: false })
  isPrimary: boolean;

  @Field(() => Int, { defaultValue: 0 })
  order: number;
}

// Product Variant Input
@InputType()
export class CreateProductVariantInput {
  @Field(() => ID)
  productId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int, { defaultValue: 0 })
  stock: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field(() => Int, { defaultValue: 0 })
  order: number;
}

@InputType()
export class UpdateProductVariantInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  order?: number;
}
