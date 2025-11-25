/**
 * Script kiểm tra và fix trang Về Chúng Tôi
 */

import { PrismaClient, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixAboutPage() {
  console.log('🔍 Kiểm tra trang Về Chúng Tôi...\n');

  try {
    const page = await prisma.page.findUnique({
      where: { slug: 've-chung-toi' },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            order: true,
            isVisible: true,
          }
        }
      }
    });

    if (!page) {
      console.log('❌ Không tìm thấy trang "Về Chúng Tôi"');
      return;
    }

    console.log('📄 Thông tin trang:');
    console.log('  - ID:', page.id);
    console.log('  - Title:', page.title);
    console.log('  - Slug:', page.slug);
    console.log('  - Status:', page.status);
    console.log('  - Published At:', page.publishedAt);
    console.log('  - Is Homepage:', page.isHomepage);
    console.log('  - Blocks:', page.blocks.length);
    console.log('');

    // Kiểm tra vấn đề
    const issues: string[] = [];
    
    if (page.status !== PageStatus.PUBLISHED) {
      issues.push(`Status không phải PUBLISHED (hiện tại: ${page.status})`);
    }
    
    if (!page.publishedAt) {
      issues.push('publishedAt chưa được set');
    }

    if (issues.length > 0) {
      console.log('⚠️  Phát hiện vấn đề:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('');
      console.log('🔧 Đang fix...');

      // Fix trang
      const updatedPage = await prisma.page.update({
        where: { id: page.id },
        data: {
          status: PageStatus.PUBLISHED,
          publishedAt: new Date(),
        }
      });

      console.log('✅ Đã fix thành công!');
      console.log('  - Status:', updatedPage.status);
      console.log('  - Published At:', updatedPage.publishedAt);
    } else {
      console.log('✅ Trang không có vấn đề!');
      console.log('');
      console.log('🌐 Trang có thể truy cập tại: http://localhost:12000/ve-chung-toi');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy
checkAndFixAboutPage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
