import { PrismaClient, SettingType, SettingCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSEOSettings() {
  console.log('\n🔍 SEO SETTINGS MIGRATION');
  console.log('='.repeat(60));

  const seoSettings = [
    // Basic SEO
    {
      key: 'seo.site_name',
      value: 'Rau Sạch Trần Gia',
      category: SettingCategory.SEO,
      label: 'Tên website',
      description: 'Tên chính của website',
      type: SettingType.TEXT,
      group: 'basic',
      order: 1,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.site_tagline',
      value: 'Rau sạch, an toàn cho sức khỏe',
      category: SettingCategory.SEO,
      label: 'Tagline website',
      description: 'Slogan ngắn gọn của website',
      type: SettingType.TEXT,
      group: 'basic',
      order: 2,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.meta_title',
      value: 'Rau Sạch Trần Gia - Rau sạch, an toàn cho sức khỏe',
      category: SettingCategory.SEO,
      label: 'Meta Title',
      description: 'Tiêu đề hiển thị trên search engine và browser tab',
      type: SettingType.TEXT,
      group: 'meta',
      order: 3,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.meta_description',
      value: 'Chuyên cung cấp rau sạch, thực phẩm hữu cơ chất lượng cao, an toàn cho sức khỏe. Giao hàng tận nơi tại TP.HCM.',
      category: SettingCategory.SEO,
      label: 'Meta Description',
      description: 'Mô tả ngắn gọn hiển thị trên search engine',
      type: SettingType.TEXTAREA,
      group: 'meta',
      order: 4,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.keywords',
      value: 'rau sạch, rau hữu cơ, thực phẩm an toàn, rau sạch trần gia, rau sạch tphcm',
      category: SettingCategory.SEO,
      label: 'Keywords',
      description: 'Từ khóa SEO (phân cách bằng dấu phẩy)',
      type: SettingType.TEXTAREA,
      group: 'meta',
      order: 5,
      isPublic: true,
      isActive: true,
    },
    
    // Open Graph
    {
      key: 'seo.og_title',
      value: 'Rau Sạch Trần Gia',
      category: SettingCategory.SEO,
      label: 'OG Title',
      description: 'Tiêu đề khi share trên social media',
      type: SettingType.TEXT,
      group: 'opengraph',
      order: 6,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.og_description',
      value: 'Chuyên cung cấp rau sạch, thực phẩm hữu cơ chất lượng cao',
      category: SettingCategory.SEO,
      label: 'OG Description',
      description: 'Mô tả khi share trên social media',
      type: SettingType.TEXTAREA,
      group: 'opengraph',
      order: 7,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.og_image',
      value: '/og-image.png',
      category: SettingCategory.SEO,
      label: 'OG Image',
      description: 'Ảnh hiển thị khi share (1200x630px)',
      type: SettingType.IMAGE,
      group: 'opengraph',
      order: 8,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.og_type',
      value: 'website',
      category: SettingCategory.SEO,
      label: 'OG Type',
      description: 'Loại nội dung (website, article, product...)',
      type: SettingType.SELECT,
      group: 'opengraph',
      order: 9,
      isPublic: true,
      isActive: true,
      options: JSON.stringify(['website', 'article', 'product', 'blog']),
    },
    {
      key: 'seo.og_locale',
      value: 'vi_VN',
      category: SettingCategory.SEO,
      label: 'OG Locale',
      description: 'Ngôn ngữ và vùng',
      type: SettingType.TEXT,
      group: 'opengraph',
      order: 10,
      isPublic: true,
      isActive: true,
    },

    // Twitter Card
    {
      key: 'seo.twitter_card',
      value: 'summary_large_image',
      category: SettingCategory.SEO,
      label: 'Twitter Card Type',
      description: 'Loại card hiển thị trên Twitter',
      type: SettingType.SELECT,
      group: 'twitter',
      order: 11,
      isPublic: true,
      isActive: true,
      options: JSON.stringify(['summary', 'summary_large_image', 'app', 'player']),
    },
    {
      key: 'seo.twitter_title',
      value: 'Rau Sạch Trần Gia',
      category: SettingCategory.SEO,
      label: 'Twitter Title',
      description: 'Tiêu đề khi share trên Twitter',
      type: SettingType.TEXT,
      group: 'twitter',
      order: 12,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.twitter_description',
      value: 'Chuyên cung cấp rau sạch, thực phẩm hữu cơ chất lượng cao',
      category: SettingCategory.SEO,
      label: 'Twitter Description',
      description: 'Mô tả khi share trên Twitter',
      type: SettingType.TEXTAREA,
      group: 'twitter',
      order: 13,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.twitter_image',
      value: '/og-image.png',
      category: SettingCategory.SEO,
      label: 'Twitter Image',
      description: 'Ảnh hiển thị khi share trên Twitter',
      type: SettingType.IMAGE,
      group: 'twitter',
      order: 14,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.twitter_site',
      value: '@rausachtrangia',
      category: SettingCategory.SEO,
      label: 'Twitter Site Handle',
      description: 'Twitter handle của website (@username)',
      type: SettingType.TEXT,
      group: 'twitter',
      order: 15,
      isPublic: true,
      isActive: true,
    },

    // Robots & Indexing
    {
      key: 'seo.robots_index',
      value: 'true',
      category: SettingCategory.SEO,
      label: 'Cho phép index',
      description: 'Cho phép search engine index website',
      type: SettingType.BOOLEAN,
      group: 'robots',
      order: 16,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.robots_follow',
      value: 'true',
      category: SettingCategory.SEO,
      label: 'Cho phép follow links',
      description: 'Cho phép search engine follow links',
      type: SettingType.BOOLEAN,
      group: 'robots',
      order: 17,
      isPublic: true,
      isActive: true,
    },

    // Additional
    {
      key: 'seo.author',
      value: 'Rau Sạch Trần Gia Team',
      category: SettingCategory.SEO,
      label: 'Author',
      description: 'Tên tác giả/nhóm phát triển',
      type: SettingType.TEXT,
      group: 'additional',
      order: 18,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.canonical_url',
      value: '',
      category: SettingCategory.SEO,
      label: 'Canonical URL',
      description: 'URL chính thức (để tránh duplicate content)',
      type: SettingType.URL,
      group: 'additional',
      order: 19,
      isPublic: true,
      isActive: true,
    },

    // Icons
    {
      key: 'seo.icon_favicon',
      value: '/favicon.ico',
      category: SettingCategory.SEO,
      label: 'Favicon',
      description: 'Đường dẫn tới favicon.ico',
      type: SettingType.IMAGE,
      group: 'icons',
      order: 20,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.icon_shortcut',
      value: '/favicon-16x16.png',
      category: SettingCategory.SEO,
      label: 'Shortcut Icon',
      description: 'Đường dẫn tới shortcut icon (16x16px)',
      type: SettingType.IMAGE,
      group: 'icons',
      order: 21,
      isPublic: true,
      isActive: true,
    },
    {
      key: 'seo.icon_apple',
      value: '/apple-touch-icon.png',
      category: SettingCategory.SEO,
      label: 'Apple Touch Icon',
      description: 'Đường dẫn tới Apple touch icon (180x180px)',
      type: SettingType.IMAGE,
      group: 'icons',
      order: 22,
      isPublic: true,
      isActive: true,
    },
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const setting of seoSettings) {
    try {
      const existing = await prisma.websiteSetting.findUnique({
        where: { key: setting.key },
      });

      if (existing) {
        if (existing.label !== setting.label || existing.description !== setting.description) {
          await prisma.websiteSetting.update({
            where: { key: setting.key },
            data: {
              label: setting.label,
              description: setting.description,
              type: setting.type,
              group: setting.group,
              order: setting.order,
              options: setting.options,
            },
          });
          console.log(`✅ Updated: ${setting.key}`);
          updated++;
        } else {
          console.log(`⏭️  Skipped: ${setting.key} (no changes)`);
          skipped++;
        }
      } else {
        await prisma.websiteSetting.create({
          data: setting,
        });
        console.log(`✨ Created: ${setting.key}`);
        created++;
      }
    } catch (error: any) {
      console.error(`❌ Error with ${setting.key}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${seoSettings.length}`);
  console.log('='.repeat(60) + '\n');
}

seedSEOSettings()
  .catch((error) => {
    console.error('Error seeding SEO settings:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
