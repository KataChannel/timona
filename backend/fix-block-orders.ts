import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBlockOrders() {
  const pageId = 'd3796ed7-9237-4120-b299-51503db04fa6';
  
  // Get all blocks for the page (root level only)
  const blocks = await prisma.pageBlock.findMany({
    where: {
      pageId,
      parentId: null
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' } // Use creation date as tiebreaker
    ]
  });

  console.log(`\n📊 Found ${blocks.length} root-level blocks for page ${pageId}`);
  console.log('\n🔍 Current order:');
  blocks.forEach((block, index) => {
    console.log(`  ${index + 1}. ${block.type} (id: ${block.id}, order: ${block.order})`);
  });

  // Reassign sequential orders
  console.log('\n🔧 Reassigning sequential orders...');
  
  for (let i = 0; i < blocks.length; i++) {
    await prisma.pageBlock.update({
      where: { id: blocks[i].id },
      data: { order: i }
    });
    console.log(`  ✓ ${blocks[i].type} (${blocks[i].id}) → order: ${i}`);
  }

  // Verify the fix
  const updatedBlocks = await prisma.pageBlock.findMany({
    where: {
      pageId,
      parentId: null
    },
    orderBy: { order: 'asc' }
  });

  console.log('\n✅ Updated order:');
  updatedBlocks.forEach((block, index) => {
    console.log(`  ${index + 1}. ${block.type} (id: ${block.id}, order: ${block.order})`);
  });

  await prisma.$disconnect();
}

fixBlockOrders().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
