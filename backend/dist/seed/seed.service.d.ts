import { PrismaService } from '../prisma/prisma.service';
export declare class SeedService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    seedDefaultPages(): Promise<void>;
    reseedDefaultPages(): Promise<void>;
    clearDefaultPages(): Promise<void>;
}
