import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAppearanceToGeneral() {
  try {
    console.log('🔄 Đang chuyển APPEARANCE settings sang GENERAL...\n');

    // Update tất cả settings có category = APPEARANCE thành GENERAL
    const result = await prisma.websiteSetting.updateMany({
      where: {
        category: 'APPEARANCE'
      },
      data: {
        category: 'GENERAL'
      }
    });

    console.log(`✅ Đã cập nhật ${result.count} settings từ APPEARANCE sang GENERAL\n`);

    // Hiển thị danh sách settings đã cập nhật
    const updatedSettings = await prisma.websiteSetting.findMany({
      where: {
        key: {
          startsWith: 'appearance.'
        }
      },
      select: {
        key: true,
        label: true,
        category: true,
      }
    });

    console.log('📋 Danh sách settings đã cập nhật:');
    updatedSettings.forEach(s => {
      console.log(`  - ${s.key} (${s.label}) → ${s.category}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAppearanceToGeneral();
