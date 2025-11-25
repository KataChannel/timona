import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBlogData() {
  console.log('\n🔍 Verifying Blog Data Import...\n');

  try {
    // Check categories
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    console.log('📁 Blog Categories:');
    console.log('─'.repeat(60));
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name || '[No Name]'}`);
      console.log(`   - Slug: ${cat.slug}`);
      console.log(`   - Posts: ${cat._count.posts}`);
      console.log(`   - Active: ${cat.isActive ? '✅' : '❌'}`);
      console.log(`   - Parent: ${cat.parentId || 'None'}`);
      console.log('');
    });

    // Check posts
    const posts = await prisma.blogPost.findMany({
      include: {
        category: true,
        author: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('\n📝 Recent Blog Posts (Top 10):');
    console.log('─'.repeat(60));
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title.substring(0, 60)}...`);
      console.log(`   - Category: ${post.category?.name || 'Uncategorized'}`);
      console.log(`   - Author: ${post.author.firstName} ${post.author.lastName}`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Featured: ${post.isFeatured ? '⭐' : '-'}`);
      console.log(`   - Reading time: ${post.readingTime || 0} min`);
      console.log(`   - Keywords: ${post.metaKeywords.length}`);
      console.log(`   - Published: ${post.publishedAt?.toISOString().split('T')[0] || 'Not published'}`);
      console.log('');
    });

    // Statistics
    const totalPosts = await prisma.blogPost.count();
    const publishedPosts = await prisma.blogPost.count({
      where: { status: 'PUBLISHED' },
    });
    const featuredPosts = await prisma.blogPost.count({
      where: { isFeatured: true },
    });

    console.log('\n📊 Statistics:');
    console.log('─'.repeat(60));
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Total Posts: ${totalPosts}`);
    console.log(`Published Posts: ${publishedPosts}`);
    console.log(`Featured Posts: ${featuredPosts}`);
    console.log(`Draft Posts: ${totalPosts - publishedPosts}`);

    // Category distribution
    console.log('\n📈 Posts per Category:');
    console.log('─'.repeat(60));
    const categoriesWithCount = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
    });

    categoriesWithCount.forEach(cat => {
      if (cat._count.posts > 0) {
        const barLength = Math.ceil(cat._count.posts / 2);
        const bar = '█'.repeat(barLength);
        console.log(`${(cat.name || '[No Name]').padEnd(30)} ${bar} ${cat._count.posts}`);
      }
    });

    console.log('\n✨ Verification completed!\n');
  } catch (error: any) {
    console.error('\n❌ Error:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyBlogData();
