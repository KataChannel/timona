import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SamplePage {
  id: string;
  title: string;
  slug: string;
  content?: any;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status?: string;
  layoutSettings?: any;
}

interface SampleData {
  pages: SamplePage[];
}

/**
 * Seed Service for Default Pages
 * 
 * NOTE: Automatic seeding is DISABLED.
 * This service will NOT run on module initialization.
 * Call seedDefaultPages() manually if you need to seed pages.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  // DISABLED: Removed OnModuleInit to prevent automatic seeding
  // Call seedDefaultPages() manually if needed

  /**
   * Seed default pages from JSON file
   * WARNING: This creates demo/sample page data
   */
  async seedDefaultPages(): Promise<void> {
    try {
      this.logger.log('🌱 Checking default pages...');

      // Đọc file JSON
      const dataPath = join(process.cwd(), 'data', 'default-pages.json');
      const jsonData = readFileSync(dataPath, 'utf-8');
      const sampleData: SampleData = JSON.parse(jsonData);

      let createdCount = 0;
      let skippedCount = 0;

      for (const pageData of sampleData.pages) {
        // Kiểm tra xem trang đã tồn tại chưa
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

        // Tạo page mới
        const page = await this.prisma.page.create({
          data: {
            id: pageData.id,
            title: pageData.title,
            slug: pageData.slug,
            content: pageData.content || {},
            seoTitle: pageData.seoTitle,
            seoDescription: pageData.seoDescription,
            seoKeywords: pageData.seoKeywords,
            status: (pageData.status || 'PUBLISHED') as any,
            layoutSettings: pageData.layoutSettings || {},
            createdBy: 'system', // Auto-seeded by system
          }
        });

        const ls = page.layoutSettings as any;
        this.logger.log(`✅ Created: "${page.title}" (${page.slug})`);
        
        if (ls?.headerVariant || ls?.footerVariant) {
          this.logger.log(`   📐 Layout: Header=${ls.headerVariant || 'default'}, Footer=${ls.footerVariant || 'default'}`);
        }

        if (ls?.headerConfig?.brand?.name) {
          this.logger.log(`   🏷️  Brand: ${ls.headerConfig.brand.name}`);
        }

        createdCount++;
      }

      // Summary
      this.logger.log('\n📊 Seed Summary:');
      this.logger.log(`   ✅ Created: ${createdCount} pages`);
      
      if (skippedCount > 0) {
        this.logger.log(`   ⏭️  Skipped: ${skippedCount} pages (already exist)`);
      }
      
      this.logger.log(`   📄 Total: ${sampleData.pages.length} pages`);

      // List all pages
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
          const ls = page.layoutSettings as any;
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

    } catch (error) {
      this.logger.error('❌ Error seeding default pages:', error);
      // Không throw error để không làm crash app khi khởi động
      // throw error;
    }
  }

  /**
   * Method để seed manually nếu cần
   */
  async reseedDefaultPages(): Promise<void> {
    this.logger.log('🔄 Re-seeding default pages...');
    await this.seedDefaultPages();
  }

  /**
   * Xóa tất cả default pages
   */
  async clearDefaultPages(): Promise<void> {
    try {
      this.logger.log('🗑️  Clearing default pages...');

      const dataPath = join(process.cwd(), 'data', 'default-pages.json');
      const jsonData = readFileSync(dataPath, 'utf-8');
      const sampleData: SampleData = JSON.parse(jsonData);

      const pageIds = sampleData.pages.map(p => p.id);

      const result = await this.prisma.page.deleteMany({
        where: {
          id: {
            in: pageIds
          }
        }
      });

      this.logger.log(`✅ Deleted ${result.count} default pages`);
    } catch (error) {
      this.logger.error('❌ Error clearing default pages:', error);
      throw error;
    }
  }
}
