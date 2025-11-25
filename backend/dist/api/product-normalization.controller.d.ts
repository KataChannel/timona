import { PrismaService } from '../prisma/prisma.service';
interface NormalizeProductsDto {
    dryRun?: boolean;
    limit?: number;
    threshold?: number;
    force?: boolean;
}
export declare class ProductNormalizationController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    normalizeProducts(dto: NormalizeProductsDto): Promise<{
        success: boolean;
        message: string;
        output: string;
        stats: {
            total: number;
            normalized: number;
            pending: number;
        };
    }>;
    private getStats;
}
export {};
