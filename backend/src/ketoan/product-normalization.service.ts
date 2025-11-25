import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Product Normalization Service
 * 
 * Sử dụng PostgreSQL pg_trgm extension để:
 * 1. Tìm sản phẩm tương tự bằng fuzzy matching
 * 2. Chuẩn hóa tên sản phẩm vào field ten2
 * 3. Nhóm các sản phẩm giống nhau
 * 
 * Example:
 * - "main asus i7" 
 * - "bo mạch asus i7300"
 * - "asus i7300 main"
 * → Tất cả sẽ có cùng ten2: "Main Asus i7"
 */
@Injectable()
export class ProductNormalizationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tìm sản phẩm tương tự bằng pg_trgm similarity
   * 
   * @param searchText - Tên sản phẩm cần tìm
   * @param threshold - Ngưỡng similarity (0.0-1.0), mặc định 0.3
   * @returns Danh sách sản phẩm tương tự với điểm similarity
   */
  async findSimilarProducts(
    searchText: string,
    threshold: number = 0.3,
  ): Promise<
    Array<{
      id: string;
      ten: string;
      ten2: string | null;
      ma: string | null;
      similarity_score: number;
    }>
  > {
    if (!searchText || searchText.trim() === '') {
      return [];
    }

    // Sử dụng function PostgreSQL đã tạo trong migration
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        ten: string;
        ten2: string | null;
        ma: string | null;
        similarity_score: number;
      }>
    >`
      SELECT * FROM get_similar_products(${searchText}, ${threshold}::real)
    `;

    return result;
  }

  /**
   * Tìm tên chuẩn (canonical name) cho một sản phẩm
   * Dựa trên ten2 phổ biến nhất trong các sản phẩm tương tự
   * 
   * @param productName - Tên sản phẩm
   * @param threshold - Ngưỡng similarity, mặc định 0.6
   * @returns Tên chuẩn (ten2) hoặc null nếu không tìm thấy
   */
  async findCanonicalName(
    productName: string,
    threshold: number = 0.6,
  ): Promise<string | null> {
    if (!productName || productName.trim() === '') {
      return null;
    }

    const result = await this.prisma.$queryRaw<Array<{ find_canonical_name: string | null }>>`
      SELECT find_canonical_name(${productName}, ${threshold}::real)
    `;

    return result[0]?.find_canonical_name || null;
  }

  /**
   * Chuẩn hóa tên sản phẩm
   * 
   * Logic:
   * 1. Tìm canonical name từ DB (nếu có sản phẩm tương tự)
   * 2. Nếu không có, tạo normalized name mới
   * 3. Làm sạch: trim, lowercase, remove extra spaces
   * 
   * @param productName - Tên sản phẩm gốc
   * @param threshold - Ngưỡng similarity
   * @returns Tên đã chuẩn hóa (ten2)
   */
  async normalizeProductName(
    productName: string,
    threshold: number = 0.6,
  ): Promise<string> {
    if (!productName || productName.trim() === '') {
      return '';
    }

    // Bước 1: Tìm canonical name từ DB
    const canonical = await this.findCanonicalName(productName, threshold);
    if (canonical) {
      return canonical;
    }

    // Bước 2: Không tìm thấy → tạo normalized name mới
    const normalized = this.createNormalizedName(productName);
    return normalized;
  }

  /**
   * Tạo normalized name từ raw name
   * 
   * Rules:
   * 1. Lowercase
   * 2. Trim whitespace
   * 3. Remove extra spaces
   * 4. Remove special characters (giữ chữ, số, khoảng trắng)
   * 5. Capitalize first letter of each word
   * 
   * @param rawName - Tên gốc
   * @returns Tên đã normalized
   */
  private createNormalizedName(rawName: string): string {
    return rawName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces → single space
      .replace(/[^\w\sÀ-ỹ]/g, '') // Remove special chars, keep Vietnamese
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Batch normalize: Chuẩn hóa nhiều sản phẩm cùng lúc
   * 
   * @param productIds - Array of product IDs
   * @param threshold - Similarity threshold
   * @returns Số lượng sản phẩm đã update
   */
  async batchNormalize(
    productIds?: string[],
    threshold: number = 0.6,
  ): Promise<{ updated: number; skipped: number; errors: number }> {
    const stats = { updated: 0, skipped: 0, errors: 0 };

    // Lấy sản phẩm cần normalize
    const whereClause: Prisma.ext_sanphamhoadonWhereInput = productIds
      ? { id: { in: productIds } }
      : { ten: { not: null } };

    const products = await this.prisma.ext_sanphamhoadon.findMany({
      where: whereClause,
      select: { id: true, ten: true, ten2: true },
    });

    // Process từng sản phẩm
    for (const product of products) {
      try {
        if (!product.ten) {
          stats.skipped++;
          continue;
        }

        // Normalize
        const normalizedName = await this.normalizeProductName(
          product.ten,
          threshold,
        );

        // Update if changed
        if (normalizedName !== product.ten2) {
          await this.prisma.ext_sanphamhoadon.update({
            where: { id: product.id },
            data: { ten2: normalizedName },
          });
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        console.error(`Error normalizing product ${product.id}:`, error);
        stats.errors++;
      }
    }

    return stats;
  }

  /**
   * Group products by normalized name (ten2)
   * Trả về các nhóm sản phẩm có cùng ten2
   * 
   * @param minGroupSize - Chỉ trả về nhóm có ít nhất N sản phẩm
   * @returns Array of groups with products
   */
  async getProductGroups(minGroupSize: number = 2): Promise<
    Array<{
      ten2: string;
      count: number;
      products: Array<{
        id: string;
        ten: string;
        ma: string | null;
        dgia: any;
      }>;
    }>
  > {
    // Tìm ten2 có nhiều sản phẩm
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

    // Lọc groups và lấy products
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

    // Sort by count descending
    return result.sort((a, b) => b.count - a.count);
  }

  /**
   * Tìm duplicate products (cùng ten2 nhưng khác ID)
   * 
   * @returns Array of duplicate groups
   */
  async findDuplicates(): Promise<
    Array<{
      ten2: string;
      count: number;
      productIds: string[];
    }>
  > {
    const groups = await this.getProductGroups(2);

    return groups.map((group) => ({
      ten2: group.ten2,
      count: group.count,
      productIds: group.products.map((p) => p.id),
    }));
  }

  /**
   * Merge duplicate products
   * Giữ lại 1 sản phẩm (master), xóa các duplicates
   * 
   * @param ten2 - Normalized name
   * @param keepId - ID của sản phẩm giữ lại (nếu không có, giữ oldest)
   * @returns Số lượng sản phẩm đã xóa
   */
  async mergeDuplicates(ten2: string, keepId?: string): Promise<number> {
    const products = await this.prisma.ext_sanphamhoadon.findMany({
      where: { ten2 },
      orderBy: { createdAt: 'asc' },
    });

    if (products.length <= 1) {
      return 0;
    }

    // Determine master product
    const master = keepId
      ? products.find((p) => p.id === keepId)
      : products[0];

    if (!master) {
      throw new Error('Master product not found');
    }

    // Get IDs to delete
    const duplicateIds = products
      .filter((p) => p.id !== master.id)
      .map((p) => p.id);

    // Delete duplicates
    const result = await this.prisma.ext_sanphamhoadon.deleteMany({
      where: {
        id: { in: duplicateIds },
      },
    });

    return result.count;
  }

  /**
   * Test similarity function
   * Useful for debugging and tuning threshold
   * 
   * @param text1 - First text
   * @param text2 - Second text
   * @returns Similarity score (0.0-1.0)
   */
  async testSimilarity(text1: string, text2: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ similarity: number }>>`
      SELECT similarity(${text1}, ${text2}) as similarity
    `;

    return result[0]?.similarity || 0;
  }

  /* ========================================
   * ADVANCED MATCHING METHODS (DVT + PRICE)
   * ========================================*/

  /**
   * Tìm sản phẩm tương tự với advanced matching (DVT + DGIA)
   * 
   * @param searchText - Tên sản phẩm cần tìm
   * @param searchDvt - Đơn vị tính (optional)
   * @param searchPrice - Đơn giá (optional)
   * @param priceTolerance - % chênh lệch giá cho phép (default 10%)
   * @param threshold - Ngưỡng similarity (0.0-1.0), mặc định 0.3
   * @returns Danh sách sản phẩm tương tự với điểm similarity, dvt_match, price_diff
   */
  async findSimilarProductsAdvanced(
    searchText: string,
    searchDvt?: string | null,
    searchPrice?: number | null,
    priceTolerance: number = 10,
    threshold: number = 0.3,
  ): Promise<
    Array<{
      id: string;
      ten: string;
      ten2: string | null;
      ma: string | null;
      dvt: string | null;
      dgia: any;
      similarity_score: number;
      price_diff_percent: number | null;
      dvt_match: boolean;
    }>
  > {
    if (!searchText || searchText.trim() === '') {
      return [];
    }

    // Convert null to undefined for SQL
    const dvt = searchDvt || null;
    const price = searchPrice ? Prisma.sql`${searchPrice}::decimal` : Prisma.sql`NULL`;

    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        ten: string;
        ten2: string | null;
        ma: string | null;
        dvt: string | null;
        dgia: any;
        similarity_score: number;
        price_diff_percent: number | null;
        dvt_match: boolean;
      }>
    >`
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

  /**
   * Tìm tên chuẩn (canonical name) với DVT và DGIA
   * 
   * @param productName - Tên sản phẩm
   * @param productDvt - Đơn vị tính (optional)
   * @param productPrice - Đơn giá (optional)
   * @param priceTolerance - % chênh lệch giá cho phép (default 10%)
   * @param threshold - Ngưỡng similarity, mặc định 0.6
   * @returns Object với canonical_name, canonical_dvt, canonical_price
   */
  async findCanonicalNameAdvanced(
    productName: string,
    productDvt?: string | null,
    productPrice?: number | null,
    priceTolerance: number = 10,
    threshold: number = 0.6,
  ): Promise<{
    canonical_name: string;
    canonical_dvt: string | null;
    canonical_price: number | null;
    match_count: number;
    avg_price: number | null;
  } | null> {
    if (!productName || productName.trim() === '') {
      return null;
    }

    const dvt = productDvt || null;
    const price = productPrice ? Prisma.sql`${productPrice}::decimal` : Prisma.sql`NULL`;

    const result = await this.prisma.$queryRaw<
      Array<{
        canonical_name: string;
        canonical_dvt: string | null;
        canonical_price: number | null;
        match_count: number;
        avg_price: number | null;
      }>
    >`
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

  /**
   * Normalize product name với DVT và DGIA
   * 
   * @param productName - Tên sản phẩm
   * @param productDvt - Đơn vị tính
   * @param productPrice - Đơn giá
   * @param priceTolerance - % chênh lệch giá
   * @param threshold - Ngưỡng similarity
   * @returns Tên đã chuẩn hóa
   */
  async normalizeProductNameAdvanced(
    productName: string,
    productDvt?: string | null,
    productPrice?: number | null,
    priceTolerance: number = 10,
    threshold: number = 0.6,
  ): Promise<string> {
    if (!productName || productName.trim() === '') {
      return '';
    }

    // Tìm canonical name advanced
    const canonical = await this.findCanonicalNameAdvanced(
      productName,
      productDvt,
      productPrice,
      priceTolerance,
      threshold,
    );

    if (canonical && canonical.canonical_name) {
      return canonical.canonical_name;
    }

    // Fallback to basic normalization
    const normalized = this.createNormalizedName(productName);
    return normalized;
  }

  /**
   * Group products by ten2 + DVT với price statistics
   * 
   * @param minGroupSize - Chỉ trả về nhóm có ít nhất N sản phẩm
   * @param priceTolerance - % chênh lệch giá cho phép
   * @returns Array of groups with DVT and price info
   */
  async getProductGroupsAdvanced(
    minGroupSize: number = 2,
    priceTolerance: number = 10,
  ): Promise<
    Array<{
      ten2: string;
      dvt: string;
      product_count: number;
      min_price: number;
      max_price: number;
      avg_price: number;
      price_variance: number;
    }>
  > {
    const result = await this.prisma.$queryRaw<
      Array<{
        ten2: string;
        dvt: string;
        product_count: number;
        min_price: number;
        max_price: number;
        avg_price: number;
        price_variance: number;
      }>
    >`
      SELECT * FROM get_product_groups_advanced(
        ${minGroupSize},
        ${priceTolerance}::decimal
      )
      ORDER BY product_count DESC
    `;

    return result;
  }

  /**
   * Tìm duplicate products với DVT và price tolerance
   * 
   * @param priceTolerance - % chênh lệch giá cho phép
   * @returns Array of duplicate groups
   */
  async findDuplicatesAdvanced(
    priceTolerance: number = 10,
  ): Promise<
    Array<{
      ten2: string;
      dvt: string;
      product_count: number;
      price_range: string;
      product_ids: string[];
    }>
  > {
    const result = await this.prisma.$queryRaw<
      Array<{
        ten2: string;
        dvt: string;
        product_count: number;
        price_range: string;
        product_ids: string[];
      }>
    >`
      SELECT * FROM find_duplicates_advanced(${priceTolerance}::decimal)
      ORDER BY product_count DESC
    `;

    return result;
  }

  /**
   * Test similarity giữa 2 sản phẩm (bao gồm DVT và DGIA)
   * 
   * @param productId1 - ID sản phẩm 1
   * @param productId2 - ID sản phẩm 2
   * @returns Similarity metrics
   */
  async testProductSimilarity(
    productId1: string,
    productId2: string,
  ): Promise<{
    product1_name: string;
    product2_name: string;
    name_similarity: number;
    dvt_match: boolean;
    product1_dvt: string | null;
    product2_dvt: string | null;
    price_diff_percent: number;
    product1_price: number;
    product2_price: number;
    is_duplicate: boolean;
  } | null> {
    const result = await this.prisma.$queryRaw<
      Array<{
        product1_name: string;
        product2_name: string;
        name_similarity: number;
        dvt_match: boolean;
        product1_dvt: string | null;
        product2_dvt: string | null;
        price_diff_percent: number;
        product1_price: number;
        product2_price: number;
        is_duplicate: boolean;
      }>
    >`
      SELECT * FROM test_product_similarity(${productId1}, ${productId2})
    `;

    return result[0] || null;
  }

  /**
   * Update/Create products from ext_detailhoadon
   * Same logic as updatesanpham.js script but as a service method
   * 
   * @param dryRun - If true, preview changes without saving
   * @param limit - Limit number of records to process
   * @returns Result with stats
   */
  async updateProductsFromDetails(
    dryRun: boolean = false,
    limit?: number,
  ): Promise<{
    success: boolean;
    message: string;
    stats?: {
      totalDetails: number;
      processed: number;
      created: number;
      updated: number;
      skipped: number;
      errors: number;
    };
    output?: string;
  }> {
    const stats = {
      totalDetails: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      // Count total details
      const totalCount = await this.prisma.ext_detailhoadon.count();
      stats.totalDetails = totalCount;

      const totalToProcess = limit || totalCount;

      // Fetch details in batches
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

        if (details.length === 0) break;

        // Process each detail
        for (const detail of details) {
          // Convert bigint id to string for consistency
          const detailData = {
            id: detail.id.toString(),
            ten: detail.ten,
            dvtinh: detail.dvtinh,
            dgia: detail.dgia,
          };
          const result = await this.upsertSanPhamHoaDon(detailData, dryRun);

          stats.processed++;

          if (result.success) {
            if (
              result.action === 'created' ||
              result.action === 'would-create'
            ) {
              stats.created++;
            } else if (
              result.action === 'updated' ||
              result.action === 'would-update'
            ) {
              stats.updated++;
            }
          } else {
            if (result.action === 'skipped') {
              stats.skipped++;
            } else if (result.action === 'error') {
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
    } catch (error) {
      return {
        success: false,
        message: `Failed to update products: ${error.message}`,
        stats,
      };
    }
  }

  /**
   * Helper: Create or update sanphamhoadon from detailhoadon
   */
  private async upsertSanPhamHoaDon(
    detail: {
      id: string;
      ten: string | null;
      dvtinh: string | null;
      dgia: Prisma.Decimal | null;
    },
    dryRun: boolean,
  ): Promise<{
    success: boolean;
    action: string;
    detailId?: string;
    productId?: string;
    changes?: any;
    reason?: string;
    error?: string;
  }> {
    try {
      // Validate required fields
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

      // Check if product already exists for this detail
      const existingProduct = await this.prisma.ext_sanphamhoadon.findFirst({
        where: { iddetailhoadon: detail.id },
      });

      // Auto-normalize product name using fuzzy matching
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
        } else {
          return {
            success: true,
            action: 'would-create',
            detailId: detail.id,
          };
        }
      }

      if (existingProduct) {
        // Update existing product
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
      } else {
        // Create new product
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
    } catch (error) {
      return {
        success: false,
        action: 'error',
        detailId: detail.id,
        error: error.message,
      };
    }
  }

  /**
   * Helper: Generate product code from name
   */
  private generateProductCode(name: string | null): string | null {
    if (!name) return null;

    // Remove Vietnamese accents and special characters
    const cleaned = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .trim();

    // Take first letters of each word (max 10 chars)
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
}
