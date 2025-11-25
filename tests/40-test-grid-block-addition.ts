/**
 * Test script: Verify Grid Block addition works correctly (1st, 2nd, 3rd, etc.)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGridBlockAddition() {
  console.log('🧪 Testing Grid Block Addition (1st, 2nd, 3rd, ...)\n');

  try {
    // Create a test page
    const page = await prisma.page.create({
      data: {
        title: 'Grid Block Test Page',
        slug: `grid-test-${Date.now()}`,
        content: {},
        createdBy: 'test-user',
      },
    });

    console.log(`✅ Created test page: ${page.id}\n`);

    // Test adding multiple GRID blocks
    console.log('📝 Adding GRID blocks sequentially...\n');

    for (let i = 1; i <= 5; i++) {
      try {
        const gridBlock = await prisma.pageBlock.create({
          data: {
            type: 'GRID',
            content: {
              columns: 3,
              gap: 16,
              responsive: { sm: 1, md: 2, lg: 3 },
            },
            pageId: page.id,
            // Order will be auto-calculated by backend
            // or we can explicitly set it
            order: undefined, // Let backend calculate
          },
        });

        console.log(`✅ GRID Block #${i}: id=${gridBlock.id}, order=${gridBlock.order}`);
      } catch (error: any) {
        console.error(`❌ GRID Block #${i} failed:`, error.message);
        if (error.code === 'P2002') {
          console.error('   → Unique constraint violated (duplicate order?)');
        }
        throw error;
      }
    }

    // Fetch and verify all blocks
    console.log('\n📊 Verifying all GRID blocks...\n');
    const pageWithBlocks = await prisma.page.findUnique({
      where: { id: page.id },
      include: {
        blocks: {
          where: { type: 'GRID' },
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(`Total GRID blocks: ${pageWithBlocks!.blocks.length}`);
    
    for (const block of pageWithBlocks!.blocks) {
      console.log(`   - Block ${block.id}: order=${block.order}, type=${block.type}`);
    }

    // Verify orders are sequential
    const orders = pageWithBlocks!.blocks.map((b) => b.order);
    const expectedOrders = Array.from({ length: orders.length }, (_, i) => i);
    const ordersMatch = JSON.stringify(orders) === JSON.stringify(expectedOrders);

    if (ordersMatch) {
      console.log('\n✅ ✅ ✅ SUCCESS: All GRID block orders are correct!');
      console.log(`   Orders: [${orders.join(', ')}]`);
    } else {
      console.log('\n❌ ERROR: GRID block orders are incorrect!');
      console.log(`   Expected: [${expectedOrders.join(', ')}]`);
      console.log(`   Got: [${orders.join(', ')}]`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await prisma.page.delete({ where: { id: page.id } });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGridBlockAddition().catch(console.error);
