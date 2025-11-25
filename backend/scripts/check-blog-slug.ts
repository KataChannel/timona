import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlogSlug() {
  console.log('🔍 Checking blog posts...\n');

  // Tìm blog với tiêu đề tương tự
  const blogs = await prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: 'cung cấp', mode: 'insensitive' } },
        { slug: { contains: 'cung-cap', mode: 'insensitive' } },
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      visibility: true,
      publishedAt: true,
    }
  });

  console.log('📄 Found blog posts:', blogs.length);
  blogs.forEach(blog => {
    console.log('\n---');
    console.log('ID:', blog.id);
    console.log('Title:', blog.title);
    console.log('Slug:', blog.slug);
    console.log('Status:', blog.status);
    console.log('Visibility:', blog.visibility);
    console.log('Published:', blog.publishedAt);
  });

  // Kiểm tra menu ve-chung-toi
  console.log('\n\n🔗 Checking menu "ve-chung-toi"...\n');
  const menu = await prisma.menu.findUnique({
    where: { slug: 've-chung-toi' },
    select: {
      id: true,
      title: true,
      slug: true,
      linkType: true,
      blogPostId: true,
      customData: true,
      isActive: true,
      isVisible: true,
    }
  });

  if (menu) {
    console.log('✅ Menu found:');
    console.log('  - Title:', menu.title);
    console.log('  - Link Type:', menu.linkType);
    console.log('  - Blog Post ID:', menu.blogPostId);
    console.log('  - Custom Data:', JSON.stringify(menu.customData, null, 2));
    console.log('  - Is Active:', menu.isActive);
    console.log('  - Is Visible:', menu.isVisible);

    if (menu.blogPostId) {
      const linkedBlog = await prisma.blogPost.findUnique({
        where: { id: menu.blogPostId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          visibility: true,
        }
      });
      console.log('\n📝 Linked blog post:');
      console.log('  ', linkedBlog);
    }
  } else {
    console.log('❌ Menu not found');
  }

  await prisma.$disconnect();
}

checkBlogSlug().catch(console.error);
