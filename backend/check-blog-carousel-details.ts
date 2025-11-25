import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlogCarouselBlocks() {
  const pageId = 'd3796ed7-9237-4120-b299-51503db04fa6';
  
  // Get ALL BLOG_CAROUSEL blocks for this page (including nested ones)
  const blogCarouselBlocks = await prisma.pageBlock.findMany({
    where: {
      pageId,
      type: 'BLOG_CAROUSEL'
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\n📊 Found ${blogCarouselBlocks.length} BLOG_CAROUSEL blocks for page ${pageId}\n`);
  
  blogCarouselBlocks.forEach((block, index) => {
    console.log(`${index + 1}. Block ID: ${block.id}`);
    console.log(`   - Order: ${block.order}`);
    console.log(`   - ParentId: ${block.parentId || 'null (root level)'}`);
    console.log(`   - IsVisible: ${block.isVisible}`);
    console.log(`   - Depth: ${block.depth}`);
    console.log(`   - Created: ${block.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkBlogCarouselBlocks().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
