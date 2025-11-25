/**
 * Verification Script: Check migrated data
 * 
 * Run: bun run verify-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Migration Results...\n');
  console.log('================================================');
  
  // Count categories
  const categoryCount = await prisma.category.count();
  const activeCategories = await prisma.category.count({
    where: { isActive: true }
  });
  
  console.log('\n📁 Categories:');
  console.log(`   Total: ${categoryCount}`);
  console.log(`   Active: ${activeCategories}`);
  
  // Sample categories
  const sampleCategories = await prisma.category.findMany({
    take: 5,
    orderBy: { displayOrder: 'asc' },
    select: {
      name: true,
      slug: true,
      _count: {
        select: { products: true }
      }
    }
  });
  
  console.log('\n   Sample Categories:');
  sampleCategories.forEach(cat => {
    console.log(`     - ${cat.name} (${cat._count.products} products)`);
  });
  
  // Count products
  const productCount = await prisma.product.count();
  const activeProducts = await prisma.product.count({
    where: { status: 'ACTIVE' }
  });
  const featuredProducts = await prisma.product.count({
    where: { isFeatured: true }
  });
  
  console.log('\n📦 Products:');
  console.log(`   Total: ${productCount}`);
  console.log(`   Active: ${activeProducts}`);
  console.log(`   Featured: ${featuredProducts}`);
  
  // Count variants
  const variantCount = await prisma.productVariant.count();
  console.log(`   Variants: ${variantCount}`);
  
  // Count images
  const imageCount = await prisma.productImage.count();
  console.log(`   Images: ${imageCount}`);
  
  // Sample products
  const sampleProducts = await prisma.product.findMany({
    take: 5,
    include: {
      category: { select: { name: true } },
      variants: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\n   Sample Products:');
  sampleProducts.forEach(product => {
    console.log(`     - ${product.name}`);
    console.log(`       Category: ${product.category.name}`);
    console.log(`       Price: ${product.price.toLocaleString('vi-VN')} VND`);
    console.log(`       Stock: ${product.stock}`);
    console.log(`       Variants: ${product.variants.length}`);
    console.log(`       Images: ${product.images.length}`);
  });
  
  // Check for products without categories
  const productsWithoutCategory = await prisma.product.count({
    where: { 
      OR: [
        { categoryId: null },
        { category: { isActive: false } }
      ]
    }
  });
  
  if (productsWithoutCategory > 0) {
    console.log(`\n⚠️  Warning: ${productsWithoutCategory} products without active category`);
  }
  
  // Price range
  const priceStats = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    _avg: { price: true },
  });
  
  console.log('\n💰 Price Statistics:');
  console.log(`   Min: ${priceStats._min.price?.toLocaleString('vi-VN')} VND`);
  console.log(`   Max: ${priceStats._max.price?.toLocaleString('vi-VN')} VND`);
  console.log(`   Avg: ${priceStats._avg.price?.toLocaleString('vi-VN')} VND`);
  
  console.log('\n================================================');
  console.log('✅ Verification completed!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
