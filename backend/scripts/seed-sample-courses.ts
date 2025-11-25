import { PrismaClient, CourseLevel, CourseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Starting sample courses seeding...\n');

  // Find instructor
  let instructor = await prisma.user.findFirst({
    where: { roleType: 'ADMIN' }
  });

  if (!instructor) {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.error('❌ No users found. Please create users first.');
      return;
    }
    instructor = firstUser;
  }

  console.log(`👨‍🏫 Instructor: ${instructor.email}\n`);

  // Get all categories
  const categories = await prisma.courseCategory.findMany({
    where: { parentId: null } // Only parent categories
  });

  if (categories.length === 0) {
    console.error('❌ No categories found. Please run seed-course-categories.ts first.');
    return;
  }

  console.log(`📚 Found ${categories.length} categories\n`);

  // Sample courses data
  const coursesData = [
    // KỸ NĂNG CƠ BẢN (4 courses)
    {
      categorySlug: 'basic-skills',
      title: 'Kỹ năng giao tiếp hiệu quả trong công việc',
      slug: 'ky-nang-giao-tiep-hieu-qua',
      description: 'Học cách giao tiếp chuyên nghiệp, xây dựng mối quan hệ tốt với đồng nghiệp và khách hàng',
      thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
      price: 0,
      level: CourseLevel.BEGINNER,
      duration: 360,
      whatYouWillLearn: [
        'Nguyên tắc giao tiếp hiệu quả trong môi trường công sở',
        'Kỹ thuật lắng nghe tích cực và phản hồi xây dựng',
        'Giao tiếp qua email và tin nhắn chuyên nghiệp',
        'Xử lý xung đột và đưa ra phản hồi khó khăn'
      ],
      requirements: ['Không yêu cầu kiến thức trước'],
      targetAudience: ['Nhân viên mới', 'Nhân viên muốn cải thiện kỹ năng giao tiếp'],
      tags: ['giao tiếp', 'soft skills', 'communication', 'cơ bản']
    },
    {
      categorySlug: 'basic-skills',
      title: 'Quản lý thời gian và năng suất làm việc',
      slug: 'quan-ly-thoi-gian-nang-suat',
      description: 'Nâng cao hiệu quả công việc thông qua quản lý thời gian và sắp xếp ưu tiên hợp lý',
      thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
      price: 0,
      level: CourseLevel.BEGINNER,
      duration: 300,
      whatYouWillLearn: [
        'Các phương pháp quản lý thời gian hiệu quả (Pomodoro, Time Blocking)',
        'Sắp xếp ưu tiên công việc theo ma trận Eisenhower',
        'Sử dụng công cụ quản lý công việc (Trello, Asana, Notion)',
        'Xử lý nhiệm vụ và deadline hiệu quả'
      ],
      requirements: ['Không yêu cầu'],
      targetAudience: ['Nhân viên văn phòng', 'Người làm việc đa nhiệm'],
      tags: ['quản lý thời gian', 'productivity', 'time management']
    },
    {
      categorySlug: 'basic-skills',
      title: 'Tư duy logic và giải quyết vấn đề',
      slug: 'tu-duy-logic-giai-quyet-van-de',
      description: 'Phát triển tư duy phân tích, logic để giải quyết vấn đề công việc hiệu quả',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      price: 0,
      level: CourseLevel.BEGINNER,
      duration: 420,
      whatYouWillLearn: [
        'Quy trình phân tích và giải quyết vấn đề có hệ thống',
        'Kỹ thuật tư duy phê phán (Critical Thinking)',
        'Sử dụng công cụ phân tích: 5 Why, Fishbone, SWOT',
        'Ra quyết định dựa trên dữ liệu và logic'
      ],
      requirements: ['Không yêu cầu kiến thức trước'],
      targetAudience: ['Nhân viên các cấp', 'Người muốn nâng cao tư duy'],
      tags: ['problem solving', 'critical thinking', 'tư duy logic']
    },
    {
      categorySlug: 'basic-skills',
      title: 'Tin học văn phòng nâng cao',
      slug: 'tin-hoc-van-phong-nang-cao',
      description: 'Thành thạo Word, Excel, PowerPoint và các công cụ làm việc online hiện đại',
      thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      price: 500000,
      level: CourseLevel.BEGINNER,
      duration: 480,
      whatYouWillLearn: [
        'Excel nâng cao: Pivot Table, VLOOKUP, Macro',
        'PowerPoint: Thiết kế slide chuyên nghiệp',
        'Word: Quản lý tài liệu dài, Mail merge',
        'Google Workspace: Drive, Docs, Sheets, Meet'
      ],
      requirements: ['Biết sử dụng máy tính cơ bản'],
      targetAudience: ['Nhân viên văn phòng', 'Trợ lý hành chính'],
      tags: ['office skills', 'excel', 'powerpoint', 'word']
    },

    // KỸ NĂNG NÂNG CAO (4 courses)
    {
      categorySlug: 'advanced-skills',
      title: 'Kỹ năng lãnh đạo và quản lý nhóm',
      slug: 'ky-nang-lanh-dao-quan-ly-nhom',
      description: 'Phát triển kỹ năng lãnh đạo, quản lý nhóm và xây dựng đội nhóm hiệu suất cao',
      thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      price: 2500000,
      level: CourseLevel.ADVANCED,
      duration: 720,
      whatYouWillLearn: [
        'Các phong cách lãnh đạo và khi nào áp dụng',
        'Xây dựng và phát triển đội nhóm hiệu suất cao',
        'Coaching và mentoring nhân viên',
        'Quản lý xung đột và ra quyết định chiến lược'
      ],
      requirements: ['Có kinh nghiệm làm việc 2+ năm', 'Đang hoặc chuẩn bị quản lý nhóm'],
      targetAudience: ['Team Leader', 'Quản lý cấp trung', 'Supervisor'],
      tags: ['leadership', 'management', 'lãnh đạo', 'quản lý']
    },
    {
      categorySlug: 'advanced-skills',
      title: 'Đàm phán và thuyết phục chuyên nghiệp',
      slug: 'dam-phan-thuyet-phuc-chuyen-nghiep',
      description: 'Làm chủ nghệ thuật đàm phán, thương lượng và thuyết phục trong kinh doanh',
      thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
      price: 2200000,
      level: CourseLevel.ADVANCED,
      duration: 600,
      whatYouWillLearn: [
        'Nguyên tắc và chiến lược đàm phán hiệu quả',
        'Kỹ thuật thuyết phục và gây ảnh hưởng',
        'Đọc ngôn ngữ cơ thể và tâm lý đối phương',
        'Xử lý phản đối và đạt được thỏa thuận Win-Win'
      ],
      requirements: ['Có kinh nghiệm giao tiếp với khách hàng/đối tác'],
      targetAudience: ['Sales Manager', 'Business Development', 'Giám đốc kinh doanh'],
      tags: ['negotiation', 'persuasion', 'đàm phán', 'sales']
    },
    {
      categorySlug: 'advanced-skills',
      title: 'Tư duy chiến lược và lập kế hoạch kinh doanh',
      slug: 'tu-duy-chien-luoc-ke-hoach-kinh-doanh',
      description: 'Phát triển tư duy chiến lược, phân tích thị trường và lập kế hoạch dài hạn',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      price: 2800000,
      level: CourseLevel.ADVANCED,
      duration: 780,
      whatYouWillLearn: [
        'Phân tích SWOT, PESTLE và Porter 5 Forces',
        'Xây dựng chiến lược kinh doanh dài hạn',
        'Lập kế hoạch và phân bổ nguồn lực hiệu quả',
        'Quản trị rủi ro và kế hoạch dự phòng'
      ],
      requirements: ['Hiểu biết về kinh doanh cơ bản', 'Có kinh nghiệm quản lý 3+ năm'],
      targetAudience: ['Giám đốc', 'Quản lý cấp cao', 'Strategic Planner'],
      tags: ['strategic thinking', 'business planning', 'chiến lược']
    },
    {
      categorySlug: 'advanced-skills',
      title: 'Đổi mới sáng tạo và quản lý thay đổi',
      slug: 'doi-moi-sang-tao-quan-ly-thay-doi',
      description: 'Thúc đẩy đổi mới, quản lý thay đổi và xây dựng văn hóa sáng tạo trong tổ chức',
      thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
      price: 2400000,
      level: CourseLevel.ADVANCED,
      duration: 660,
      whatYouWillLearn: [
        'Quy trình Design Thinking và Innovation',
        'Kỹ thuật tạo ý tưởng sáng tạo (Brainstorming, SCAMPER)',
        'Quản lý thay đổi theo mô hình Kotter 8 bước',
        'Xây dựng văn hóa đổi mới trong doanh nghiệp'
      ],
      requirements: ['Có kinh nghiệm quản lý hoặc dẫn dắt dự án'],
      targetAudience: ['Innovation Manager', 'Change Agent', 'Lãnh đạo cấp cao'],
      tags: ['innovation', 'creativity', 'change management', 'đổi mới']
    }
  ];

  console.log(`🎓 Creating ${coursesData.length} sample courses...\n`);

  let created = 0;
  let skipped = 0;

  for (const courseData of coursesData) {
    // Find category
    const category = categories.find(c => c.slug === courseData.categorySlug);
    if (!category) {
      console.log(`   ⚠️  Category "${courseData.categorySlug}" not found, skipping...`);
      skipped++;
      continue;
    }

    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { slug: courseData.slug }
    });

    if (existing) {
      console.log(`   ⏭️  Course "${courseData.title}" already exists, skipping...`);
      skipped++;
      continue;
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        price: courseData.price,
        level: courseData.level,
        status: CourseStatus.PUBLISHED,
        duration: courseData.duration,
        language: 'vi',
        whatYouWillLearn: courseData.whatYouWillLearn,
        requirements: courseData.requirements,
        targetAudience: courseData.targetAudience,
        tags: courseData.tags,
        categoryId: category.id,
        instructorId: instructor.id,
        publishedAt: new Date()
      }
    });

    console.log(`   ✅ Created: ${course.title} (${category.name})`);
    created++;
  }

  console.log('\n✅ Sample courses seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${coursesData.length}`);

  // Display courses by category
  console.log('\n📚 Courses by category:');
  for (const category of categories) {
    const count = await prisma.course.count({
      where: { categoryId: category.id }
    });
    console.log(`   ${category.name}: ${count} courses`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
