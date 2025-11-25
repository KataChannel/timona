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
exports.ProductNormalizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductNormalizationService = class ProductNormalizationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findSimilarProducts(searchText, threshold = 0.3) {
        if (!searchText || searchText.trim() === '') {
            return [];
        }
        const result = await this.prisma.$queryRaw `
      SELECT * FROM get_similar_products(${searchText}, ${threshold}::real)
    `;
        return result;
    }
    async findCanonicalName(productName, threshold = 0.6) {
        if (!productName || productName.trim() === '') {
            return null;
        }
        const result = await this.prisma.$queryRaw `
      SELECT find_canonical_name(${productName}, ${threshold}::real)
    `;
        return result[0]?.find_canonical_name || null;
    }
    async normalizeProductName(productName, threshold = 0.6) {
        if (!productName || productName.trim() === '') {
            return '';
        }
        const canonical = await this.findCanonicalName(productName, threshold);
        if (canonical) {
            return canonical;
        }
        const normalized = this.createNormalizedName(productName);
        return normalized;
    }
    createNormalizedName(rawName) {
        return rawName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\sÀ-ỹ]/g, '')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    async batchNormalize(productIds, threshold = 0.6) {
        const stats = { updated: 0, skipped: 0, errors: 0 };
        const whereClause = productIds
            ? { id: { in: productIds } }
            : { ten: { not: null } };
        const products = await this.prisma.ext_sanphamhoadon.findMany({
            where: whereClause,
            select: { id: true, ten: true, ten2: true },
        });
        for (const product of products) {
            try {
                if (!product.ten) {
                    stats.skipped++;
                    continue;
                }
                const normalizedName = await this.normalizeProductName(product.ten, threshold);
                if (normalizedName !== product.ten2) {
                    await this.prisma.ext_sanphamhoadon.update({
                        where: { id: product.id },
                        data: { ten2: normalizedName },
                    });
                    stats.updated++;
                }
                else {
                    stats.skipped++;
                }
            }
            catch (error) {
                console.error(`Error normalizing product ${product.id}:`, error);
                stats.errors++;
            }
        }
        return stats;
    }
    async getProductGroups(minGroupSize = 2) {
        const groups = await this.prisma.ext_sanphamhoadon.groupBy({
            by: ['ten2'],
            where: {
                ten2: { not: null },
            },
            _count: {
                id: true,
            },
            having: {
                ten2: { not: null },
            },
        });
        const result = [];
        for (const group of groups) {
            if (group._count.id >= minGroupSize && group.ten2) {
                const products = await this.prisma.ext_sanphamhoadon.findMany({
                    where: { ten2: group.ten2 },
                    select: {
                        id: true,
                        ten: true,
                        ma: true,
                        dgia: true,
                    },
                });
                result.push({
                    ten2: group.ten2,
                    count: group._count.id,
                    products,
                });
            }
        }
        return result.sort((a, b) => b.count - a.count);
    }
    async findDuplicates() {
        const groups = await this.getProductGroups(2);
        return groups.map((group) => ({
            ten2: group.ten2,
            count: group.count,
            productIds: group.products.map((p) => p.id),
        }));
    }
    async mergeDuplicates(ten2, keepId) {
        const products = await this.prisma.ext_sanphamhoadon.findMany({
            where: { ten2 },
            orderBy: { createdAt: 'asc' },
        });
        if (products.length <= 1) {
            return 0;
        }
        const master = keepId
            ? products.find((p) => p.id === keepId)
            : products[0];
        if (!master) {
            throw new Error('Master product not found');
        }
        const duplicateIds = products
            .filter((p) => p.id !== master.id)
            .map((p) => p.id);
        const result = await this.prisma.ext_sanphamhoadon.deleteMany({
            where: {
                id: { in: duplicateIds },
            },
        });
        return result.count;
    }
    async testSimilarity(text1, text2) {
        const result = await this.prisma.$queryRaw `
      SELECT similarity(${text1}, ${text2}) as similarity
    `;
        return result[0]?.similarity || 0;
    }
    async findSimilarProductsAdvanced(searchText, searchDvt, searchPrice, priceTolerance = 10, threshold = 0.3) {
        if (!searchText || searchText.trim() === '') {
            return [];
        }
        const dvt = searchDvt || null;
        const price = searchPrice ? client_1.Prisma.sql `${searchPrice}::decimal` : client_1.Prisma.sql `NULL`;
        const result = await this.prisma.$queryRaw `
      SELECT * FROM get_similar_products_advanced(
        ${searchText},
        ${dvt},
        ${price},
        ${priceTolerance}::decimal,
        ${threshold}::real
      )
    `;
        return result;
    }
    async findCanonicalNameAdvanced(productName, productDvt, productPrice, priceTolerance = 10, threshold = 0.6) {
        if (!productName || productName.trim() === '') {
            return null;
        }
        const dvt = productDvt || null;
        const price = productPrice ? client_1.Prisma.sql `${productPrice}::decimal` : client_1.Prisma.sql `NULL`;
        const result = await this.prisma.$queryRaw `
      SELECT * FROM find_canonical_name_advanced(
        ${productName},
        ${dvt},
        ${price},
        ${priceTolerance}::decimal,
        ${threshold}::real
      )
    `;
        return result[0] || null;
    }
    async normalizeProductNameAdvanced(productName, productDvt, productPrice, priceTolerance = 10, threshold = 0.6) {
        if (!productName || productName.trim() === '') {
            return '';
        }
        const canonical = await this.findCanonicalNameAdvanced(productName, productDvt, productPrice, priceTolerance, threshold);
        if (canonical && canonical.canonical_name) {
            return canonical.canonical_name;
        }
        const normalized = this.createNormalizedName(productName);
        return normalized;
    }
    async getProductGroupsAdvanced(minGroupSize = 2, priceTolerance = 10) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM get_product_groups_advanced(
        ${minGroupSize},
        ${priceTolerance}::decimal
      )
      ORDER BY product_count DESC
    `;
        return result;
    }
    async findDuplicatesAdvanced(priceTolerance = 10) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM find_duplicates_advanced(${priceTolerance}::decimal)
      ORDER BY product_count DESC
    `;
        return result;
    }
    async testProductSimilarity(productId1, productId2) {
        const result = await this.prisma.$queryRaw `
      SELECT * FROM test_product_similarity(${productId1}, ${productId2})
    `;
        return result[0] || null;
    }
    async updateProductsFromDetails(dryRun = false, limit) {
        const stats = {
            totalDetails: 0,
            processed: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
        };
        try {
            const totalCount = await this.prisma.ext_detailhoadon.count();
            stats.totalDetails = totalCount;
            const totalToProcess = limit || totalCount;
            const BATCH_SIZE = 100;
            let processed = 0;
            while (processed < totalToProcess) {
                const batchSize = Math.min(BATCH_SIZE, totalToProcess - processed);
                const details = await this.prisma.ext_detailhoadon.findMany({
                    take: batchSize,
                    skip: processed,
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        ten: true,
                        dvtinh: true,
                        dgia: true,
                    },
                });
                if (details.length === 0)
                    break;
                for (const detail of details) {
                    const detailData = {
                        id: detail.id.toString(),
                        ten: detail.ten,
                        dvtinh: detail.dvtinh,
                        dgia: detail.dgia,
                    };
                    const result = await this.upsertSanPhamHoaDon(detailData, dryRun);
                    stats.processed++;
                    if (result.success) {
                        if (result.action === 'created' ||
                            result.action === 'would-create') {
                            stats.created++;
                        }
                        else if (result.action === 'updated' ||
                            result.action === 'would-update') {
                            stats.updated++;
                        }
                    }
                    else {
                        if (result.action === 'skipped') {
                            stats.skipped++;
                        }
                        else if (result.action === 'error') {
                            stats.errors++;
                        }
                    }
                }
                processed += details.length;
            }
            return {
                success: true,
                message: dryRun
                    ? `Dry run completed. Would create ${stats.created}, update ${stats.updated} products`
                    : `Successfully updated products: ${stats.created} created, ${stats.updated} updated`,
                stats,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to update products: ${error.message}`,
                stats,
            };
        }
    }
    async upsertSanPhamHoaDon(detail, dryRun) {
        try {
            if (!detail.id) {
                return {
                    success: false,
                    action: 'skipped',
                    reason: 'Missing detail ID',
                };
            }
            if (!detail.ten || detail.ten.trim() === '') {
                return {
                    success: false,
                    action: 'skipped',
                    reason: 'Missing product name (ten)',
                };
            }
            const existingProduct = await this.prisma.ext_sanphamhoadon.findFirst({
                where: { iddetailhoadon: detail.id },
            });
            const normalizedName = await this.normalizeProductName(detail.ten, 0.6);
            const productData = {
                iddetailhoadon: detail.id,
                ten: detail.ten?.trim() || null,
                ten2: normalizedName || null,
                ma: this.generateProductCode(detail.ten),
                dvt: detail.dvtinh?.trim() || null,
                dgia: detail.dgia || null,
            };
            if (dryRun) {
                if (existingProduct) {
                    return {
                        success: true,
                        action: 'would-update',
                        detailId: detail.id,
                        productId: existingProduct.id,
                    };
                }
                else {
                    return {
                        success: true,
                        action: 'would-create',
                        detailId: detail.id,
                    };
                }
            }
            if (existingProduct) {
                const updated = await this.prisma.ext_sanphamhoadon.update({
                    where: { id: existingProduct.id },
                    data: productData,
                });
                return {
                    success: true,
                    action: 'updated',
                    detailId: detail.id,
                    productId: updated.id,
                };
            }
            else {
                const created = await this.prisma.ext_sanphamhoadon.create({
                    data: productData,
                });
                return {
                    success: true,
                    action: 'created',
                    detailId: detail.id,
                    productId: created.id,
                };
            }
        }
        catch (error) {
            return {
                success: false,
                action: 'error',
                detailId: detail.id,
                error: error.message,
            };
        }
    }
    generateProductCode(name) {
        if (!name)
            return null;
        const cleaned = name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, '')
            .trim();
        const words = cleaned.split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 10);
        }
        const code = words
            .map((word) => word.charAt(0))
            .join('')
            .substring(0, 10);
        return code || null;
    }
};
exports.ProductNormalizationService = ProductNormalizationService;
exports.ProductNormalizationService = ProductNormalizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductNormalizationService);
//# sourceMappingURL=product-normalization.service.js.map