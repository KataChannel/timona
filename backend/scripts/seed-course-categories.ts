import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Starting course categories seeding...\n');

  // Danh sách categories chính cho đào tạo nhân viên
  const categories = [
    {
      name: 'Kỹ năng cơ bản',
      slug: 'basic-skills',
      description: 'Các khóa học về kỹ năng nền tảng cho nhân viên mới và nhân viên muốn củng cố kỹ năng cơ bản',
      icon: 'GraduationCap'
    },
    {
      name: 'Kỹ năng nâng cao',
      slug: 'advanced-skills',
      description: 'Các khóa học nâng cao cho nhân viên muốn phát triển chuyên môn và kỹ năng lãnh đạo',
      icon: 'Award'
    }
  ];

  console.log(`📚 Creating ${categories.length} main categories...\n`);

  for (const category of categories) {
    // Check if category exists
    const existing = await prisma.courseCategory.findUnique({
      where: { slug: category.slug }
    });

    if (existing) {
      console.log(`   ⏭️  Category "${category.name}" already exists, skipping...`);
      continue;
    }

    // Create category
    const created = await prisma.courseCategory.create({
      data: category
    });

    console.log(`   ✅ Created: ${created.name} (${created.slug})`);
  }

  console.log('\n🎯 Creating sub-categories...\n');

  // Sub-categories cho Kỹ năng cơ bản
  const basicSkillsParent = await prisma.courseCategory.findUnique({
    where: { slug: 'basic-skills' }
  });

  if (basicSkillsParent) {
    const basicSubCategories = [
      {
        name: 'Giao tiếp & Làm việc nhóm',
        slug: 'communication-teamwork',
        description: 'Kỹ năng giao tiếp hiệu quả, làm việc nhóm, xây dựng mối quan hệ',
        parentId: basicSkillsParent.id
      },
      {
        name: 'Quản lý thời gian',
        slug: 'time-management',
        description: 'Sắp xếp công việc, ưu tiên nhiệm vụ, tăng năng suất',
        parentId: basicSkillsParent.id
      },
      {
        name: 'Tư duy & Giải quyết vấn đề',
        slug: 'problem-solving',
        description: 'Tư duy logic, phân tích vấn đề, đưa ra giải pháp',
        parentId: basicSkillsParent.id
      },
      {
        name: 'Tin học văn phòng',
        slug: 'office-skills',
        description: 'Word, Excel, PowerPoint, Email, công cụ làm việc online',
        parentId: basicSkillsParent.id
      }
    ];

    for (const subCat of basicSubCategories) {
      const existing = await prisma.courseCategory.findUnique({
        where: { slug: subCat.slug }
      });

      if (!existing) {
        const created = await prisma.courseCategory.create({
          data: subCat
        });
        console.log(`   ✅ Created sub-category: ${created.name}`);
      }
    }
  }

  // Sub-categories cho Kỹ năng nâng cao
  const advancedSkillsParent = await prisma.courseCategory.findUnique({
    where: { slug: 'advanced-skills' }
  });

  if (advancedSkillsParent) {
    const advancedSubCategories = [
      {
        name: 'Lãnh đạo & Quản lý',
        slug: 'leadership-management',
        description: 'Kỹ năng lãnh đạo, quản lý nhóm, ra quyết định chiến lược',
        parentId: advancedSkillsParent.id
      },
      {
        name: 'Đàm phán & Thuyết phục',
        slug: 'negotiation-persuasion',
        description: 'Thương lượng, đàm phán hợp đồng, thuyết trình chuyên nghiệp',
        parentId: advancedSkillsParent.id
      },
      {
        name: 'Tư duy chiến lược',
        slug: 'strategic-thinking',
        description: 'Phân tích kinh doanh, lập kế hoạch dài hạn, quản trị rủi ro',
        parentId: advancedSkillsParent.id
      },
      {
        name: 'Đổi mới & Sáng tạo',
        slug: 'innovation-creativity',
        description: 'Tư duy đổi mới, quản lý thay đổi, xây dựng văn hóa sáng tạo',
        parentId: advancedSkillsParent.id
      }
    ];

    for (const subCat of advancedSubCategories) {
      const existing = await prisma.courseCategory.findUnique({
        where: { slug: subCat.slug }
      });

      if (!existing) {
        const created = await prisma.courseCategory.create({
          data: subCat
        });
        console.log(`   ✅ Created sub-category: ${created.name}`);
      }
    }
  }

  console.log('\n✅ Course categories seeding completed!\n');

  // Display summary
  const totalCategories = await prisma.courseCategory.count();
  const parentCategories = await prisma.courseCategory.count({
    where: { parentId: null }
  });
  const subCategories = await prisma.courseCategory.count({
    where: { parentId: { not: null } }
  });

  console.log('📊 Summary:');
  console.log(`   Total categories: ${totalCategories}`);
  console.log(`   Parent categories: ${parentCategories}`);
  console.log(`   Sub-categories: ${subCategories}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
