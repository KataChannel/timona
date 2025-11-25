import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SamplePage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  layoutSettings?: any;
  createdBy: string;
  publishedAt?: string;
}

interface SampleData {
  pages: SamplePage[];
}

async function seedSamplePages() {
  console.log('🌱 Seeding sample pages with custom layout settings...\n');

  try {
    // Read sample data
    const dataPath = path.join(__dirname, '../data/sample-pages-layout.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const sampleData: SampleData = JSON.parse(jsonData);

    let created = 0;
    let skipped = 0;

    for (const pageData of sampleData.pages) {
      try {
        // Check if page already exists
        const existing = await prisma.page.findUnique({
          where: { slug: pageData.slug }
        });

        if (existing) {
          console.log(`⏭️  Skipping: "${pageData.title}" (slug already exists: ${pageData.slug})`);
          skipped++;
          continue;
        }

        // Create page
        const page = await prisma.page.create({
          data: {
            id: pageData.id,
            title: pageData.title,
            slug: pageData.slug,
            description: pageData.description,
            status: pageData.status as any,
            seoTitle: pageData.seoTitle,
            seoDescription: pageData.seoDescription,
            seoKeywords: pageData.seoKeywords || [],
            layoutSettings: pageData.layoutSettings || {},
            createdBy: pageData.createdBy,
            publishedAt: pageData.publishedAt ? new Date(pageData.publishedAt) : null,
          }
        });

        console.log(`✅ Created: "${page.title}" (${page.slug})`);
        if (pageData.layoutSettings) {
          const ls = pageData.layoutSettings;
          console.log(`   📐 Layout: Header=${ls.headerVariant || 'default'}, Footer=${ls.footerVariant || 'default'}`);
          if (ls.headerConfig?.brand?.name) {
            console.log(`   🏷️  Brand: ${ls.headerConfig.brand.name}`);
          }
        }
        console.log('');
        created++;

      } catch (error: any) {
        console.error(`❌ Error creating page "${pageData.title}":`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} pages`);
    console.log(`   ⏭️  Skipped: ${skipped} pages`);
    console.log(`   📄 Total: ${sampleData.pages.length} pages\n`);

    // List all pages with layout settings
    console.log('📋 Pages with custom layouts:\n');
    const pagesWithLayout = await prisma.page.findMany({
      where: {
        slug: {
          in: sampleData.pages.map(p => p.slug)
        }
      },
      select: {
        title: true,
        slug: true,
        layoutSettings: true,
        status: true
      }
    });

    pagesWithLayout.forEach(page => {
      console.log(`📄 ${page.title}`);
      console.log(`   URL: /website/${page.slug.replace('website/', '')}`);
      console.log(`   Status: ${page.status}`);
      
      if (page.layoutSettings && typeof page.layoutSettings === 'object') {
        const ls = page.layoutSettings as any;
        console.log(`   Layout:`);
        console.log(`     - Header: ${ls.headerVariant || 'default'} (${ls.hasHeader ? 'shown' : 'hidden'})`);
        console.log(`     - Footer: ${ls.footerVariant || 'default'} (${ls.hasFooter ? 'shown' : 'hidden'})`);
        if (ls.headerConfig?.brand?.name) {
          console.log(`     - Brand: ${ls.headerConfig.brand.name}`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedSamplePages()
    .then(() => {
      console.log('✅ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedSamplePages };
