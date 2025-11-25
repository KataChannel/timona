import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding auth_redirect_giangvien setting...');

  const setting = await prisma.websiteSetting.upsert({
    where: {
      key: 'auth_redirect_giangvien',
    },
    update: {
      value: '/lms/instructor',
      isActive: true,
      isPublic: true,
      updatedAt: new Date(),
    },
    create: {
      key: 'auth_redirect_giangvien',
      value: '/lms/instructor',
      type: 'TEXT',
      category: 'AUTH',
      label: 'Redirect Giảng viên',
      description: 'URL redirect sau khi giảng viên đăng nhập',
      group: 'redirect',
      order: 5,
      isActive: true,
      isPublic: true,
    },
  });

  console.log('✅ Setting created/updated:', setting);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
