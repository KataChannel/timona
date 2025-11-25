import { PrismaClient, GuideType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGuides() {
  console.log('🌱 Seeding System Guides...');

  try {
    // Clear existing guides
    await prisma.systemGuide.deleteMany({});
    console.log('✅ Cleared existing guides');

    // 1. User Guides
    const userGuideParent = await prisma.systemGuide.create({
      data: {
        title: 'Hướng dẫn sử dụng cho người dùng',
        slug: 'user-guide',
        description: 'Hướng dẫn đầy đủ về cách sử dụng hệ thống cho người dùng cuối',
        content: `# Hướng dẫn sử dụng cho người dùng

Chào mừng bạn đến với hệ thống! Tài liệu này sẽ hướng dẫn bạn cách sử dụng các tính năng cơ bản của hệ thống.

## Mục lục

1. Đăng nhập và quản lý tài khoản
2. Quản lý sản phẩm
3. Đơn hàng và thanh toán
4. Hỗ trợ khách hàng

## Bắt đầu

Để bắt đầu sử dụng hệ thống, bạn cần đăng nhập bằng tài khoản của mình...`,
        type: 'USER_GUIDE' as GuideType,
        category: 'Getting Started',
        tags: ['user', 'basic', 'tutorial'],
        difficulty: 'Beginner',
        isPublished: true,
        publishedAt: new Date(),
        orderIndex: 1,
        viewCount: 245,
        helpfulCount: 89,
        notHelpfulCount: 3,
        readingTime: 15,
      },
    });

    // User guide children
    await prisma.systemGuide.createMany({
      data: [
        {
          title: 'Đăng nhập và quản lý tài khoản',
          slug: 'user-guide-login',
          description: 'Hướng dẫn đăng nhập, đăng ký và quản lý thông tin tài khoản',
          content: `# Đăng nhập và quản lý tài khoản

## Đăng nhập

1. Truy cập trang đăng nhập
2. Nhập email và mật khẩu
3. Click "Đăng nhập"

## Đăng ký tài khoản mới

1. Click "Đăng ký"
2. Điền thông tin cá nhân
3. Xác nhận email

## Quản lý thông tin

- Cập nhật thông tin cá nhân
- Thay đổi mật khẩu
- Cài đặt bảo mật`,
          type: 'USER_GUIDE' as GuideType,
          category: 'Getting Started',
          tags: ['login', 'account', 'security'],
          difficulty: 'Beginner',
          isPublished: true,
          publishedAt: new Date(),
          parentId: userGuideParent.id,
          orderIndex: 1,
          viewCount: 156,
          helpfulCount: 67,
          notHelpfulCount: 2,
          readingTime: 5,
        },
        {
          title: 'Quản lý sản phẩm',
          slug: 'user-guide-products',
          description: 'Hướng dẫn tìm kiếm, xem và mua sản phẩm',
          content: `# Quản lý sản phẩm

## Tìm kiếm sản phẩm

1. Sử dụng thanh tìm kiếm
2. Lọc theo danh mục
3. Sắp xếp theo giá, đánh giá

## Xem chi tiết sản phẩm

- Thông tin sản phẩm
- Hình ảnh và video
- Đánh giá từ người dùng
- Sản phẩm liên quan

## Thêm vào giỏ hàng

1. Chọn số lượng
2. Chọn biến thể (size, màu)
3. Click "Thêm vào giỏ"`,
          type: 'USER_GUIDE' as GuideType,
          category: 'E-commerce',
          tags: ['products', 'shopping', 'cart'],
          difficulty: 'Beginner',
          isPublished: true,
          publishedAt: new Date(),
          parentId: userGuideParent.id,
          orderIndex: 2,
          viewCount: 198,
          helpfulCount: 78,
          notHelpfulCount: 4,
          readingTime: 8,
        },
      ],
    });

    // 2. Developer Guides
    const devGuideParent = await prisma.systemGuide.create({
      data: {
        title: 'Tài liệu kỹ thuật cho Developer',
        slug: 'developer-guide',
        description: 'Tài liệu API, kiến trúc hệ thống và hướng dẫn phát triển',
        content: `# Tài liệu kỹ thuật

Tài liệu này dành cho các developer muốn tích hợp hoặc phát triển trên nền tảng của chúng tôi.

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: NestJS 11, GraphQL
- **Database**: PostgreSQL, Prisma
- **Cache**: Redis
- **Storage**: MinIO

## Architecture

Hệ thống sử dụng kiến trúc Microservices với các module độc lập...`,
        type: 'API_REFERENCE' as GuideType,
        category: 'Technical',
        tags: ['api', 'development', 'architecture'],
        difficulty: 'Advanced',
        isPublished: true,
        publishedAt: new Date(),
        orderIndex: 2,
        viewCount: 342,
        helpfulCount: 125,
        notHelpfulCount: 8,
        readingTime: 25,
      },
    });

    // Developer guide children
    await prisma.systemGuide.createMany({
      data: [
        {
          title: 'GraphQL API Reference',
          slug: 'developer-graphql-api',
          description: 'Tài liệu đầy đủ về GraphQL API endpoints, queries và mutations',
          content: `# GraphQL API Reference

## Authentication

\`\`\`graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
\`\`\`

## Queries

### Get Products

\`\`\`graphql
query GetProducts($filter: ProductFilter) {
  products(filter: $filter) {
    id
    name
    price
    images
  }
}
\`\`\`

## Mutations

### Create Order

\`\`\`graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    total
  }
}
\`\`\``,
          type: 'API_REFERENCE' as GuideType,
          category: 'API',
          tags: ['graphql', 'api', 'reference'],
          difficulty: 'Intermediate',
          isPublished: true,
          publishedAt: new Date(),
          parentId: devGuideParent.id,
          orderIndex: 1,
          viewCount: 278,
          helpfulCount: 98,
          notHelpfulCount: 5,
          readingTime: 20,
        },
        {
          title: 'Setup Development Environment',
          slug: 'developer-setup',
          description: 'Hướng dẫn cài đặt môi trường phát triển',
          content: `# Setup Development Environment

## Prerequisites

- Node.js 20+
- Bun 1.0+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

## Installation

\`\`\`bash
# Clone repository
git clone https://github.com/your-repo.git

# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Run migrations
bun run db:migrate

# Start dev server
bun run dev
\`\`\`

## Project Structure

\`\`\`
├── backend/
│   ├── src/
│   └── prisma/
├── frontend/
│   ├── src/
│   └── public/
└── docker/
\`\`\``,
          type: 'TUTORIAL' as GuideType,
          category: 'Setup',
          tags: ['setup', 'environment', 'installation'],
          difficulty: 'Intermediate',
          isPublished: true,
          publishedAt: new Date(),
          parentId: devGuideParent.id,
          orderIndex: 2,
          viewCount: 412,
          helpfulCount: 156,
          notHelpfulCount: 7,
          readingTime: 15,
        },
      ],
    });

    // 3. Video Tutorials
    await prisma.systemGuide.createMany({
      data: [
        {
          title: 'Video: Bắt đầu với hệ thống',
          slug: 'video-getting-started',
          description: 'Video hướng dẫn từng bước cho người mới bắt đầu',
          content: `# Video: Bắt đầu với hệ thống

## Giới thiệu

Video này sẽ hướng dẫn bạn các bước cơ bản để bắt đầu sử dụng hệ thống.

## Nội dung video

1. Đăng ký tài khoản (00:00 - 02:30)
2. Thiết lập profile (02:30 - 05:00)
3. Tìm kiếm sản phẩm (05:00 - 08:00)
4. Đặt hàng đầu tiên (08:00 - 12:00)

## Video

[Xem video trên YouTube](https://youtube.com/watch?v=example)

## Tài liệu tham khảo

- [Hướng dẫn text](/guides/user-guide)
- [FAQ](/guides/faq)`,
          type: 'VIDEO_GUIDE' as GuideType,
          category: 'Getting Started',
          tags: ['video', 'tutorial', 'beginner'],
          difficulty: 'Beginner',
          isPublished: true,
          publishedAt: new Date(),
          videoUrl: 'https://youtube.com/watch?v=example',
          orderIndex: 3,
          viewCount: 523,
          helpfulCount: 234,
          notHelpfulCount: 12,
          readingTime: 12,
        },
        {
          title: 'Video: Tích hợp API',
          slug: 'video-api-integration',
          description: 'Hướng dẫn tích hợp API qua video',
          content: `# Video: Tích hợp API

## Tổng quan

Video này hướng dẫn cách tích hợp API của hệ thống vào ứng dụng của bạn.

## Nội dung

1. Setup authentication (00:00 - 05:00)
2. Gọi API queries (05:00 - 10:00)
3. Xử lý mutations (10:00 - 15:00)
4. Error handling (15:00 - 18:00)

## Code examples

Repository: [github.com/example/api-integration](https://github.com/example)

## Video

[Xem video](https://youtube.com/watch?v=api-example)`,
          type: 'VIDEO_GUIDE' as GuideType,
          category: 'API',
          tags: ['video', 'api', 'integration'],
          difficulty: 'Advanced',
          isPublished: true,
          publishedAt: new Date(),
          videoUrl: 'https://youtube.com/watch?v=api-example',
          orderIndex: 4,
          viewCount: 387,
          helpfulCount: 178,
          notHelpfulCount: 15,
          readingTime: 18,
        },
      ],
    });

    // 4. FAQs
    const faqParent = await prisma.systemGuide.create({
      data: {
        title: 'Câu hỏi thường gặp (FAQ)',
        slug: 'faq',
        description: 'Các câu hỏi thường gặp và câu trả lời',
        content: `# Câu hỏi thường gặp

Tổng hợp các câu hỏi thường gặp từ người dùng.

## Tài khoản

- Làm sao để đăng ký?
- Quên mật khẩu?
- Bảo mật tài khoản

## Đơn hàng

- Theo dõi đơn hàng
- Hủy đơn hàng
- Đổi trả sản phẩm

## Thanh toán

- Phương thức thanh toán
- Bảo mật thanh toán
- Hoàn tiền`,
        type: 'FAQ' as GuideType,
        category: 'Support',
        tags: ['faq', 'help', 'questions'],
        difficulty: 'Beginner',
        isPublished: true,
        publishedAt: new Date(),
        orderIndex: 5,
        viewCount: 678,
        helpfulCount: 312,
        notHelpfulCount: 18,
        readingTime: 10,
      },
    });

    // FAQ children
    await prisma.systemGuide.createMany({
      data: [
        {
          title: 'FAQ: Tài khoản và bảo mật',
          slug: 'faq-account',
          description: 'Câu hỏi về tài khoản, đăng nhập và bảo mật',
          content: `# FAQ: Tài khoản và bảo mật

## Làm sao để đăng ký tài khoản?

1. Click vào nút "Đăng ký" ở góc trên
2. Điền email và mật khẩu
3. Xác nhận email

## Quên mật khẩu?

1. Click "Quên mật khẩu" tại trang đăng nhập
2. Nhập email đã đăng ký
3. Làm theo hướng dẫn trong email

## Tài khoản có an toàn không?

Chúng tôi sử dụng:
- Mã hóa SSL/TLS
- Two-factor authentication (2FA)
- Mã hóa mật khẩu với bcrypt`,
          type: 'FAQ' as GuideType,
          category: 'Account',
          tags: ['account', 'security', 'login'],
          difficulty: 'Beginner',
          isPublished: true,
          publishedAt: new Date(),
          parentId: faqParent.id,
          orderIndex: 1,
          viewCount: 445,
          helpfulCount: 198,
          notHelpfulCount: 9,
          readingTime: 5,
        },
        {
          title: 'FAQ: Đơn hàng và giao hàng',
          slug: 'faq-orders',
          description: 'Câu hỏi về đơn hàng, vận chuyển và giao hàng',
          content: `# FAQ: Đơn hàng và giao hàng

## Làm sao theo dõi đơn hàng?

1. Đăng nhập vào tài khoản
2. Vào "Đơn hàng của tôi"
3. Xem chi tiết từng đơn

## Thời gian giao hàng?

- Nội thành: 1-2 ngày
- Ngoại thành: 3-5 ngày
- Tỉnh xa: 5-7 ngày

## Có thể hủy đơn không?

Có thể hủy trong vòng 24h sau khi đặt.`,
          type: 'FAQ' as GuideType,
          category: 'Orders',
          tags: ['orders', 'shipping', 'delivery'],
          difficulty: 'Beginner',
          isPublished: true,
          publishedAt: new Date(),
          parentId: faqParent.id,
          orderIndex: 2,
          viewCount: 556,
          helpfulCount: 267,
          notHelpfulCount: 14,
          readingTime: 7,
        },
      ],
    });

    const guidesCount = await prisma.systemGuide.count();
    console.log(`✅ Created ${guidesCount} guides successfully`);

    // Summary
    const guidesByType = await prisma.systemGuide.groupBy({
      by: ['type'],
      _count: true,
    });

    console.log('\n📊 Guides Summary:');
    guidesByType.forEach((group) => {
      console.log(`   ${group.type}: ${group._count} guides`);
    });

    console.log('\n✅ Guides seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding guides:', error);
    throw error;
  }
}

// Run seeding
seedGuides()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
