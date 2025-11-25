import { PrismaService } from '../prisma/prisma.service';
export declare class ProductNormalizationService {
    private prisma;
    constructor(prisma: PrismaService);
    findSimilarProducts(searchText: string, threshold?: number): Promise<Array<{
        id: string;
        ten: string;
        ten2: string | null;
        ma: string | null;
        similarity_score: number;
    }>>;
    findCanonicalName(productName: string, threshold?: number): Promise<string | null>;
    normalizeProductName(productName: string, threshold?: number): Promise<string>;
    private createNormalizedName;
    batchNormalize(productIds?: string[], threshold?: number): Promise<{
        updated: number;
        skipped: number;
        errors: number;
    }>;
    getProductGroups(minGroupSize?: number): Promise<Array<{
        ten2: string;
        count: number;
        products: Array<{
            id: string;
            ten: string;
            ma: string | null;
            dgia: any;
        }>;
    }>>;
    findDuplicates(): Promise<Array<{
        ten2: string;
        count: number;
        productIds: string[];
    }>>;
    mergeDuplicates(ten2: string, keepId?: string): Promise<number>;
    testSimilarity(text1: string, text2: string): Promise<number>;
    findSimilarProductsAdvanced(searchText: string, searchDvt?: string | null, searchPrice?: number | null, priceTolerance?: number, threshold?: number): Promise<Array<{
        id: string;
        ten: string;
        ten2: string | null;
        ma: string | null;
        dvt: string | null;
        dgia: any;
        similarity_score: number;
        price_diff_percent: number | null;
        dvt_match: boolean;
    }>>;
    findCanonicalNameAdvanced(productName: string, productDvt?: string | null, productPrice?: number | null, priceTolerance?: number, threshold?: number): Promise<{
        canonical_name: string;
        canonical_dvt: string | null;
        canonical_price: number | null;
        match_count: number;
        avg_price: number | null;
    } | null>;
    normalizeProductNameAdvanced(productName: string, productDvt?: string | null, productPrice?: number | null, priceTolerance?: number, threshold?: number): Promise<string>;
    getProductGroupsAdvanced(minGroupSize?: number, priceTolerance?: number): Promise<Array<{
        ten2: string;
        dvt: string;
        product_count: number;
        min_price: number;
        max_price: number;
        avg_price: number;
        price_variance: number;
    }>>;
    findDuplicatesAdvanced(priceTolerance?: number): Promise<Array<{
        ten2: string;
        dvt: string;
        product_count: number;
        price_range: string;
        product_ids: string[];
    }>>;
    testProductSimilarity(productId1: string, productId2: string): Promise<{
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
    } | null>;
    updateProductsFromDetails(dryRun?: boolean, limit?: number): Promise<{
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
    }>;
    private upsertSanPhamHoaDon;
    private generateProductCode;
}
