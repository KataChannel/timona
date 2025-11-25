import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Script: Create 3 Demo Pages for PageBuilder
 * 
 * Pages:
 * 1. Home Page (Trang chủ)
 * 2. About Us Page
 * 3. Products Page
 * 
 * Run: npx ts-node backend/scripts/seed-demo-pages.ts
 * or: bun run backend/scripts/seed-demo-pages.ts
 */

async function seedDemoPages() {
  console.log('🌱 Starting demo pages seed...\n');

  try {
    // 1. CREATE HOME PAGE (Trang Chủ)
    console.log('📄 Creating Home Page...');
    const homePage = await prisma.page.create({
      data: {
        title: 'Trang Chủ',
        slug: 'home',
        description: 'Trang chủ của website - Giới thiệu về công ty và sản phẩm',
        status: 'PUBLISHED',
        seoTitle: 'Trang Chủ - Kata Builder',
        seoDescription: 'Xây dựng website dễ dàng với Kata Builder - Công cụ tạo trang web mạnh mẽ và linh hoạt',
        seoKeywords: ['kata builder', 'website builder', 'trang chủ', 'page builder'],
        layoutSettings: {
          hasHeader: true,
          hasFooter: true,
          headerStyle: 'modern',
          footerStyle: 'default',
        },
        publishedAt: new Date(),
        createdBy: 'system',
        blocks: {
          create: [
            // Hero Section
            {
              type: 'HERO',
              order: 0,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Xây Dựng Website Chuyên Nghiệp',
                subtitle: 'Với Kata Builder',
                description: 'Công cụ tạo trang web mạnh mẽ, dễ sử dụng với hàng trăm block và template có sẵn',
                buttonText: 'Bắt Đầu Ngay',
                buttonLink: '/register',
                backgroundImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920',
                alignment: 'center',
                height: 'large',
              },
              style: {
                backgroundColor: '#1e40af',
                color: '#ffffff',
                padding: '80px 20px',
                minHeight: '600px',
              },
            },
            // Features Section
            {
              type: 'SECTION',
              order: 1,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Tính Năng Nổi Bật',
                subtitle: 'Mọi thứ bạn cần để xây dựng website hoàn hảo',
              },
              style: {
                padding: '60px 20px',
                backgroundColor: '#f9fafb',
              },
            },
            // Stats Section
            {
              type: 'STATS',
              order: 2,
              depth: 0,
              isVisible: true,
              content: {
                stats: [
                  {
                    value: '10,000+',
                    label: 'Người dùng',
                    icon: 'users',
                  },
                  {
                    value: '50,000+',
                    label: 'Trang web đã tạo',
                    icon: 'globe',
                  },
                  {
                    value: '99.9%',
                    label: 'Uptime',
                    icon: 'check-circle',
                  },
                  {
                    value: '24/7',
                    label: 'Hỗ trợ',
                    icon: 'headphones',
                  },
                ],
              },
              style: {
                padding: '60px 20px',
                backgroundColor: '#ffffff',
              },
            },
            // CTA Section
            {
              type: 'HERO',
              order: 3,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Sẵn sàng bắt đầu?',
                description: 'Tạo website của bạn ngay hôm nay với Kata Builder',
                buttonText: 'Dùng thử miễn phí',
                buttonLink: '/register',
                secondaryButtonText: 'Xem Demo',
                secondaryButtonLink: '/demo',
                alignment: 'center',
                height: 'medium',
              },
              style: {
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '80px 20px',
              },
            },
          ],
        },
      },
    });
    console.log(`✅ Home Page created: ${homePage.id}\n`);

    // 2. CREATE ABOUT US PAGE
    console.log('📄 Creating About Us Page...');
    const aboutPage = await prisma.page.create({
      data: {
        title: 'Về Chúng Tôi',
        slug: 'about-us',
        description: 'Tìm hiểu về Kata Builder - Sứ mệnh, tầm nhìn và đội ngũ của chúng tôi',
        status: 'PUBLISHED',
        seoTitle: 'Về Chúng Tôi - Kata Builder',
        seoDescription: 'Kata Builder là nền tảng xây dựng website hàng đầu, giúp bạn tạo website chuyên nghiệp dễ dàng',
        seoKeywords: ['về chúng tôi', 'kata builder', 'công ty', 'đội ngũ'],
        layoutSettings: {
          hasHeader: true,
          hasFooter: true,
          headerStyle: 'modern',
          footerStyle: 'default',
        },
        publishedAt: new Date(),
        createdBy: 'system',
        blocks: {
          create: [
            // Hero Section
            {
              type: 'HERO',
              order: 0,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Về Chúng Tôi',
                subtitle: 'Kata Builder',
                description: 'Chúng tôi tin rằng việc xây dựng website nên đơn giản và dễ tiếp cận với mọi người',
                alignment: 'center',
                height: 'medium',
                backgroundImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920',
              },
              style: {
                backgroundColor: '#6366f1',
                color: '#ffffff',
                padding: '60px 20px',
                minHeight: '400px',
              },
            },
            // Mission Section
            {
              type: 'SECTION',
              order: 1,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Sứ Mệnh Của Chúng Tôi',
                description: 'Kata Builder được sinh ra với mục tiêu đơn giản hóa quy trình tạo website, giúp mọi người - từ doanh nghiệp nhỏ đến các tập đoàn lớn - có thể xây dựng sự hiện diện trực tuyến chuyên nghiệp mà không cần kiến thức lập trình.',
              },
              style: {
                padding: '80px 20px',
                backgroundColor: '#ffffff',
              },
            },
            // Team Section
            {
              type: 'TEAM',
              order: 2,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Đội Ngũ Của Chúng Tôi',
                subtitle: 'Gặp gỡ những người đằng sau Kata Builder',
                members: [
                  {
                    name: 'Nguyễn Văn A',
                    role: 'CEO & Founder',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                    bio: '10+ năm kinh nghiệm trong ngành công nghệ',
                    social: {
                      linkedin: '#',
                      twitter: '#',
                    },
                  },
                  {
                    name: 'Trần Thị B',
                    role: 'CTO',
                    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                    bio: 'Chuyên gia về kiến trúc hệ thống và cloud',
                    social: {
                      linkedin: '#',
                      github: '#',
                    },
                  },
                  {
                    name: 'Lê Văn C',
                    role: 'Lead Designer',
                    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                    bio: 'Đam mê về UX/UI và design systems',
                    social: {
                      dribbble: '#',
                      behance: '#',
                    },
                  },
                  {
                    name: 'Phạm Thị D',
                    role: 'Head of Marketing',
                    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
                    bio: 'Chuyên gia digital marketing 8+ năm',
                    social: {
                      linkedin: '#',
                      twitter: '#',
                    },
                  },
                ],
                columns: 4,
              },
              style: {
                padding: '80px 20px',
                backgroundColor: '#f9fafb',
              },
            },
            // Values Section
            {
              type: 'GRID',
              order: 3,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Giá Trị Cốt Lõi',
                items: [
                  {
                    icon: 'heart',
                    title: 'Khách hàng là trung tâm',
                    description: 'Chúng tôi đặt nhu cầu khách hàng lên hàng đầu trong mọi quyết định',
                  },
                  {
                    icon: 'zap',
                    title: 'Đổi mới không ngừng',
                    description: 'Luôn tìm kiếm và áp dụng công nghệ mới nhất',
                  },
                  {
                    icon: 'users',
                    title: 'Làm việc nhóm',
                    description: 'Tin tưởng vào sức mạnh của sự hợp tác',
                  },
                  {
                    icon: 'award',
                    title: 'Chất lượng cao',
                    description: 'Cam kết mang đến sản phẩm và dịch vụ tốt nhất',
                  },
                ],
                columns: 2,
              },
              style: {
                padding: '80px 20px',
                backgroundColor: '#ffffff',
              },
            },
          ],
        },
      },
    });
    console.log(`✅ About Us Page created: ${aboutPage.id}\n`);

    // 3. CREATE PRODUCTS PAGE
    console.log('📄 Creating Products Page...');
    const productsPage = await prisma.page.create({
      data: {
        title: 'Sản Phẩm',
        slug: 'products',
        description: 'Khám phá các sản phẩm và dịch vụ của Kata Builder',
        status: 'PUBLISHED',
        seoTitle: 'Sản Phẩm - Kata Builder',
        seoDescription: 'Khám phá các gói dịch vụ và tính năng của Kata Builder phù hợp với nhu cầu của bạn',
        seoKeywords: ['sản phẩm', 'dịch vụ', 'gói dịch vụ', 'kata builder'],
        layoutSettings: {
          hasHeader: true,
          hasFooter: true,
          headerStyle: 'modern',
          footerStyle: 'default',
        },
        publishedAt: new Date(),
        createdBy: 'system',
        blocks: {
          create: [
            // Hero Section
            {
              type: 'HERO',
              order: 0,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Sản Phẩm & Dịch Vụ',
                subtitle: 'Chọn gói phù hợp với nhu cầu của bạn',
                description: 'Từ cá nhân đến doanh nghiệp, chúng tôi có giải pháp cho tất cả',
                alignment: 'center',
                height: 'medium',
              },
              style: {
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                padding: '60px 20px',
              },
            },
            // Pricing Grid Section
            {
              type: 'GRID',
              order: 1,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Bảng Giá',
                subtitle: 'Chọn gói phù hợp với bạn',
                items: [
                  {
                    featured: false,
                    title: 'Starter',
                    price: 'Miễn phí',
                    period: '',
                    description: 'Hoàn hảo cho người mới bắt đầu',
                    features: [
                      '5 trang web',
                      '100 MB lưu trữ',
                      'Templates cơ bản',
                      'Hỗ trợ email',
                      'SSL miễn phí',
                    ],
                    buttonText: 'Bắt đầu miễn phí',
                    buttonLink: '/register?plan=starter',
                  },
                  {
                    featured: true,
                    title: 'Professional',
                    price: '299,000đ',
                    period: '/tháng',
                    description: 'Dành cho doanh nghiệp nhỏ',
                    features: [
                      '50 trang web',
                      '10 GB lưu trữ',
                      'Tất cả templates',
                      'Hỗ trợ ưu tiên',
                      'SSL & CDN',
                      'Custom domain',
                      'Analytics nâng cao',
                    ],
                    buttonText: 'Chọn gói này',
                    buttonLink: '/register?plan=pro',
                  },
                  {
                    featured: false,
                    title: 'Enterprise',
                    price: 'Liên hệ',
                    period: '',
                    description: 'Giải pháp doanh nghiệp',
                    features: [
                      'Không giới hạn trang',
                      'Lưu trữ không giới hạn',
                      'White label',
                      'Hỗ trợ 24/7',
                      'Custom features',
                      'SLA 99.99%',
                      'Dedicated server',
                    ],
                    buttonText: 'Liên hệ sales',
                    buttonLink: '/contact',
                  },
                ],
                columns: 3,
              },
              style: {
                padding: '80px 20px',
                backgroundColor: '#ffffff',
              },
            },
            // Features Section
            {
              type: 'SECTION',
              order: 2,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Tính Năng Nổi Bật',
                description: 'Mọi thứ bạn cần để xây dựng website chuyên nghiệp',
              },
              style: {
                padding: '60px 20px',
                backgroundColor: '#f9fafb',
              },
            },
            // Feature Grid
            {
              type: 'GRID',
              order: 3,
              depth: 0,
              isVisible: true,
              content: {
                items: [
                  {
                    icon: 'layout',
                    title: 'Drag & Drop Builder',
                    description: 'Thiết kế trang web trực quan với giao diện kéo thả',
                  },
                  {
                    icon: 'smartphone',
                    title: 'Responsive Design',
                    description: 'Tự động tối ưu cho mọi thiết bị',
                  },
                  {
                    icon: 'zap',
                    title: 'Tốc độ cao',
                    description: 'Website load nhanh với CDN toàn cầu',
                  },
                  {
                    icon: 'shield',
                    title: 'Bảo mật',
                    description: 'SSL miễn phí và bảo mật đa lớp',
                  },
                  {
                    icon: 'bar-chart',
                    title: 'Analytics',
                    description: 'Theo dõi hiệu suất website chi tiết',
                  },
                  {
                    icon: 'users',
                    title: 'Collaboration',
                    description: 'Làm việc nhóm hiệu quả',
                  },
                ],
                columns: 3,
              },
              style: {
                padding: '0 20px 80px 20px',
                backgroundColor: '#f9fafb',
              },
            },
            // CTA Section
            {
              type: 'HERO',
              order: 4,
              depth: 0,
              isVisible: true,
              content: {
                title: 'Bắt đầu dùng thử miễn phí',
                description: 'Không cần thẻ tín dụng. Hủy bất cứ lúc nào.',
                buttonText: 'Dùng thử 14 ngày miễn phí',
                buttonLink: '/register',
                alignment: 'center',
                height: 'small',
              },
              style: {
                backgroundColor: '#ec4899',
                color: '#ffffff',
                padding: '60px 20px',
              },
            },
          ],
        },
      },
    });
    console.log(`✅ Products Page created: ${productsPage.id}\n`);

    // Summary
    console.log('📊 Seed Summary:');
    console.log(`   - Home Page: /home (ID: ${homePage.id})`);
    console.log(`   - About Us: /about-us (ID: ${aboutPage.id})`);
    console.log(`   - Products: /products (ID: ${productsPage.id})`);
    console.log('\n✨ Demo pages seeded successfully!');

    return {
      homePage,
      aboutPage,
      productsPage,
    };
  } catch (error) {
    console.error('❌ Error seeding demo pages:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const pages = await seedDemoPages();
    console.log('\n✅ All done!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { seedDemoPages };
