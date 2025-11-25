import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProductSchema() {
  console.log('🔍 Testing Product Schema...\n');

  try {
    // Test 1: Check if nameEn field exists by querying
    console.log('1. Testing nameEn field...');
    const product = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        price: true,
      },
    });

    if (product) {
      console.log('✅ Product found with nameEn field:');
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Name (VN): ${product.name}`);
      console.log(`   - Name (EN): ${product.nameEn || 'null'}`);
      console.log(`   - Slug: ${product.slug}`);
      console.log(`   - Price: ${product.price}`);
    } else {
      console.log('⚠️  No products found in database');
    }

    // Test 2: Count total products
    console.log('\n2. Counting products...');
    const count = await prisma.product.count();
    console.log(`✅ Total products: ${count}`);

    // Test 3: Test search with OR condition (like in buildWhereClause)
    console.log('\n3. Testing search functionality...');
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'rau', mode: 'insensitive' } },
          { description: { contains: 'rau', mode: 'insensitive' } },
        ],
      },
      take: 3,
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
      },
    });

    console.log(`✅ Found ${searchResults.length} products matching "rau":`);
    searchResults.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name} (${p.nameEn || 'no EN name'})`);
    });

    console.log('\n✨ All tests passed! Product schema is working correctly.\n');
  } catch (error: any) {
    console.error('\n❌ Error testing product schema:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testProductSchema();
