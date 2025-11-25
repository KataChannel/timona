/**
 * Seed script để tạo trang "Về Chúng Tôi"
 * Chạy: bun run ts-node backend/scripts/seed-about-page.ts
 */

import { PrismaClient, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAboutPage() {
  console.log('🌱 Seeding About Page...');

  try {
    // Kiểm tra xem trang đã tồn tại chưa
    const existingPage = await prisma.page.findUnique({
      where: { slug: 've-chung-toi' }
    });

    if (existingPage) {
      console.log('✅ Trang "Về Chúng Tôi" đã tồn tại với ID:', existingPage.id);
      return existingPage;
    }

    // Tạo trang mới
    const aboutPage = await prisma.page.create({
      data: {
        title: 'Về Chúng Tôi',
        slug: 've-chung-toi',
        content: 'Chào mừng bạn đến với trang Về Chúng Tôi',
        status: PageStatus.PUBLISHED,
        isHomepage: false,
        isPublished: true,
        isVisible: true,
        
        // SEO
        seoTitle: 'Về Chúng Tôi - Rau Sạch Organic',
        seoDescription: 'Tìm hiểu về chúng tôi - đơn vị cung cấp rau sạch organic chất lượng cao',
        seoKeywords: ['về chúng tôi', 'rau sạch', 'organic', 'giới thiệu'],
        
        // Layout settings
        layoutSettings: {
          hasHeader: true,
          hasFooter: true,
          headerStyle: 'default',
          footerStyle: 'default',
        },
        
        // Blocks - Tạo một vài block mẫu
        blocks: {
          create: [
            {
              type: 'HERO',
              order: 0,
              content: {
                title: 'Về Chúng Tôi',
                subtitle: 'Chúng tôi cam kết mang đến sản phẩm rau sạch chất lượng cao',
                backgroundImage: '/images/about-hero.jpg',
              },
              isVisible: true,
            },
            {
              type: 'TEXT',
              order: 1,
              content: {
                html: `
                  <h2>Câu chuyện của chúng tôi</h2>
                  <p>Chúng tôi là một trang trại rau sạch organic, cam kết mang đến cho khách hàng những sản phẩm tươi ngon, an toàn và bổ dưỡng nhất.</p>
                  <p>Với phương pháp canh tác hữu cơ, không sử dụng thuốc trừ sâu hay phân bón hóa học, chúng tôi tự hào là người bạn đồng hành tin cậy của mọi gia đình.</p>
                `,
              },
              isVisible: true,
            },
            {
              type: 'FEATURES',
              order: 2,
              content: {
                title: 'Giá trị cốt lõi',
                features: [
                  {
                    icon: 'Leaf',
                    title: '100% Organic',
                    description: 'Canh tác hoàn toàn tự nhiên',
                  },
                  {
                    icon: 'Shield',
                    title: 'An toàn',
                    description: 'Kiểm tra chất lượng nghiêm ngặt',
                  },
                  {
                    icon: 'Truck',
                    title: 'Giao hàng nhanh',
                    description: 'Tươi ngon đến tay khách hàng',
                  },
                ],
              },
              isVisible: true,
            },
          ],
        },
      },
      include: {
        blocks: true,
      },
    });

    console.log('✅ Đã tạo trang "Về Chúng Tôi" thành công!');
    console.log('📄 Page ID:', aboutPage.id);
    console.log('🔗 Slug: /ve-chung-toi');
    console.log('📦 Số blocks:', aboutPage.blocks.length);

    return aboutPage;
  } catch (error) {
    console.error('❌ Lỗi khi tạo trang:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed
seedAboutPage()
  .then(() => {
    console.log('🎉 Seed hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed thất bại:', error);
    process.exit(1);
  });
