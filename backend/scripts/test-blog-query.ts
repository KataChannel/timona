import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBlogQuery() {
  try {
    const slug = 'cung-cap-rau-cho-nha-hang';
    
    console.log(`\n🔍 Testing blog query with slug: "${slug}"\n`);
    
    // Simulate the exact service method
    const blog = await prisma.blogPost.findUnique({ 
      where: { slug }, 
      include: { 
        category: true, 
        author: { 
          select: { 
            id: true, 
            username: true, 
            firstName: true, 
            lastName: true, 
            email: true 
          } 
        }, 
        tags: { 
          include: { 
            tag: true 
          } 
        } 
      } 
    });
    
    if (!blog) {
      console.log('❌ Blog post NOT FOUND');
      return;
    }
    
    console.log('✅ Blog post FOUND:');
    console.log('ID:', blog.id);
    console.log('Title:', blog.title);
    console.log('Slug:', blog.slug);
    console.log('Status:', blog.status);
    console.log('Visibility:', blog.visibility);
    console.log('Published At:', blog.publishedAt);
    console.log('Featured Image:', blog.featuredImage);
    console.log('Category:', blog.category?.name);
    console.log('Author:', blog.author?.username);
    console.log('Tags:', blog.tags.map(t => t.tag.name).join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBlogQuery();
