import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGiangvienRedirect() {
  try {
    console.log('🔐 Seeding GIANGVIEN redirect setting...\n');

    const setting = await prisma.websiteSetting.upsert({
      where: { key: 'auth_redirect_giangvien' },
      update: {
        value: '/giangvien/courses',
      },
      create: {
        key: 'auth_redirect_giangvien',
        label: 'Redirect cho GIANGVIEN',
        value: '/giangvien/courses',
        description: 'URL chuyển hướng cho GIANGVIEN role sau khi đăng nhập',
        type: 'TEXT',
        category: 'AUTH',
        group: 'redirect',
        order: 5,
        isActive: true,
        isPublic: true,
      },
    });

    console.log('✅ Created/Updated: auth_redirect_giangvien =', setting.value);
    console.log('\n✅ GIANGVIEN redirect setting seeding completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGiangvienRedirect();
