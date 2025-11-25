/**
 * Update all products to be available for purchase
 * Sets all products to ACTIVE status with stock available
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating all products to be available for purchase...\n');

  try {
    // Update all products to ACTIVE status with stock
    const productsUpdate = await prisma.product.updateMany({
      data: {
        status: 'ACTIVE',
        stock: 100, // Set default stock to 100
      }
    });

    console.log(`✅ Updated ${productsUpdate.count} products to ACTIVE with stock`);

    // Update all product variants to be available
    const variantsUpdate = await prisma.productVariant.updateMany({
      data: {
        stock: 100,
      }
    });

    console.log(`✅ Updated ${variantsUpdate.count} product variants with stock`);

    // Get summary
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { status: 'ACTIVE' }
    });
    const productsWithStock = await prisma.product.count({
      where: { stock: { gt: 0 } }
    });

    console.log('\n📊 Summary:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Active products: ${activeProducts}`);
    console.log(`   Products with stock: ${productsWithStock}`);

    // Show sample products
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        status: true,
        stock: true,
        price: true,
      }
    });

    console.log('\n📦 Sample products:');
    sampleProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.status} - Stock: ${p.stock} - ${p.price.toLocaleString()}đ`);
    });

    console.log('\n✅ All products are now available for purchase!');

  } catch (error) {
    console.error('❌ Error updating products:', error);
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
