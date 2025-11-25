import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cleanup Script: Delete Demo Pages
 * 
 * Removes the 3 demo pages created by seed-demo-pages.ts
 * 
 * Run: npx ts-node backend/scripts/cleanup-demo-pages.ts
 * or: bun run backend/scripts/cleanup-demo-pages.ts
 */

async function cleanupDemoPages() {
  console.log('🧹 Starting demo pages cleanup...\n');

  try {
    const demoSlugs = ['home', 'about-us', 'products'];

    for (const slug of demoSlugs) {
      const page = await prisma.page.findUnique({
        where: { slug },
        include: {
          blocks: true,
        },
      });

      if (page) {
        console.log(`🗑️  Deleting page: ${page.title} (${page.slug})`);
        console.log(`   - Blocks to delete: ${page.blocks.length}`);
        
        await prisma.page.delete({
          where: { id: page.id },
        });
        
        console.log(`✅ Deleted: ${page.title}\n`);
      } else {
        console.log(`⚠️  Page not found: ${slug}\n`);
      }
    }

    console.log('✨ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

async function main() {
  try {
    await cleanupDemoPages();
    console.log('\n✅ All done!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { cleanupDemoPages };
