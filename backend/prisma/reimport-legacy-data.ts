/**
 * Re-import legacy data after fixing image URLs
 * This script deletes existing legacy data and re-imports with correct URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting existing legacy data...\n');

  try {
    // Delete in correct order due to foreign key constraints
    console.log('Deleting product variants...');
    const variants = await prisma.productVariant.deleteMany({});
    console.log(`✅ Deleted ${variants.count} product variants`);

    console.log('Deleting product images...');
    const images = await prisma.productImage.deleteMany({});
    console.log(`✅ Deleted ${images.count} product images`);

    console.log('Deleting products...');
    const products = await prisma.product.deleteMany({});
    console.log(`✅ Deleted ${products.count} products`);

    console.log('Deleting product categories...');
    const categories = await prisma.category.deleteMany({});
    console.log(`✅ Deleted ${categories.count} product categories`);

    console.log('Deleting blog posts...');
    const posts = await prisma.blogPost.deleteMany({});
    console.log(`✅ Deleted ${posts.count} blog posts`);

    console.log('Deleting blog categories...');
    const blogCategories = await prisma.blogCategory.deleteMany({});
    console.log(`✅ Deleted ${blogCategories.count} blog categories`);

    console.log('\n✅ All legacy data deleted successfully!');
    console.log('\n📦 Now run: bun run import:legacy');

  } catch (error) {
    console.error('❌ Error deleting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
