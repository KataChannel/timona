import { ProductNormalizationService } from './product-normalization.service';
export declare class ProductNormalizationResolver {
    private readonly normalizationService;
    constructor(normalizationService: ProductNormalizationService);
    findSimilarProducts(searchText: string, threshold: number): Promise<SimilarProduct[]>;
    findCanonicalName(productName: string, threshold: number): Promise<string | null>;
    normalizeProductName(productName: string, threshold: number): Promise<string>;
    getProductGroups(minGroupSize: number): Promise<ProductGroup[]>;
    findDuplicates(): Promise<DuplicateGroup[]>;
    testSimilarity(text1: string, text2: string): Promise<number>;
    normalizeProducts(productIds?: string[], threshold?: number): Promise<NormalizationStats>;
    mergeDuplicates(ten2: string, keepId?: string): Promise<number>;
    updateProductsFromDetails(dryRun: boolean, limit?: number): Promise<UpdateProductsResult>;
    findSimilarProductsAdvanced(searchText: string, searchDvt?: string, searchPrice?: number, priceTolerance?: number, threshold?: number): Promise<SimilarProductAdvanced[]>;
    findCanonicalNameAdvanced(productName: string, productDvt?: string, productPrice?: number, priceTolerance?: number, threshold?: number): Promise<CanonicalNameAdvanced | null>;
    normalizeProductNameAdvanced(productName: string, productDvt?: string, productPrice?: number, priceTolerance?: number, threshold?: number): Promise<string>;
    getProductGroupsAdvanced(minGroupSize?: number, priceTolerance?: number): Promise<ProductGroupAdvanced[]>;
    findDuplicatesAdvanced(priceTolerance?: number): Promise<DuplicateGroupAdvanced[]>;
    testProductSimilarity(productId1: string, productId2: string): Promise<ProductSimilarityTest | null>;
}
declare class SimilarProduct {
    id: string;
    ten: string;
    ten2: string | null;
    ma: string | null;
    similarityScore: number;
}
declare class ProductGroup {
    ten2: string;
    count: number;
    products: ProductSummary[];
}
declare class ProductSummary {
    id: string;
    ten: string;
    ma: string | null;
    dgia: number | null;
}
declare class DuplicateGroup {
    ten2: string;
    count: number;
    productIds: string[];
}
declare class NormalizationStats {
    updated: number;
    skipped: number;
    errors: number;
}
declare class SimilarProductAdvanced {
    id: string;
    ten: string;
    ten2: string | null;
    ma: string | null;
    dvt: string | null;
    dgia: number | null;
    similarityScore: number;
    priceDiffPercent: number | null;
    dvtMatch: boolean;
}
declare class CanonicalNameAdvanced {
    canonicalName: string;
    canonicalDvt: string | null;
    canonicalPrice: number | null;
    matchCount: number;
    avgPrice: number | null;
}
declare class ProductGroupAdvanced {
    ten2: string;
    dvt: string;
    product_count: number;
    min_price: number;
    max_price: number;
    avg_price: number;
    price_variance: number;
}
declare class DuplicateGroupAdvanced {
    ten2: string;
    dvt: string;
    product_count: number;
    price_range: string;
    product_ids: string[];
}
declare class ProductSimilarityTest {
    product1Name: string;
    product2Name: string;
    nameSimilarity: number;
    dvtMatch: boolean;
    product1Dvt: string | null;
    product2Dvt: string | null;
    priceDiffPercent: number;
    product1Price: number;
    product2Price: number;
    isDuplicate: boolean;
}
export declare class UpdateProductsStats {
    totalDetails: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
}
export declare class UpdateProductsResult {
    success: boolean;
    message: string;
    stats?: UpdateProductsStats;
    output?: string;
}
export {};
