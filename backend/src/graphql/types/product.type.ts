import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { CategoryType } from './category.type';

// Enums
export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export enum ProductUnit {
  KG = 'KG',
  G = 'G',
  BUNDLE = 'BUNDLE',
  PIECE = 'PIECE',
  BAG = 'BAG',
  BOX = 'BOX',
}

registerEnumType(ProductStatus, {
  name: 'ProductStatus',
  description: 'Trạng thái sản phẩm',
});

registerEnumType(ProductUnit, {
  name: 'ProductUnit',
  description: 'Đơn vị tính sản phẩm',
});

// ProductImage Type
@ObjectType()
export class ProductImageType {
  @Field(() => ID)
  id: string;

  @Field()
  productId: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  alt?: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  isPrimary: boolean;

  @Field(() => Int)
  order: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ProductVariant Type
@ObjectType()
export class ProductVariantType {
  @Field(() => ID)
  id: string;

  @Field()
  productId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  order: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Product Type
@ObjectType()
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  shortDesc?: string;

  @Field({ nullable: true })
  shortDescription?: string; // Alias for shortDesc

  // Pricing
  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  originalPrice?: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  // Inventory
  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field(() => Int)
  stock: number;

  @Field(() => Int)
  minStock: number;

  @Field(() => Int, { nullable: true })
  maxStock?: number;

  // Product details
  @Field(() => ProductUnit)
  unit: ProductUnit;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  origin?: string;

  @Field(() => ProductStatus)
  status: ProductStatus;

  // Category
  @Field()
  categoryId: string;

  @Field(() => CategoryType, { nullable: true })
  category?: CategoryType;

  // Images
  @Field(() => [ProductImageType], { nullable: true })
  images?: ProductImageType[];

  @Field({ nullable: true })
  thumbnail?: string;

  @Field({ nullable: true })
  imageUrl?: string; // Alias for thumbnail

  // Variants
  @Field(() => [ProductVariantType], { nullable: true })
  variants?: ProductVariantType[];

  // Attributes
  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  // SEO
  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  metaKeywords?: string;

  // Display & Features
  @Field()
  isFeatured: boolean;

  @Field()
  isNewArrival: boolean;

  @Field({ nullable: true })
  isNew?: boolean; // Alias for isNewArrival

  @Field()
  isBestSeller: boolean;

  @Field()
  isOnSale: boolean;

  @Field({ nullable: true })
  isOrganic?: boolean; // From attributes

  @Field({ nullable: true })
  dimensions?: string; // From attributes

  @Field({ nullable: true })
  manufacturer?: string; // From attributes

  @Field(() => Int)
  displayOrder: number;

  // Statistics
  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  soldCount: number;

  // Dates
  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;

  // Computed fields
  @Field(() => Float, { nullable: true })
  discountPercentage?: number;

  @Field(() => Float, { nullable: true })
  profitMargin?: number;
}

// Paginated Products
@ObjectType()
export class PaginatedProducts {
  @Field(() => [ProductType])
  items: ProductType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasMore: boolean;
}
