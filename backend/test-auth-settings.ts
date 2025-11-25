import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthSettings() {
  try {
    console.log('🔍 Kiểm tra AUTH settings trong database...\n');

    // 1. Count settings by category
    const categories = await prisma.websiteSetting.groupBy({
      by: ['category'],
      _count: true,
    });

    console.log('📊 Settings per category:');
    categories.forEach(c => {
      console.log(`  ${c.category}: ${c._count} settings`);
    });
    console.log('');

    // 2. Get AUTH settings
    const authSettings = await prisma.websiteSetting.findMany({
      where: {
        category: 'AUTH'
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        key: true,
        label: true,
        value: true,
        type: true,
        category: true,
        isActive: true,
        isPublic: true,
      }
    });

    console.log(`🔐 AUTH Settings (${authSettings.length} total):`);
    authSettings.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.label}`);
      console.log(`   Key: ${s.key}`);
      console.log(`   Value: ${s.value}`);
      console.log(`   Type: ${s.type}`);
      console.log(`   Category: ${s.category}`);
      console.log(`   Active: ${s.isActive}`);
      console.log(`   Public: ${s.isPublic}`);
    });

    if (authSettings.length === 0) {
      console.log('\n⚠️  Không tìm thấy AUTH settings!');
      console.log('💡 Chạy: bun run scripts/seed-auth-redirect-settings.ts');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuthSettings();
