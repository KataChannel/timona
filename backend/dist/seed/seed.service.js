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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs_1 = require("fs");
const path_1 = require("path");
let SeedService = SeedService_1 = class SeedService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async seedDefaultPages() {
        try {
            this.logger.log('🌱 Checking default pages...');
            const dataPath = (0, path_1.join)(process.cwd(), 'data', 'default-pages.json');
            const jsonData = (0, fs_1.readFileSync)(dataPath, 'utf-8');
            const sampleData = JSON.parse(jsonData);
            let createdCount = 0;
            let skippedCount = 0;
            for (const pageData of sampleData.pages) {
                const existingPage = await this.prisma.page.findFirst({
                    where: {
                        OR: [
                            { id: pageData.id },
                            { slug: pageData.slug }
                        ]
                    }
                });
                if (existingPage) {
                    this.logger.debug(`⏭️  Skipping "${pageData.title}" - already exists`);
                    skippedCount++;
                    continue;
                }
                const page = await this.prisma.page.create({
                    data: {
                        id: pageData.id,
                        title: pageData.title,
                        slug: pageData.slug,
                        content: pageData.content || {},
                        seoTitle: pageData.seoTitle,
                        seoDescription: pageData.seoDescription,
                        seoKeywords: pageData.seoKeywords,
                        status: (pageData.status || 'PUBLISHED'),
                        layoutSettings: pageData.layoutSettings || {},
                        createdBy: 'system',
                    }
                });
                const ls = page.layoutSettings;
                this.logger.log(`✅ Created: "${page.title}" (${page.slug})`);
                if (ls?.headerVariant || ls?.footerVariant) {
                    this.logger.log(`   📐 Layout: Header=${ls.headerVariant || 'default'}, Footer=${ls.footerVariant || 'default'}`);
                }
                if (ls?.headerConfig?.brand?.name) {
                    this.logger.log(`   🏷️  Brand: ${ls.headerConfig.brand.name}`);
                }
                createdCount++;
            }
            this.logger.log('\n📊 Seed Summary:');
            this.logger.log(`   ✅ Created: ${createdCount} pages`);
            if (skippedCount > 0) {
                this.logger.log(`   ⏭️  Skipped: ${skippedCount} pages (already exist)`);
            }
            this.logger.log(`   📄 Total: ${sampleData.pages.length} pages`);
            if (createdCount > 0) {
                this.logger.log('\n📋 Default Pages:');
                const allPages = await this.prisma.page.findMany({
                    where: {
                        id: {
                            in: sampleData.pages.map(p => p.id)
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true,
                        layoutSettings: true
                    }
                });
                for (const page of allPages) {
                    const ls = page.layoutSettings;
                    this.logger.log(`\n📄 ${page.title}`);
                    this.logger.log(`   URL: /${page.slug}`);
                    this.logger.log(`   Status: ${page.status}`);
                    if (ls) {
                        this.logger.log(`   Layout:`);
                        this.logger.log(`     - Header: ${ls.headerVariant || 'default'} ${ls.hasHeader !== false ? '(shown)' : '(hidden)'}`);
                        this.logger.log(`     - Footer: ${ls.footerVariant || 'default'} ${ls.hasFooter !== false ? '(shown)' : '(hidden)'}`);
                        if (ls.headerConfig?.brand?.name) {
                            this.logger.log(`     - Brand: ${ls.headerConfig.brand.name}`);
                        }
                    }
                }
            }
            this.logger.log('\n✅ Default pages seeding completed!\n');
        }
        catch (error) {
            this.logger.error('❌ Error seeding default pages:', error);
        }
    }
    async reseedDefaultPages() {
        this.logger.log('🔄 Re-seeding default pages...');
        await this.seedDefaultPages();
    }
    async clearDefaultPages() {
        try {
            this.logger.log('🗑️  Clearing default pages...');
            const dataPath = (0, path_1.join)(process.cwd(), 'data', 'default-pages.json');
            const jsonData = (0, fs_1.readFileSync)(dataPath, 'utf-8');
            const sampleData = JSON.parse(jsonData);
            const pageIds = sampleData.pages.map(p => p.id);
            const result = await this.prisma.page.deleteMany({
                where: {
                    id: {
                        in: pageIds
                    }
                }
            });
            this.logger.log(`✅ Deleted ${result.count} default pages`);
        }
        catch (error) {
            this.logger.error('❌ Error clearing default pages:', error);
            throw error;
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedService);
//# sourceMappingURL=seed.service.js.map