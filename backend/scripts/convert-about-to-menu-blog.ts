/**
 * Script chuyển /ve-chung-toi từ Page Builder sang Menu + Blog Post
 */

import { PrismaClient, PageStatus, MenuType, MenuTarget } from '@prisma/client';

const prisma = new PrismaClient();

async function convertToMenuAndBlog() {
  console.log('🔄 Chuyển đổi /ve-chung-toi sang Menu + Blog Post...\n');

  try {
    // 1. Unpublish page hiện tại
    const existingPage = await prisma.page.findUnique({
      where: { slug: 've-chung-toi' }
    });

    if (existingPage) {
      console.log('📄 Tìm thấy Page Builder hiện tại');
      await prisma.page.update({
        where: { id: existingPage.id },
        data: { 
          status: PageStatus.DRAFT,
          publishedAt: null 
        }
      });
      console.log('✅ Đã unpublish page (chuyển về DRAFT)\n');
    }

    // 2. Tạo hoặc lấy Blog Post "Về Chúng Tôi"
    let blogPost = await prisma.blogPost.findFirst({
      where: { slug: 've-chung-toi' }
    });

    if (!blogPost) {
      console.log('📝 Tạo Blog Post mới "Về Chúng Tôi"');
      
      // Tìm admin user để làm author
      const adminUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { email: { contains: 'admin' } },
            { roleType: 'ADMIN' }
          ]
        }
      });

      if (!adminUser) {
        throw new Error('Không tìm thấy admin user. Vui lòng tạo user admin trước.');
      }

      // Tìm hoặc tạo category
      let category = await prisma.blogCategory.findFirst({
        where: { slug: 'gioi-thieu' }
      });

      if (!category) {
        category = await prisma.blogCategory.create({
          data: {
            name: 'Giới Thiệu',
            slug: 'gioi-thieu',
            description: 'Giới thiệu về công ty',
            isActive: true,
          }
        });
        console.log('  ✓ Đã tạo category "Giới Thiệu"');
      }

      blogPost = await prisma.blogPost.create({
        data: {
          title: 'Về Chúng Tôi',
          slug: 've-chung-toi',
          excerpt: 'Tìm hiểu về chúng tôi - đơn vị cung cấp rau sạch organic chất lượng cao',
          content: `
            <h2>Chào mừng đến với Rau Sạch Organic</h2>
            
            <p>Chúng tôi là một trang trại rau sạch organic, cam kết mang đến cho khách hàng những sản phẩm tươi ngon, an toàn và bổ dưỡng nhất.</p>
            
            <h3>Câu chuyện của chúng tôi</h3>
            <p>Với phương pháp canh tác hữu cơ, không sử dụng thuốc trừ sâu hay phân bón hóa học, chúng tôi tự hào là người bạn đồng hành tin cậy của mọi gia đình.</p>
            
            <h3>Giá trị cốt lõi</h3>
            <ul>
              <li><strong>100% Organic:</strong> Canh tác hoàn toàn tự nhiên</li>
              <li><strong>An toàn:</strong> Kiểm tra chất lượng nghiêm ngặt</li>
              <li><strong>Giao hàng nhanh:</strong> Tươi ngon đến tay khách hàng</li>
            </ul>
            
            <h3>Cam kết của chúng tôi</h3>
            <p>Chúng tôi cam kết mang đến sản phẩm rau sạch chất lượng cao, góp phần bảo vệ sức khỏe cộng đồng và bảo vệ môi trường.</p>
          `,
          authorId: adminUser.id,
          categoryId: category.id,
          status: 'PUBLISHED',
          isFeatured: true,
          visibility: 'PUBLIC',
          publishedAt: new Date(),
          
          // SEO
          metaTitle: 'Về Chúng Tôi - Rau Sạch Organic',
          metaDescription: 'Tìm hiểu về chúng tôi - đơn vị cung cấp rau sạch organic chất lượng cao',
          metaKeywords: ['về chúng tôi', 'giới thiệu', 'rau sạch', 'organic'],
        }
      });
      console.log('✅ Đã tạo Blog Post "Về Chúng Tôi"');
      console.log('  - ID:', blogPost.id);
      console.log('  - Slug:', blogPost.slug);
      console.log('  - Author:', adminUser.email);
      console.log('  - Category:', category.name);
    } else {
      console.log('✅ Blog Post đã tồn tại với ID:', blogPost.id);
    }

    console.log('');

    // 3. Tạo Menu item
    let menu = await prisma.menu.findUnique({
      where: { slug: 've-chung-toi' }
    });

    if (!menu) {
      console.log('🔗 Tạo Menu item mới');
      menu = await prisma.menu.create({
        data: {
          title: 'Về Chúng Tôi',
          slug: 've-chung-toi',
          description: 'Giới thiệu về công ty',
          type: MenuType.HEADER,
          order: 3,
          level: 0,
          
          // Link configuration
          linkType: 'BLOG_DETAIL',
          blogPostId: blogPost.id,
          target: MenuTarget.SELF,
          
          // Store slug in customData for routing
          customData: {
            blogPostSlug: blogPost.slug,
            blogPostTitle: blogPost.title,
          },
          
          // Visibility
          isActive: true,
          isVisible: true,
          isPublic: true,
        }
      });
      console.log('✅ Đã tạo Menu item');
      console.log('  - Title:', menu.title);
      console.log('  - Slug:', menu.slug);
      console.log('  - Link Type: BLOG_DETAIL');
      console.log('  - Blog Post ID:', blogPost.id);
      console.log('  - Custom Data:', menu.customData);
    } else {
      console.log('🔗 Cập nhật Menu item hiện tại');
      menu = await prisma.menu.update({
        where: { slug: 've-chung-toi' },
        data: {
          linkType: 'BLOG_DETAIL',
          blogPostId: blogPost.id,
          customData: {
            blogPostSlug: blogPost.slug,
            blogPostTitle: blogPost.title,
          },
          isActive: true,
          isVisible: true,
        }
      });
      console.log('✅ Đã cập nhật Menu item');
    }

    console.log('');
    console.log('🎉 Hoàn thành!');
    console.log('');
    console.log('📋 Tóm tắt:');
    console.log('  ✅ Page Builder: DRAFT (không hiển thị)');
    console.log('  ✅ Blog Post: PUBLISHED');
    console.log('  ✅ Menu: Active → Link tới blog post');
    console.log('');
    console.log('🌐 Truy cập:');
    console.log('  - Menu URL: /ve-chung-toi → Redirect to /bai-viet/ve-chung-toi');
    console.log('  - Blog URL: /bai-viet/ve-chung-toi');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy
convertToMenuAndBlog()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
