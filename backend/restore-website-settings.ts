import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Restore WebsiteSetting with default values
 */
async function restoreWebsiteSettings() {
  console.log('🚀 Restoring WebsiteSetting data...\n');

  try {
    // Check if WebsiteSetting table exists
    const settings = await prisma.websiteSetting.findMany();
    console.log(`📊 Current WebsiteSetting records: ${settings.length}`);

    if (settings.length > 0) {
      console.log('✅ WebsiteSetting already has data');
      console.log('\n📋 Existing settings:');
      settings.forEach((setting, i) => {
        console.log(`${i + 1}. ${setting.key} = ${setting.value}`);
      });
      return;
    }

    // Restore default settings
    const defaultSettings = [
      // General Site Settings
      {
        key: 'site_name',
        value: 'Shop Rau Sạch',
        category: 'general',
        description: 'Website name',
        type: 'string',
      },
      {
        key: 'site_title',
        value: 'Shop Rau Sạch - Rau Hữu Cơ Trực Tiếp Từ Nông Trại',
        category: 'general',
        description: 'Page title for SEO',
        type: 'string',
      },
      {
        key: 'site_description',
        value: 'Cửa hàng rau sạch, rau hữu cơ, được trồng an toàn và tuyệt đối sạch sẽ',
        category: 'general',
        description: 'Site meta description',
        type: 'string',
      },
      {
        key: 'site_logo',
        value: '/images/logo.png',
        category: 'general',
        description: 'Logo URL',
        type: 'string',
      },
      {
        key: 'site_favicon',
        value: '/images/favicon.ico',
        category: 'general',
        description: 'Favicon URL',
        type: 'string',
      },
      {
        key: 'homepage_url',
        value: '/',
        category: 'general',
        description: 'Custom homepage URL',
        type: 'string',
      },
      {
        key: 'offline',
        value: 'false',
        category: 'general',
        description: 'Is website offline for maintenance',
        type: 'boolean',
      },
      {
        key: 'offline_message',
        value: 'Website đang bảo trì. Vui lòng quay lại sau.',
        category: 'general',
        description: 'Message shown when site is offline',
        type: 'string',
      },

      // Contact Settings
      {
        key: 'contact_email',
        value: 'contact@shoprausach.com',
        category: 'contact',
        description: 'Main contact email',
        type: 'string',
      },
      {
        key: 'contact_phone',
        value: '+84 912 345 678',
        category: 'contact',
        description: 'Main contact phone',
        type: 'string',
      },
      {
        key: 'contact_address',
        value: 'Số 123 Đường Lê Lợi, Quận 1, Thành phố Hồ Chí Minh',
        category: 'contact',
        description: 'Business address',
        type: 'string',
      },
      {
        key: 'contact_hours',
        value: 'Thứ Hai - Chủ Nhật: 8:00 - 18:00',
        category: 'contact',
        description: 'Business hours',
        type: 'string',
      },

      // Social Media Settings
      {
        key: 'social_facebook',
        value: 'https://facebook.com/shoprausach',
        category: 'social',
        description: 'Facebook page URL',
        type: 'string',
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/shoprausach',
        category: 'social',
        description: 'Instagram profile URL',
        type: 'string',
      },
      {
        key: 'social_tiktok',
        value: 'https://tiktok.com/@shoprausach',
        category: 'social',
        description: 'TikTok profile URL',
        type: 'string',
      },
      {
        key: 'social_youtube',
        value: 'https://youtube.com/shoprausach',
        category: 'social',
        description: 'YouTube channel URL',
        type: 'string',
      },
      {
        key: 'social_zalo',
        value: '0912345678',
        category: 'social',
        description: 'Zalo OA number',
        type: 'string',
      },

      // Email Settings
      {
        key: 'email_from_name',
        value: 'Shop Rau Sạch',
        category: 'email',
        description: 'Email sender name',
        type: 'string',
      },
      {
        key: 'email_from_address',
        value: 'noreply@shoprausach.com',
        category: 'email',
        description: 'Email sender address',
        type: 'string',
      },

      // SEO Settings
      {
        key: 'seo_robots',
        value: 'index, follow',
        category: 'seo',
        description: 'Robots meta tag',
        type: 'string',
      },
      {
        key: 'seo_keywords',
        value: 'rau sạch, rau hữu cơ, rau an toàn, cửa hàng rau',
        category: 'seo',
        description: 'Meta keywords',
        type: 'string',
      },
      {
        key: 'seo_og_image',
        value: '/images/og-image.png',
        category: 'seo',
        description: 'OpenGraph image URL',
        type: 'string',
      },

      // Theme Settings
      {
        key: 'theme_color_primary',
        value: '#22c55e',
        category: 'theme',
        description: 'Primary brand color',
        type: 'string',
      },
      {
        key: 'theme_color_secondary',
        value: '#16a34a',
        category: 'theme',
        description: 'Secondary brand color',
        type: 'string',
      },
      {
        key: 'theme_logo_width',
        value: '200',
        category: 'theme',
        description: 'Logo width in pixels',
        type: 'number',
      },

      // Payment Settings
      {
        key: 'payment_methods',
        value: 'credit_card,bank_transfer,cash_on_delivery,e_wallet',
        category: 'payment',
        description: 'Enabled payment methods',
        type: 'string',
      },

      // Features Settings
      {
        key: 'features_blog_enabled',
        value: 'true',
        category: 'features',
        description: 'Enable blog feature',
        type: 'boolean',
      },
      {
        key: 'features_lms_enabled',
        value: 'true',
        category: 'features',
        description: 'Enable LMS (Learning Management System)',
        type: 'boolean',
      },
      {
        key: 'features_affiliate_enabled',
        value: 'true',
        category: 'features',
        description: 'Enable affiliate program',
        type: 'boolean',
      },
      {
        key: 'features_reviews_enabled',
        value: 'true',
        category: 'features',
        description: 'Enable product reviews',
        type: 'boolean',
      },

      // Auth & Redirect Settings
      {
        key: 'auth_login_redirect',
        value: '/dashboard',
        category: 'auth',
        description: 'Redirect URL after successful login',
        type: 'string',
      },
      {
        key: 'auth_logout_redirect',
        value: '/',
        category: 'auth',
        description: 'Redirect URL after logout',
        type: 'string',
      },
      {
        key: 'auth_register_redirect',
        value: '/welcome',
        category: 'auth',
        description: 'Redirect URL after successful registration',
        type: 'string',
      },
      {
        key: 'auth_role_based_redirect',
        value: 'true',
        category: 'auth',
        description: 'Enable role-based redirect (ADMIN -> /admin, USER -> /dashboard)',
        type: 'boolean',
      },
      {
        key: 'auth_redirect_admin',
        value: '/admin',
        category: 'auth',
        description: 'Redirect URL for ADMIN role after login',
        type: 'string',
      },
      {
        key: 'auth_redirect_user',
        value: '/dashboard',
        category: 'auth',
        description: 'Redirect URL for USER role after login',
        type: 'string',
      },
      {
        key: 'auth_redirect_guest',
        value: '/courses',
        category: 'auth',
        description: 'Redirect URL for GUEST role after login',
        type: 'string',
      },
    ];

    console.log(`📝 Inserting ${defaultSettings.length} default settings...\n`);

    // Insert settings one by one
    for (const setting of defaultSettings) {
      try {
        const created = await prisma.websiteSetting.create({
          data: setting as any,
        });
        console.log(`✅ Created: ${setting.key}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Already exists: ${setting.key}`);
        } else {
          console.log(`❌ Error creating ${setting.key}: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 WebsiteSetting restoration completed!');

    // Show all settings
    const allSettings = await prisma.websiteSetting.findMany();
    console.log(`\n📊 Total settings now: ${allSettings.length}`);
    console.log('\n📋 All settings:');
    allSettings.forEach((s, i) => {
      const valueStr = s.value ? s.value.substring(0, 50) : '(empty)';
      console.log(`${i + 1}. ${s.key.padEnd(30)} = ${valueStr}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreWebsiteSettings();
