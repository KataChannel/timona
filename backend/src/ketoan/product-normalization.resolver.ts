import { Resolver, Query, Mutation, Args, ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductNormalizationService } from './product-normalization.service';

/**
 * GraphQL Resolver for Product Normalization
 * 
 * Exposes fuzzy matching functionality via GraphQL API
 * 
 * Example Queries:
 * 
 * query FindSimilarProducts {
 *   findSimilarProducts(searchText: "main asus i7", threshold: 0.6) {
 *     id
 *     ten
 *     ten2
 *     ma
 *     similarityScore
 *   }
 * }
 * 
 * mutation NormalizeProducts {
 *   normalizeProducts(threshold: 0.6) {
 *     updated
 *     skipped
 *     errors
 *   }
 * }
 */

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProductNormalizationResolver {
  constructor(
    private readonly normalizationService: ProductNormalizationService,
  ) {}

  @Query(() => [SimilarProduct], {
    description: 'Find products similar to search text using fuzzy matching',
  })
  async findSimilarProducts(
    @Args('searchText', { type: () => String }) searchText: string,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.3,
      description: 'Similarity threshold (0.0-1.0)',
    })
    threshold: number,
  ): Promise<SimilarProduct[]> {
    const results = await this.normalizationService.findSimilarProducts(
      searchText,
      threshold,
    );

    return results.map((r) => ({
      id: r.id,
      ten: r.ten,
      ten2: r.ten2,
      ma: r.ma,
      similarityScore: r.similarity_score,
    }));
  }

  @Query(() => String, {
    nullable: true,
    description: 'Find canonical (normalized) name for a product',
  })
  async findCanonicalName(
    @Args('productName', { type: () => String }) productName: string,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.6,
    })
    threshold: number,
  ): Promise<string | null> {
    return this.normalizationService.findCanonicalName(
      productName,
      threshold,
    );
  }

  @Query(() => String, {
    description: 'Normalize a product name',
  })
  async normalizeProductName(
    @Args('productName', { type: () => String }) productName: string,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.6,
    })
    threshold: number,
  ): Promise<string> {
    return this.normalizationService.normalizeProductName(
      productName,
      threshold,
    );
  }

  @Query(() => [ProductGroup], {
    description: 'Get product groups by normalized name (ten2)',
  })
  async getProductGroups(
    @Args('minGroupSize', {
      type: () => Number,
      defaultValue: 2,
      description: 'Minimum products per group',
    })
    minGroupSize: number,
  ): Promise<ProductGroup[]> {
    return this.normalizationService.getProductGroups(minGroupSize);
  }

  @Query(() => [DuplicateGroup], {
    description: 'Find duplicate products (same ten2)',
  })
  async findDuplicates(): Promise<DuplicateGroup[]> {
    return this.normalizationService.findDuplicates();
  }

  @Query(() => Number, {
    description: 'Test similarity between two strings',
  })
  async testSimilarity(
    @Args('text1', { type: () => String }) text1: string,
    @Args('text2', { type: () => String }) text2: string,
  ): Promise<number> {
    return this.normalizationService.testSimilarity(text1, text2);
  }

  @Mutation(() => NormalizationStats, {
    description: 'Batch normalize products',
  })
  async normalizeProducts(
    @Args('productIds', {
      type: () => [String],
      nullable: true,
      description: 'Optional: specific product IDs to normalize',
    })
    productIds?: string[],
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.6,
    })
    threshold?: number,
  ): Promise<NormalizationStats> {
    return this.normalizationService.batchNormalize(productIds, threshold);
  }

  @Mutation(() => Number, {
    description: 'Merge duplicate products (keep one, delete rest)',
  })
  async mergeDuplicates(
    @Args('ten2', {
      type: () => String,
      description: 'Normalized name of products to merge',
    })
    ten2: string,
    @Args('keepId', {
      type: () => String,
      nullable: true,
      description: 'Optional: ID of product to keep',
    })
    keepId?: string,
  ): Promise<number> {
    return this.normalizationService.mergeDuplicates(ten2, keepId);
  }

  @Mutation(() => UpdateProductsResult, {
    description: 'Update/create products from ext_detailhoadon with auto-normalization',
  })
  async updateProductsFromDetails(
    @Args('dryRun', {
      type: () => Boolean,
      defaultValue: false,
      description: 'Preview mode - do not save to database',
    })
    dryRun: boolean,
    @Args('limit', {
      type: () => Int,
      nullable: true,
      description: 'Limit number of records to process',
    })
    limit?: number,
  ): Promise<UpdateProductsResult> {
    return this.normalizationService.updateProductsFromDetails(dryRun, limit);
  }

  /* ========================================
   * ADVANCED QUERIES (DVT + PRICE)
   * ========================================*/

  @Query(() => [SimilarProductAdvanced], {
    description: 'Find similar products with DVT and price matching',
  })
  async findSimilarProductsAdvanced(
    @Args('searchText', { type: () => String }) searchText: string,
    @Args('searchDvt', {
      type: () => String,
      nullable: true,
      description: 'Đơn vị tính (optional)',
    })
    searchDvt?: string,
    @Args('searchPrice', {
      type: () => Number,
      nullable: true,
      description: 'Đơn giá (optional)',
    })
    searchPrice?: number,
    @Args('priceTolerance', {
      type: () => Number,
      defaultValue: 10,
      description: 'Price tolerance percentage (default 10%)',
    })
    priceTolerance?: number,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.3,
      description: 'Similarity threshold (0.0-1.0)',
    })
    threshold?: number,
  ): Promise<SimilarProductAdvanced[]> {
    const results =
      await this.normalizationService.findSimilarProductsAdvanced(
        searchText,
        searchDvt,
        searchPrice,
        priceTolerance,
        threshold,
      );

    return results.map((r) => ({
      id: r.id,
      ten: r.ten,
      ten2: r.ten2,
      ma: r.ma,
      dvt: r.dvt,
      dgia: r.dgia,
      similarityScore: r.similarity_score,
      priceDiffPercent: r.price_diff_percent,
      dvtMatch: r.dvt_match,
    }));
  }

  @Query(() => CanonicalNameAdvanced, {
    nullable: true,
    description: 'Find canonical name with DVT and price',
  })
  async findCanonicalNameAdvanced(
    @Args('productName', { type: () => String }) productName: string,
    @Args('productDvt', {
      type: () => String,
      nullable: true,
    })
    productDvt?: string,
    @Args('productPrice', {
      type: () => Number,
      nullable: true,
    })
    productPrice?: number,
    @Args('priceTolerance', {
      type: () => Number,
      defaultValue: 10,
    })
    priceTolerance?: number,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.6,
    })
    threshold?: number,
  ): Promise<CanonicalNameAdvanced | null> {
    const result =
      await this.normalizationService.findCanonicalNameAdvanced(
        productName,
        productDvt,
        productPrice,
        priceTolerance,
        threshold,
      );

    if (!result) return null;

    return {
      canonicalName: result.canonical_name,
      canonicalDvt: result.canonical_dvt,
      canonicalPrice: result.canonical_price,
      matchCount: result.match_count,
      avgPrice: result.avg_price,
    };
  }

  @Query(() => String, {
    description: 'Normalize product name with DVT and price',
  })
  async normalizeProductNameAdvanced(
    @Args('productName', { type: () => String }) productName: string,
    @Args('productDvt', {
      type: () => String,
      nullable: true,
    })
    productDvt?: string,
    @Args('productPrice', {
      type: () => Number,
      nullable: true,
    })
    productPrice?: number,
    @Args('priceTolerance', {
      type: () => Number,
      defaultValue: 10,
    })
    priceTolerance?: number,
    @Args('threshold', {
      type: () => Number,
      defaultValue: 0.6,
    })
    threshold?: number,
  ): Promise<string> {
    return this.normalizationService.normalizeProductNameAdvanced(
      productName,
      productDvt,
      productPrice,
      priceTolerance,
      threshold,
    );
  }

  @Query(() => [ProductGroupAdvanced], {
    description: 'Get product groups with DVT and price statistics',
  })
  async getProductGroupsAdvanced(
    @Args('minGroupSize', {
      type: () => Number,
      defaultValue: 2,
    })
    minGroupSize?: number,
    @Args('priceTolerance', {
      type: () => Number,
      defaultValue: 10,
    })
    priceTolerance?: number,
  ): Promise<ProductGroupAdvanced[]> {
    return this.normalizationService.getProductGroupsAdvanced(
      minGroupSize,
      priceTolerance,
    );
  }

  @Query(() => [DuplicateGroupAdvanced], {
    description: 'Find duplicates with DVT and price matching',
  })
  async findDuplicatesAdvanced(
    @Args('priceTolerance', {
      type: () => Number,
      defaultValue: 10,
    })
    priceTolerance?: number,
  ): Promise<DuplicateGroupAdvanced[]> {
    return this.normalizationService.findDuplicatesAdvanced(priceTolerance);
  }

  @Query(() => ProductSimilarityTest, {
    nullable: true,
    description: 'Test similarity between two products',
  })
  async testProductSimilarity(
    @Args('productId1', { type: () => String }) productId1: string,
    @Args('productId2', { type: () => String }) productId2: string,
  ): Promise<ProductSimilarityTest | null> {
    const result = await this.normalizationService.testProductSimilarity(
      productId1,
      productId2,
    );

    if (!result) return null;

    return {
      product1Name: result.product1_name,
      product2Name: result.product2_name,
      nameSimilarity: result.name_similarity,
      dvtMatch: result.dvt_match,
      product1Dvt: result.product1_dvt,
      product2Dvt: result.product2_dvt,
      priceDiffPercent: result.price_diff_percent,
      product1Price: result.product1_price,
      product2Price: result.product2_price,
      isDuplicate: result.is_duplicate,
    };
  }
}

// GraphQL Types

@ObjectType()
class SimilarProduct {
  @Field()
  id: string;
  
  @Field()
  ten: string;
  
  @Field({ nullable: true })
  ten2: string | null;
  
  @Field({ nullable: true })
  ma: string | null;
  
  @Field(() => Float)
  similarityScore: number;
}

@ObjectType()
class ProductGroup {
  @Field()
  ten2: string;
  
  @Field(() => Int)
  count: number;
  
  @Field(() => [ProductSummary])
  products: ProductSummary[];
}

@ObjectType()
class ProductSummary {
  @Field()
  id: string;
  
  @Field()
  ten: string;
  
  @Field({ nullable: true })
  ma: string | null;
  
  @Field(() => Float, { nullable: true })
  dgia: number | null;
}

@ObjectType()
class DuplicateGroup {
  @Field()
  ten2: string;
  
  @Field(() => Int)
  count: number;
  
  @Field(() => [String])
  productIds: string[];
}

@ObjectType()
class NormalizationStats {
  @Field(() => Int)
  updated: number;
  
  @Field(() => Int)
  skipped: number;
  
  @Field(() => Int)
  errors: number;
}

// Advanced GraphQL Types

@ObjectType()
class SimilarProductAdvanced {
  @Field()
  id: string;
  
  @Field()
  ten: string;
  
  @Field({ nullable: true })
  ten2: string | null;
  
  @Field({ nullable: true })
  ma: string | null;
  
  @Field({ nullable: true })
  dvt: string | null;
  
  @Field(() => Float, { nullable: true })
  dgia: number | null;
  
  @Field(() => Float)
  similarityScore: number;
  
  @Field(() => Float, { nullable: true })
  priceDiffPercent: number | null;
  
  @Field()
  dvtMatch: boolean;
}

@ObjectType()
class CanonicalNameAdvanced {
  @Field()
  canonicalName: string;
  
  @Field({ nullable: true })
  canonicalDvt: string | null;
  
  @Field(() => Float, { nullable: true })
  canonicalPrice: number | null;
  
  @Field(() => Int)
  matchCount: number;
  
  @Field(() => Float, { nullable: true })
  avgPrice: number | null;
}

@ObjectType()
class ProductGroupAdvanced {
  @Field()
  ten2: string;
  
  @Field()
  dvt: string;
  
  @Field(() => Int)
  product_count: number;
  
  @Field(() => Float)
  min_price: number;
  
  @Field(() => Float)
  max_price: number;
  
  @Field(() => Float)
  avg_price: number;
  
  @Field(() => Float)
  price_variance: number;
}

@ObjectType()
class DuplicateGroupAdvanced {
  @Field()
  ten2: string;
  
  @Field()
  dvt: string;
  
  @Field(() => Int)
  product_count: number;
  
  @Field()
  price_range: string;
  
  @Field(() => [String])
  product_ids: string[];
}

@ObjectType()
class ProductSimilarityTest {
  @Field()
  product1Name: string;
  
  @Field()
  product2Name: string;
  
  @Field(() => Float)
  nameSimilarity: number;
  
  @Field()
  dvtMatch: boolean;
  
  @Field({ nullable: true })
  product1Dvt: string | null;
  
  @Field({ nullable: true })
  product2Dvt: string | null;
  
  @Field(() => Float)
  priceDiffPercent: number;
  
  @Field(() => Float)
  product1Price: number;
  
  @Field(() => Float)
  product2Price: number;
  
  @Field()
  isDuplicate: boolean;
}

// Object type for update products stats (MUST be defined first)
@ObjectType()
export class UpdateProductsStats {
  @Field(() => Int)
  totalDetails: number;

  @Field(() => Int)
  processed: number;

  @Field(() => Int)
  created: number;

  @Field(() => Int)
  updated: number;

  @Field(() => Int)
  skipped: number;

  @Field(() => Int)
  errors: number;
}

// Object type for update products result
@ObjectType()
export class UpdateProductsResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => UpdateProductsStats, { nullable: true })
  stats?: UpdateProductsStats;

  @Field(() => String, { nullable: true })
  output?: string;
}
