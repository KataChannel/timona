import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ProductType, PaginatedProducts } from '../types/product.type';
import { CategoryType } from '../types/category.type';
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsInput,
  CreateProductImageInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from '../inputs/product.input';

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  // Queries
  @Query(() => PaginatedProducts, { name: 'products' })
  async getProducts(@Args('input', { nullable: true }) input?: GetProductsInput) {
    return this.productService.getProducts(input || {});
  }

  @Query(() => ProductType, { name: 'product' })
  async getProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.getProductById(id);
  }

  @Query(() => ProductType, { name: 'productBySlug' })
  async getProductBySlug(@Args('slug') slug: string) {
    return this.productService.getProductBySlug(slug);
  }

  @Query(() => PaginatedProducts, { name: 'productsByCategory' })
  async getProductsByCategory(
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @Args('input', { nullable: true }) input?: GetProductsInput,
  ) {
    return this.productService.getProductsByCategory(categoryId, input);
  }

  // Mutations
  @Mutation(() => ProductType, { name: 'createProduct' })
  @UseGuards(JwtAuthGuard)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productService.createProduct(input);
  }

  @Mutation(() => ProductType, { name: 'updateProduct' })
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Args('input') input: UpdateProductInput) {
    console.log('UpdateProduct resolver - input received:', input);
    console.log('UpdateProduct resolver - input.id:', input?.id);
    console.log('UpdateProduct resolver - input type:', typeof input);
    console.log('UpdateProduct resolver - input constructor:', input?.constructor?.name);
    console.log('UpdateProduct resolver - input keys:', Object.keys(input || {}));
    console.log('UpdateProduct resolver - JSON:', JSON.stringify(input, null, 2));
    return this.productService.updateProduct(input);
  }

  @Mutation(() => ProductType, { name: 'deleteProduct' })
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.deleteProduct(id);
  }

  @Mutation(() => ProductType, { name: 'addProductImage' })
  @UseGuards(JwtAuthGuard)
  async addProductImage(@Args('input') input: CreateProductImageInput) {
    await this.productService.addProductImage(input);
    return this.productService.getProductById(input.productId);
  }

  @Mutation(() => Boolean, { name: 'deleteProductImage' })
  @UseGuards(JwtAuthGuard)
  async deleteProductImage(@Args('id', { type: () => ID }) id: string) {
    await this.productService.deleteProductImage(id);
    return true;
  }

  @Mutation(() => ProductType, { name: 'addProductVariant' })
  @UseGuards(JwtAuthGuard)
  async addProductVariant(@Args('input') input: CreateProductVariantInput) {
    await this.productService.addProductVariant(input);
    return this.productService.getProductById(input.productId);
  }

  @Mutation(() => ProductType, { name: 'updateProductVariant' })
  @UseGuards(JwtAuthGuard)
  async updateProductVariant(@Args('input') input: UpdateProductVariantInput) {
    const variant = await this.productService.updateProductVariant(input);
    return this.productService.getProductById(variant.productId);
  }

  @Mutation(() => Boolean, { name: 'deleteProductVariant' })
  @UseGuards(JwtAuthGuard)
  async deleteProductVariant(@Args('id', { type: () => ID }) id: string) {
    await this.productService.deleteProductVariant(id);
    return true;
  }

  @Mutation(() => ProductType, { name: 'updateProductStock' })
  @UseGuards(JwtAuthGuard)
  async updateProductStock(
    @Args('id', { type: () => ID }) id: string,
    @Args('quantity', { type: () => Number }) quantity: number,
  ) {
    return this.productService.updateStock(id, quantity);
  }

  // Field Resolvers
  @ResolveField(() => CategoryType)
  async category(@Parent() product: ProductType) {
    return this.categoryService.getCategoryById(product.categoryId);
  }

  @ResolveField(() => Number, { nullable: true })
  async discountPercentage(@Parent() product: ProductType) {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }
    return ((product.originalPrice - product.price) / product.originalPrice) * 100;
  }

  @ResolveField(() => Number, { nullable: true })
  async profitMargin(@Parent() product: ProductType) {
    if (!product.costPrice || product.costPrice >= product.price) {
      return null;
    }
    return ((product.price - product.costPrice) / product.price) * 100;
  }

  // Alias field resolvers
  @ResolveField(() => String, { nullable: true })
  async shortDescription(@Parent() product: any) {
    return product.shortDesc || null;
  }

  @ResolveField(() => String, { nullable: true })
  async imageUrl(@Parent() product: any) {
    return product.thumbnail || null;
  }

  @ResolveField(() => Boolean, { nullable: true })
  async isNew(@Parent() product: any) {
    return product.isNewArrival || false;
  }

  // Attributes field resolvers
  @ResolveField(() => Boolean, { nullable: true })
  async isOrganic(@Parent() product: any) {
    return product.attributes?.isOrganic || null;
  }

  @ResolveField(() => String, { nullable: true })
  async dimensions(@Parent() product: any) {
    return product.attributes?.dimensions || null;
  }

  @ResolveField(() => String, { nullable: true })
  async manufacturer(@Parent() product: any) {
    return product.attributes?.manufacturer || null;
  }
}
