import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addBlogCarouselEnum() {
  try {
    console.log('🔄 Adding BLOG_CAROUSEL to BlockType enum...');
    
    // Check if SEARCH exists
    const searchExists = await prisma.$queryRawUnsafe<Array<{count: bigint}>>(
      `SELECT COUNT(*) as count FROM pg_enum WHERE enumlabel = 'SEARCH' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')`
    );
    
    if (Number(searchExists[0].count) === 0) {
      console.log('➕ Adding SEARCH...');
      await prisma.$executeRawUnsafe(`ALTER TYPE "BlockType" ADD VALUE 'SEARCH'`);
    } else {
      console.log('✅ SEARCH already exists');
    }
    
    // Check if BOOKMARK exists
    const bookmarkExists = await prisma.$queryRawUnsafe<Array<{count: bigint}>>(
      `SELECT COUNT(*) as count FROM pg_enum WHERE enumlabel = 'BOOKMARK' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')`
    );
    
    if (Number(bookmarkExists[0].count) === 0) {
      console.log('➕ Adding BOOKMARK...');
      await prisma.$executeRawUnsafe(`ALTER TYPE "BlockType" ADD VALUE 'BOOKMARK'`);
    } else {
      console.log('✅ BOOKMARK already exists');
    }
    
    // Check if BLOG_CAROUSEL exists
    const exists = await prisma.$queryRawUnsafe<Array<{count: bigint}>>(
      `SELECT COUNT(*) as count FROM pg_enum WHERE enumlabel = 'BLOG_CAROUSEL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType')`
    );
    
    if (Number(exists[0].count) === 0) {
      console.log('➕ Adding BLOG_CAROUSEL...');
      await prisma.$executeRawUnsafe(`ALTER TYPE "BlockType" ADD VALUE 'BLOG_CAROUSEL'`);
      console.log('✅ Successfully added BLOG_CAROUSEL to BlockType enum!');
    } else {
      console.log('✅ BLOG_CAROUSEL already exists in BlockType enum');
    }
    
    // Verify
    const blockTypes = await prisma.$queryRawUnsafe<Array<{enumlabel: string}>>(
      `SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType') ORDER BY enumsortorder`
    );
    
    console.log('\n📋 Current BlockType values:');
    blockTypes.forEach(b => console.log(`   - ${b.enumlabel}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBlogCarouselEnum();
