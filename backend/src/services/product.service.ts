import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsInput,
  ProductFiltersInput,
  CreateProductImageInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from '../graphql/inputs/product.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Get Products with pagination and filters
  async getProducts(input: GetProductsInput) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', filters } = input;
    const skip = (page - 1) * limit;

    console.log('[ProductService] getProducts input:', JSON.stringify(input, null, 2));
    const where = this.buildWhereClause(filters);
    console.log('[ProductService] where clause:', JSON.stringify(where, null, 2));

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  // Get single product by ID
  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  // Get product by slug
  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  // Get products by category
  async getProductsByCategory(categoryId: string, input?: GetProductsInput) {
    const filters = { ...input?.filters, categoryId };
    return this.getProducts({ ...input, filters });
  }

  // Create product
  async createProduct(input: CreateProductInput) {
    // Check if slug exists
    const existingBySlug = await this.prisma.product.findUnique({
      where: { slug: input.slug },
    });

    if (existingBySlug) {
      throw new BadRequestException(`Product with slug ${input.slug} already exists`);
    }

    // Check if SKU exists (if provided)
    if (input.sku) {
      const existingBySku = await this.prisma.product.findUnique({
        where: { sku: input.sku },
      });

      if (existingBySku) {
        throw new BadRequestException(`Product with SKU ${input.sku} already exists`);
      }
    }

    // Check if barcode exists (if provided and not empty)
    if (input.barcode && input.barcode.trim() !== '') {
      const existingByBarcode = await this.prisma.product.findUnique({
        where: { barcode: input.barcode },
      });

      if (existingByBarcode) {
        throw new BadRequestException(`Product with barcode ${input.barcode} already exists`);
      }
    } else if (input.barcode === '') {
      // Convert empty string to null to avoid unique constraint issues
      input.barcode = null;
    }

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${input.categoryId} not found`);
    }

    return this.prisma.product.create({
      data: {
        ...input,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
  }

  // Update product
  async updateProduct(input: UpdateProductInput) {
    console.log('ProductService.updateProduct - raw input:', input);
    console.log('ProductService.updateProduct - input.id:', input.id);
    console.log('ProductService.updateProduct - input type:', typeof input);
    console.log('ProductService.updateProduct - input keys:', Object.keys(input));
    
    // Validate ID first before destructuring
    if (!input?.id) {
      console.error('ProductService.updateProduct - MISSING ID!', { input });
      throw new BadRequestException('Product ID is required for update');
    }

    const id = input.id;
    const { 
      id: _id, 
      shortDescription, 
      imageUrl, 
      isNew,
      isOrganic,
      dimensions,
      manufacturer,
      ...data 
    } = input;

    console.log('ProductService.updateProduct - extracted id:', id);
    console.log('ProductService.updateProduct - data to update:', data);

    // Check if product exists
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Map aliases to correct field names
    if (shortDescription !== undefined) {
      data.shortDesc = shortDescription;
    }
    if (imageUrl !== undefined) {
      data.thumbnail = imageUrl;
    }
    if (isNew !== undefined) {
      data.isNewArrival = isNew;
    }

    // Handle extra fields in attributes
    const extraAttributes: any = {};
    if (isOrganic !== undefined) extraAttributes.isOrganic = isOrganic;
    if (dimensions !== undefined) extraAttributes.dimensions = dimensions;
    if (manufacturer !== undefined) extraAttributes.manufacturer = manufacturer;

    // Merge with existing attributes
    if (Object.keys(extraAttributes).length > 0) {
      const currentAttributes = product.attributes || {};
      data.attributes = {
        ...(typeof currentAttributes === 'object' ? currentAttributes : {}),
        ...extraAttributes,
      };
    }

    // Check if slug is being updated and if it's unique
    if (data.slug && data.slug !== product.slug) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingProduct) {
        throw new BadRequestException(`Product with slug ${data.slug} already exists`);
      }
    }

    // Check if SKU is being updated and if it's unique
    if (data.sku && data.sku !== product.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingProduct) {
        throw new BadRequestException(`Product with SKU ${data.sku} already exists`);
      }
    }

    // Check if barcode is being updated and if it's unique
    // Only validate if barcode is not empty string
    if (data.barcode !== undefined && data.barcode !== product.barcode) {
      if (data.barcode && data.barcode.trim() !== '') {
        // Only check uniqueness if barcode has a value
        const existingProduct = await this.prisma.product.findUnique({
          where: { barcode: data.barcode },
        });

        if (existingProduct) {
          throw new BadRequestException(`Product with barcode ${data.barcode} already exists`);
        }
      } else {
        // If barcode is empty string, set to null to avoid unique constraint
        data.barcode = null;
      }
    }

    // Check if category exists if being updated
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${data.categoryId} not found`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { order: 'asc' } },
      },
    });
  }

  // Delete product
  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete associated images and variants
    await Promise.all([
      this.prisma.productImage.deleteMany({ where: { productId: id } }),
      this.prisma.productVariant.deleteMany({ where: { productId: id } }),
    ]);

    return this.prisma.product.delete({ where: { id } });
  }

  // Product Images
  async addProductImage(input: CreateProductImageInput) {
    const product = await this.prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${input.productId} not found`);
    }

    // If this is primary, unset other primary images
    if (input.isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId: input.productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.productImage.create({
      data: input,
    });
  }

  async deleteProductImage(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Product image with ID ${id} not found`);
    }

    return this.prisma.productImage.delete({ where: { id } });
  }

  // Product Variants
  async addProductVariant(input: CreateProductVariantInput) {
    const product = await this.prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${input.productId} not found`);
    }

    return this.prisma.productVariant.create({
      data: input,
    });
  }

  async updateProductVariant(input: UpdateProductVariantInput) {
    const { id, ...data } = input;

    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    return this.prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  async deleteProductVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }

    return this.prisma.productVariant.delete({ where: { id } });
  }

  // Update stock
  async updateStock(id: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  // Helper method to build where clause from filters
  private buildWhereClause(filters?: ProductFiltersInput): Prisma.ProductWhereInput {
    if (!filters) {
      console.log('[ProductService] No filters provided');
      return {};
    }

    const where: Prisma.ProductWhereInput = {};

    // Only apply search filter if search string is not empty
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim();
      console.log('[ProductService] Search query:', searchTerm);
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.isNewArrival !== undefined) {
      where.isNewArrival = filters.isNewArrival;
    }

    if (filters.isBestSeller !== undefined) {
      where.isBestSeller = filters.isBestSeller;
    }

    if (filters.isOnSale !== undefined) {
      where.isOnSale = filters.isOnSale;
    }

    if (filters.inStock !== undefined) {
      where.stock = filters.inStock ? { gt: 0 } : { lte: 0 };
    }

    if (filters.origin) {
      where.origin = { contains: filters.origin, mode: 'insensitive' };
    }

    if (filters.units && filters.units.length > 0) {
      where.unit = { in: filters.units };
    }

    return where;
  }
}
