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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductService = class ProductService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(input) {
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
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
                variants: { orderBy: { order: 'asc' } },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async getProductBySlug(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
                variants: { orderBy: { order: 'asc' } },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with slug ${slug} not found`);
        }
        return product;
    }
    async getProductsByCategory(categoryId, input) {
        const filters = { ...input?.filters, categoryId };
        return this.getProducts({ ...input, filters });
    }
    async createProduct(input) {
        const existingBySlug = await this.prisma.product.findUnique({
            where: { slug: input.slug },
        });
        if (existingBySlug) {
            throw new common_1.BadRequestException(`Product with slug ${input.slug} already exists`);
        }
        if (input.sku) {
            const existingBySku = await this.prisma.product.findUnique({
                where: { sku: input.sku },
            });
            if (existingBySku) {
                throw new common_1.BadRequestException(`Product with SKU ${input.sku} already exists`);
            }
        }
        if (input.barcode && input.barcode.trim() !== '') {
            const existingByBarcode = await this.prisma.product.findUnique({
                where: { barcode: input.barcode },
            });
            if (existingByBarcode) {
                throw new common_1.BadRequestException(`Product with barcode ${input.barcode} already exists`);
            }
        }
        else if (input.barcode === '') {
            input.barcode = null;
        }
        const category = await this.prisma.category.findUnique({
            where: { id: input.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${input.categoryId} not found`);
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
    async updateProduct(input) {
        console.log('ProductService.updateProduct - raw input:', input);
        console.log('ProductService.updateProduct - input.id:', input.id);
        console.log('ProductService.updateProduct - input type:', typeof input);
        console.log('ProductService.updateProduct - input keys:', Object.keys(input));
        if (!input?.id) {
            console.error('ProductService.updateProduct - MISSING ID!', { input });
            throw new common_1.BadRequestException('Product ID is required for update');
        }
        const id = input.id;
        const { id: _id, shortDescription, imageUrl, isNew, isOrganic, dimensions, manufacturer, ...data } = input;
        console.log('ProductService.updateProduct - extracted id:', id);
        console.log('ProductService.updateProduct - data to update:', data);
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (shortDescription !== undefined) {
            data.shortDesc = shortDescription;
        }
        if (imageUrl !== undefined) {
            data.thumbnail = imageUrl;
        }
        if (isNew !== undefined) {
            data.isNewArrival = isNew;
        }
        const extraAttributes = {};
        if (isOrganic !== undefined)
            extraAttributes.isOrganic = isOrganic;
        if (dimensions !== undefined)
            extraAttributes.dimensions = dimensions;
        if (manufacturer !== undefined)
            extraAttributes.manufacturer = manufacturer;
        if (Object.keys(extraAttributes).length > 0) {
            const currentAttributes = product.attributes || {};
            data.attributes = {
                ...(typeof currentAttributes === 'object' ? currentAttributes : {}),
                ...extraAttributes,
            };
        }
        if (data.slug && data.slug !== product.slug) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { slug: data.slug },
            });
            if (existingProduct) {
                throw new common_1.BadRequestException(`Product with slug ${data.slug} already exists`);
            }
        }
        if (data.sku && data.sku !== product.sku) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { sku: data.sku },
            });
            if (existingProduct) {
                throw new common_1.BadRequestException(`Product with SKU ${data.sku} already exists`);
            }
        }
        if (data.barcode !== undefined && data.barcode !== product.barcode) {
            if (data.barcode && data.barcode.trim() !== '') {
                const existingProduct = await this.prisma.product.findUnique({
                    where: { barcode: data.barcode },
                });
                if (existingProduct) {
                    throw new common_1.BadRequestException(`Product with barcode ${data.barcode} already exists`);
                }
            }
            else {
                data.barcode = null;
            }
        }
        if (data.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Category with ID ${data.categoryId} not found`);
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
    async deleteProduct(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        await Promise.all([
            this.prisma.productImage.deleteMany({ where: { productId: id } }),
            this.prisma.productVariant.deleteMany({ where: { productId: id } }),
        ]);
        return this.prisma.product.delete({ where: { id } });
    }
    async addProductImage(input) {
        const product = await this.prisma.product.findUnique({
            where: { id: input.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${input.productId} not found`);
        }
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
    async deleteProductImage(id) {
        const image = await this.prisma.productImage.findUnique({ where: { id } });
        if (!image) {
            throw new common_1.NotFoundException(`Product image with ID ${id} not found`);
        }
        return this.prisma.productImage.delete({ where: { id } });
    }
    async addProductVariant(input) {
        const product = await this.prisma.product.findUnique({
            where: { id: input.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${input.productId} not found`);
        }
        return this.prisma.productVariant.create({
            data: input,
        });
    }
    async updateProductVariant(input) {
        const { id, ...data } = input;
        const variant = await this.prisma.productVariant.findUnique({ where: { id } });
        if (!variant) {
            throw new common_1.NotFoundException(`Product variant with ID ${id} not found`);
        }
        return this.prisma.productVariant.update({
            where: { id },
            data,
        });
    }
    async deleteProductVariant(id) {
        const variant = await this.prisma.productVariant.findUnique({ where: { id } });
        if (!variant) {
            throw new common_1.NotFoundException(`Product variant with ID ${id} not found`);
        }
        return this.prisma.productVariant.delete({ where: { id } });
    }
    async updateStock(id, quantity) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        const newStock = product.stock + quantity;
        if (newStock < 0) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        return this.prisma.product.update({
            where: { id },
            data: { stock: newStock },
        });
    }
    buildWhereClause(filters) {
        if (!filters) {
            console.log('[ProductService] No filters provided');
            return {};
        }
        const where = {};
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
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map