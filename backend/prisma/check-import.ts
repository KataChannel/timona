import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportResults() {
  console.log('📊 Kiểm tra kết quả import...\n');
  
  // Count blog posts
  const blogPostCount = await prisma.blogPost.count();
  console.log(`✅ Tổng số bài viết (blog_posts): ${blogPostCount}`);
  
  // Count products
  const productCount = await prisma.product.count();
  console.log(`✅ Tổng số sản phẩm (products): ${productCount}`);
  
  // Count product images
  const imageCount = await prisma.productImage.count();
  console.log(`✅ Tổng số hình ảnh sản phẩm: ${imageCount}`);
  
  // Count product variants
  const variantCount = await prisma.productVariant.count();
  console.log(`✅ Tổng số biến thể sản phẩm: ${variantCount}`);
  
  // Sample blog posts
  console.log('\n📝 Mẫu bài viết:');
  const samplePosts = await prisma.blogPost.findMany({
    take: 5,
    select: {
      title: true,
      slug: true,
      status: true,
      isFeatured: true
    }
  });
  samplePosts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title} (${post.slug}) - ${post.status}${post.isFeatured ? ' ⭐' : ''}`);
  });
  
  // Sample products
  console.log('\n🛒 Mẫu sản phẩm:');
  const sampleProducts = await prisma.product.findMany({
    take: 5,
    select: {
      name: true,
      slug: true,
      price: true,
      status: true,
      isFeatured: true
    }
  });
  sampleProducts.forEach((product, i) => {
    console.log(`   ${i + 1}. ${product.name} - ${product.price.toLocaleString()}đ (${product.status})${product.isFeatured ? ' ⭐' : ''}`);
  });
}

checkImportResults()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
