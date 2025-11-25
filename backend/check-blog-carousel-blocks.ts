import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkBlogCarouselBlocks() {
  try {
    console.log('🔍 Checking for BLOG_CAROUSEL blocks...\n');
    
    // Get all BLOG_CAROUSEL blocks
    const blocks = await prisma.pageBlock.findMany({
      where: {
        type: 'BLOG_CAROUSEL'
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Found ${blocks.length} BLOG_CAROUSEL blocks\n`);
    
    if (blocks.length === 0) {
      console.log('❌ No BLOG_CAROUSEL blocks found in database');
    } else {
      blocks.forEach((block, index) => {
        console.log(`${index + 1}. Block ID: ${block.id}`);
        console.log(`   Page: ${block.page?.title || 'N/A'} (${block.page?.id})`);
        console.log(`   Type: ${block.type}`);
        console.log(`   Order: ${block.order}`);
        console.log(`   Content: ${JSON.stringify(block.content).substring(0, 100)}...`);
        console.log(`   Created: ${block.createdAt}`);
        console.log('');
      });
    }
    
    // Check specific page
    const pageId = 'd3796ed7-9237-4120-b299-51503db04fa6';
    console.log(`\n🔍 Checking page ${pageId}...\n`);
    
    const pageBlocks = await prisma.pageBlock.findMany({
      where: {
        pageId: pageId
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    console.log(`📊 Page has ${pageBlocks.length} total blocks:`);
    pageBlocks.forEach((block, index) => {
      console.log(`   ${index + 1}. ${block.type} (id: ${block.id}, order: ${block.order})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogCarouselBlocks();
