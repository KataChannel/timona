import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed Auth Redirect Settings
 */
async function seedAuthRedirectSettings() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 SEED AUTH REDIRECT SETTINGS');
  console.log('='.repeat(60) + '\n');

  try {
    const authSettings = [
      {
        key: 'auth_login_redirect',
        value: '/dashboard',
        category: 'AUTH',
        label: 'Redirect sau khi đăng nhập',
        description: 'URL chuyển hướng sau khi đăng nhập thành công',
        type: 'TEXT',
        group: 'redirect',
        order: 1,
        isPublic: true,
      },
      {
        key: 'auth_logout_redirect',
        value: '/',
        category: 'AUTH',
        label: 'Redirect sau khi đăng xuất',
        description: 'URL chuyển hướng sau khi đăng xuất',
        type: 'TEXT',
        group: 'redirect',
        order: 2,
        isPublic: true,
      },
      {
        key: 'auth_register_redirect',
        value: '/welcome',
        category: 'AUTH',
        label: 'Redirect sau khi đăng ký',
        description: 'URL chuyển hướng sau khi đăng ký thành công',
        type: 'TEXT',
        group: 'redirect',
        order: 3,
        isPublic: true,
      },
      {
        key: 'auth_role_based_redirect',
        value: 'true',
        category: 'AUTH',
        label: 'Bật redirect theo role',
        description: 'Cho phép chuyển hướng khác nhau dựa trên role user (ADMIN -> /admin, USER -> /dashboard)',
        type: 'BOOLEAN',
        group: 'redirect',
        order: 4,
        isPublic: true,
      },
      {
        key: 'auth_redirect_admin',
        value: '/admin',
        category: 'AUTH',
        label: 'Redirect cho ADMIN',
        description: 'URL chuyển hướng cho ADMIN role sau khi đăng nhập',
        type: 'TEXT',
        group: 'redirect',
        order: 5,
        isPublic: true,
      },
      {
        key: 'auth_redirect_user',
        value: '/dashboard',
        category: 'AUTH',
        label: 'Redirect cho USER',
        description: 'URL chuyển hướng cho USER role sau khi đăng nhập',
        type: 'TEXT',
        group: 'redirect',
        order: 6,
        isPublic: true,
      },
      {
        key: 'auth_redirect_guest',
        value: '/courses',
        category: 'AUTH',
        label: 'Redirect cho GUEST',
        description: 'URL chuyển hướng cho GUEST role sau khi đăng nhập',
        type: 'TEXT',
        group: 'redirect',
        order: 7,
        isPublic: true,
      },
    ];

    console.log(`📝 Seeding ${authSettings.length} auth redirect settings...\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const setting of authSettings) {
      try {
        // Check if exists
        const existing = await prisma.websiteSetting.findUnique({
          where: { key: setting.key }
        });

        if (existing) {
          // Update existing
          await prisma.websiteSetting.update({
            where: { key: setting.key },
            data: {
              value: setting.value,
              label: setting.label,
              description: setting.description,
              category: setting.category,
              type: setting.type,
              group: setting.group,
              order: setting.order,
              isPublic: setting.isPublic,
            }
          });
          console.log(`🔄 Updated: ${setting.key} = ${setting.value}`);
          updated++;
        } else {
          // Create new
          await prisma.websiteSetting.create({
            data: setting
          });
          console.log(`✅ Created: ${setting.key} = ${setting.value}`);
          created++;
        }
      } catch (error: any) {
        console.log(`❌ Error with ${setting.key}: ${error.message}`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`❌ Skipped: ${skipped}`);
    console.log(`📦 Total: ${authSettings.length}`);
    console.log('='.repeat(60) + '\n');

    // Display all auth settings
    console.log('🔐 ALL AUTH REDIRECT SETTINGS:\n');
    const allAuthSettings = await prisma.websiteSetting.findMany({
      where: {
        category: 'AUTH',
        group: 'redirect'
      },
      orderBy: { order: 'asc' }
    });

    allAuthSettings.forEach((s, i) => {
      console.log(`${i + 1}. ${s.label}`);
      console.log(`   Key: ${s.key}`);
      console.log(`   Value: ${s.value}`);
      console.log(`   Description: ${s.description}`);
      console.log('');
    });

    console.log('✅ Auth redirect settings seeding completed!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAuthRedirectSettings()
  .catch((e) => {
    console.error('Seed failed');
    process.exit(1);
  });
