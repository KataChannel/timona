import { PrismaClient, SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSupportTickets() {
  console.log('🌱 Seeding Support Tickets...');

  // Get or create a test user
  let testUser = await prisma.user.findUnique({
    where: { email: 'user@test.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: '$2b$10$YourHashedPasswordHere', // You need to hash this
      },
    });
    console.log('✅ Created test user:', testUser.email);
  }

  const tickets = [
    {
      subject: 'Không thể đăng nhập vào hệ thống',
      description:
        'Tôi đã thử đăng nhập nhiều lần nhưng hệ thống báo lỗi "Invalid credentials". Tôi đã reset password nhưng vẫn không được.',
      category: SupportTicketCategory.TECHNICAL,
      priority: SupportTicketPriority.HIGH,
      status: SupportTicketStatus.OPEN,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      environment: 'Production',
      browserInfo: 'Chrome 120.0',
      osInfo: 'Windows 11',
      deviceInfo: 'Desktop',
      tags: ['login', 'authentication'],
    },
    {
      subject: 'Lỗi upload file lớn hơn 10MB',
      description:
        'Khi tôi upload file PDF kích thước 15MB thì hệ thống báo lỗi. Có thể tăng giới hạn file size không?',
      category: SupportTicketCategory.FEATURE_REQUEST,
      priority: SupportTicketPriority.MEDIUM,
      status: SupportTicketStatus.IN_PROGRESS,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      environment: 'Production',
      browserInfo: 'Firefox 121.0',
      osInfo: 'macOS 14',
      deviceInfo: 'MacBook Pro',
      tags: ['upload', 'file-size'],
      firstResponseAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastResponseAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      subject: 'Đề xuất thêm tính năng Dark Mode',
      description:
        'Mong rằng hệ thống có thể thêm chế độ Dark Mode để sử dụng ban đêm cho dễ nhìn.',
      category: SupportTicketCategory.FEATURE_REQUEST,
      priority: SupportTicketPriority.LOW,
      status: SupportTicketStatus.OPEN,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      tags: ['feature', 'ui', 'dark-mode'],
    },
    {
      subject: 'Lỗi hiển thị sai giá sản phẩm',
      description:
        'Sản phẩm XYZ hiển thị giá 100.000đ nhưng khi checkout lại là 150.000đ. Vui lòng kiểm tra.',
      category: SupportTicketCategory.BUG_REPORT,
      priority: SupportTicketPriority.CRITICAL,
      status: SupportTicketStatus.IN_PROGRESS,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      relatedUrl: '/products/xyz',
      environment: 'Production',
      browserInfo: 'Safari 17.0',
      osInfo: 'iOS 17',
      deviceInfo: 'iPhone 15 Pro',
      tags: ['bug', 'pricing', 'checkout'],
      firstResponseAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      lastResponseAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      subject: 'Câu hỏi về chính sách hoàn trả',
      description:
        'Tôi muốn biết chính sách hoàn trả của shop như thế nào? Thời gian hoàn trả là bao lâu?',
      category: SupportTicketCategory.GENERAL_INQUIRY,
      priority: SupportTicketPriority.LOW,
      status: SupportTicketStatus.RESOLVED,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      tags: ['policy', 'refund'],
      resolution:
        'Chính sách hoàn trả trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem mác, chưa qua sử dụng.',
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      firstResponseAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      lastResponseAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      customerRating: 5,
      customerFeedback: 'Nhân viên hỗ trợ rất nhiệt tình. Cảm ơn!',
    },
    {
      subject: 'Không nhận được email xác nhận đơn hàng',
      description:
        'Đã đặt hàng từ hôm qua nhưng không thấy email xác nhận. Vui lòng kiểm tra giúp.',
      category: SupportTicketCategory.TECHNICAL,
      priority: SupportTicketPriority.MEDIUM,
      status: SupportTicketStatus.RESOLVED,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      tags: ['email', 'order', 'notification'],
      resolution: 'Email đã được gửi lại. Vui lòng kiểm tra cả hộp thư spam.',
      resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      firstResponseAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      lastResponseAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      customerRating: 4,
    },
    {
      subject: 'Cập nhật thông tin tài khoản bị lỗi',
      description:
        'Khi cập nhật số điện thoại trong tài khoản, hệ thống báo lỗi "Invalid phone number" mặc dù số điện thoại hợp lệ.',
      category: SupportTicketCategory.BUG_REPORT,
      priority: SupportTicketPriority.MEDIUM,
      status: SupportTicketStatus.WAITING_CUSTOMER,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      environment: 'Production',
      browserInfo: 'Edge 120.0',
      osInfo: 'Windows 10',
      tags: ['account', 'profile', 'bug'],
      firstResponseAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      lastResponseAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      subject: 'Tài khoản bị khóa không rõ lý do',
      description:
        'Tài khoản của tôi bị khóa đột ngột. Tôi không vi phạm điều gì cả. Vui lòng mở khóa giúp.',
      category: SupportTicketCategory.ACCOUNT,
      priority: SupportTicketPriority.CRITICAL,
      status: SupportTicketStatus.IN_PROGRESS,
      customerId: testUser.id,
      customerEmail: testUser.email,
      customerName: `${testUser.firstName} ${testUser.lastName}`,
      customerPhone: '0123456789',
      tags: ['account', 'security', 'locked'],
      firstResponseAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastResponseAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    },
  ];

  // Generate ticket numbers
  let ticketCount = (await prisma.technicalSupportTicket.count()) || 0;

  for (const ticketData of tickets) {
    try {
      ticketCount++;
      const ticketNumber = `TK-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${String(ticketCount).padStart(4, '0')}`;

      const ticket = await prisma.technicalSupportTicket.create({
        data: {
          ...ticketData,
          ticketNumber,
        },
      });

      console.log(`✅ Created ticket: ${ticket.ticketNumber} - ${ticket.subject}`);
    } catch (error: any) {
      console.error(`❌ Error creating ticket: ${ticketData.subject}`, error?.message || error);
    }
  }

  console.log('\n🎉 Support tickets seeding completed!');
  console.log('\nNote: You need to be logged in to view tickets at: http://localhost:12000/support');
}

seedSupportTickets()
  .catch((error) => {
    console.error('Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
