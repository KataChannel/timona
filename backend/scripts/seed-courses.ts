import { PrismaClient, CourseLevel, CourseStatus, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting course seeding...\n');

  // Find users by email
  const user1 = await prisma.user.findUnique({
    where: { email: 'foxmelanie77@gmail.com' }
  });

  const user2 = await prisma.user.findUnique({
    where: { email: 'phanngocdanthanh94@gmail.com' }
  });

  if (!user1 || !user2) {
    console.error('❌ Users not found. Please ensure both users exist:');
    console.error('   - foxmelanie77@gmail.com');
    console.error('   - phanngocdanthanh94@gmail.com');
    return;
  }

  console.log('✅ Found users:');
  console.log(`   - ${user1.email} (${user1.id})`);
  console.log(`   - ${user2.email} (${user2.id})\n`);

  // Find or create instructor (admin user)
  let instructor = await prisma.user.findFirst({
    where: { roleType: 'ADMIN' }
  });

  if (!instructor) {
    console.log('⚠️  No admin found, using first user as instructor');
    instructor = user1;
  }

  console.log(`📚 Instructor: ${instructor.email}\n`);

  // Find or create beauty category
  let beautyCategory = await prisma.courseCategory.findFirst({
    where: { name: 'Làm đẹp' }
  });

  if (!beautyCategory) {
    console.log('Creating beauty category...');
    beautyCategory = await prisma.courseCategory.create({
      data: {
        name: 'Làm đẹp',
        slug: 'lam-dep',
        description: 'Các khóa học về chăm sóc sắc đẹp'
      }
    });
  }

  // Course 1: Chăm sóc da cơ bản
  console.log('📖 Creating Course 1: Chăm sóc da cơ bản...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Chăm sóc da cơ bản',
      slug: 'cham-soc-da-co-ban',
      description: 'Khóa học cung cấp kiến thức nền tảng về chăm sóc da, giúp bạn hiểu rõ về làn da của mình và cách chăm sóc đúng cách.',
      thumbnail: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
      trailer: 'https://www.youtube.com/watch?v=example1',
      price: 1500000,
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      duration: 480,
      language: 'vi',
      whatYouWillLearn: [
        'Hiểu về các loại da và cách nhận biết',
        'Quy trình chăm sóc da cơ bản',
        'Cách chọn sản phẩm phù hợp với loại da',
        'Kỹ thuật làm sạch và dưỡng ẩm đúng cách'
      ],
      requirements: [
        'Không yêu cầu kiến thức trước',
        'Có máy tính hoặc điện thoại để học online',
        'Mong muốn học hỏi về chăm sóc da'
      ],
      targetAudience: [
        'Người mới bắt đầu quan tâm đến chăm sóc da',
        'Người muốn hiểu rõ về làn da của mình',
        'Những người muốn có làn da khỏe đẹp'
      ],
      tags: ['chăm sóc da', 'skincare', 'làm đẹp', 'cơ bản'],
      categoryId: beautyCategory.id,
      instructorId: instructor.id,
      publishedAt: new Date()
    }
  });
  console.log(`   ✅ Created: ${course1.title}`);

  // Modules for Course 1
  const c1m1 = await prisma.courseModule.create({
    data: {
      title: 'Giới thiệu về chăm sóc da',
      description: 'Module giới thiệu tổng quan về chăm sóc da và tầm quan trọng',
      order: 0,
      courseId: course1.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Tại sao cần chăm sóc da?',
        description: 'Hiểu về tầm quan trọng của việc chăm sóc da',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson1-1',
        duration: 15,
        order: 0,
        moduleId: c1m1.id,
        isPreview: true,
        isFree: true
      },
      {
        title: 'Cấu trúc của làn da',
        description: 'Tìm hiểu về cấu trúc da và các lớp da',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson1-2',
        duration: 20,
        order: 1,
        moduleId: c1m1.id
      }
    ]
  });

  const c1m2 = await prisma.courseModule.create({
    data: {
      title: 'Các loại da và cách nhận biết',
      description: 'Học cách phân biệt và nhận diện các loại da',
      order: 1,
      courseId: course1.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Da thường - Da cân bằng',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson2-1',
        duration: 18,
        order: 0,
        moduleId: c1m2.id
      },
      {
        title: 'Da khô và cách chăm sóc',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson2-2',
        duration: 20,
        order: 1,
        moduleId: c1m2.id
      },
      {
        title: 'Da dầu và mụn',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson2-3',
        duration: 22,
        order: 2,
        moduleId: c1m2.id
      },
      {
        title: 'Da hỗn hợp - Đặc điểm và xử lý',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson2-4',
        duration: 20,
        order: 3,
        moduleId: c1m2.id
      }
    ]
  });

  const c1m3 = await prisma.courseModule.create({
    data: {
      title: 'Quy trình chăm sóc da hàng ngày',
      description: 'Quy trình chăm sóc da buổi sáng và tối',
      order: 2,
      courseId: course1.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Quy trình chăm sóc da buổi sáng',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson3-1',
        duration: 25,
        order: 0,
        moduleId: c1m3.id
      },
      {
        title: 'Quy trình chăm sóc da buổi tối',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson3-2',
        duration: 25,
        order: 1,
        moduleId: c1m3.id
      },
      {
        title: 'Cách sử dụng sản phẩm đúng cách',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=lesson3-3',
        duration: 30,
        order: 2,
        moduleId: c1m3.id
      }
    ]
  });

  // Enroll user1 to course1
  await prisma.enrollment.create({
    data: {
      userId: user1.id,
      courseId: course1.id,
      status: 'ACTIVE',
      progress: 0,
      paymentAmount: course1.price,
      paymentMethod: 'TRANSFER'
    }
  });
  console.log(`   ✅ Enrolled ${user1.email} to ${course1.title}\n`);

  // Course 2: Phun xăm chuyên sâu
  console.log('📖 Creating Course 2: Phun xăm chuyên sâu...');
  const course2 = await prisma.course.create({
    data: {
      title: 'Phun xăm thẩm mỹ chuyên sâu',
      slug: 'phun-xam-chuyen-sau',
      description: 'Khóa học chuyên sâu về phun xăm thẩm mỹ, từ lý thuyết đến thực hành, giúp bạn trở thành chuyên gia phun xăm chuyên nghiệp.',
      thumbnail: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800',
      trailer: 'https://www.youtube.com/watch?v=example2',
      price: 8500000,
      level: CourseLevel.ADVANCED,
      status: CourseStatus.PUBLISHED,
      duration: 1200,
      language: 'vi',
      whatYouWillLearn: [
        'Kiến thức nền tảng về phun xăm thẩm mỹ',
        'Kỹ thuật phun xăm chân mày, môi, mí mắt',
        'Cách phối màu và tạo hình chuẩn',
        'An toàn vệ sinh trong phun xăm',
        'Xử lý các trường hợp khó'
      ],
      requirements: [
        'Đã có kiến thức cơ bản về làm đẹp',
        'Có tâm huyết với nghề phun xăm',
        'Sẵn sàng thực hành và học tập'
      ],
      targetAudience: [
        'Người muốn trở thành chuyên gia phun xăm',
        'Thợ làm đẹp muốn nâng cao kỹ năng',
        'Người muốn mở tiệm phun xăm riêng'
      ],
      tags: ['phun xăm', 'phun thêu', 'chân mày', 'môi', 'mí mắt'],
      categoryId: beautyCategory.id,
      instructorId: instructor.id,
      publishedAt: new Date()
    }
  });
  console.log(`   ✅ Created: ${course2.title}`);

  const c2m1 = await prisma.courseModule.create({
    data: {
      title: 'Kiến thức nền tảng về phun xăm',
      description: 'Lý thuyết cơ bản về phun xăm thẩm mỹ',
      order: 0,
      courseId: course2.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Lịch sử và xu hướng phun xăm',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson1-1',
        duration: 30,
        order: 0,
        moduleId: c2m1.id,
        isPreview: true,
        isFree: true
      },
      {
        title: 'Các loại hình phun xăm',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson1-2',
        duration: 25,
        order: 1,
        moduleId: c2m1.id
      },
      {
        title: 'Thiết bị và dụng cụ phun xăm',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson1-3',
        duration: 35,
        order: 2,
        moduleId: c2m1.id
      },
      {
        title: 'Vệ sinh và an toàn',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson1-4',
        duration: 40,
        order: 3,
        moduleId: c2m1.id
      }
    ]
  });

  const c2m2 = await prisma.courseModule.create({
    data: {
      title: 'Phun xăm chân mày',
      description: 'Kỹ thuật phun xăm chân mày chuyên nghiệp',
      order: 1,
      courseId: course2.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Tướng học chân mày',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson2-1',
        duration: 45,
        order: 0,
        moduleId: c2m2.id
      },
      {
        title: 'Thiết kế và đo vẽ chân mày',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson2-2',
        duration: 50,
        order: 1,
        moduleId: c2m2.id
      },
      {
        title: 'Kỹ thuật phun xăm chân mày dáng lông',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson2-3',
        duration: 60,
        order: 2,
        moduleId: c2m2.id
      },
      {
        title: 'Kỹ thuật phun xăm chân mày phủ bóng',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson2-4',
        duration: 60,
        order: 3,
        moduleId: c2m2.id
      },
      {
        title: 'Xử lý chân mày khó',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson2-5',
        duration: 55,
        order: 4,
        moduleId: c2m2.id
      }
    ]
  });

  const c2m3 = await prisma.courseModule.create({
    data: {
      title: 'Phun xăm môi',
      description: 'Kỹ thuật phun xăm môi tự nhiên',
      order: 2,
      courseId: course2.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Tướng học môi',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson3-1',
        duration: 40,
        order: 0,
        moduleId: c2m3.id
      },
      {
        title: 'Thiết kế môi chuẩn tỷ lệ',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson3-2',
        duration: 45,
        order: 1,
        moduleId: c2m3.id
      },
      {
        title: 'Kỹ thuật phun xăm môi baby',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson3-3',
        duration: 65,
        order: 2,
        moduleId: c2m3.id
      },
      {
        title: 'Phối màu môi chuyên nghiệp',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson3-4',
        duration: 50,
        order: 3,
        moduleId: c2m3.id
      }
    ]
  });

  const c2m4 = await prisma.courseModule.create({
    data: {
      title: 'Phun xăm mí mắt',
      description: 'Kỹ thuật phun xăm mí mắt an toàn',
      order: 3,
      courseId: course2.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Giải phẫu mắt và mí mắt',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson4-1',
        duration: 35,
        order: 0,
        moduleId: c2m4.id
      },
      {
        title: 'Kỹ thuật phun mí mắt tự nhiên',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson4-2',
        duration: 55,
        order: 1,
        moduleId: c2m4.id
      },
      {
        title: 'An toàn trong phun mí mắt',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c2lesson4-3',
        duration: 40,
        order: 2,
        moduleId: c2m4.id
      }
    ]
  });

  await prisma.enrollment.create({
    data: {
      userId: user1.id,
      courseId: course2.id,
      status: 'ACTIVE',
      progress: 0,
      paymentAmount: course2.price,
      paymentMethod: 'TRANSFER'
    }
  });
  console.log(`   ✅ Enrolled ${user1.email} to ${course2.title}\n`);

  // Course 3: Chăm sóc da nâng cao
  console.log('📖 Creating Course 3: Chăm sóc da nâng cao...');
  const course3 = await prisma.course.create({
    data: {
      title: 'Chăm sóc da nâng cao',
      slug: 'cham-soc-da-nang-cao',
      description: 'Khóa học chuyên sâu về chăm sóc da, điều trị các vấn đề da liễu và kỹ thuật chăm sóc da chuyên nghiệp.',
      thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
      trailer: 'https://www.youtube.com/watch?v=example3',
      price: 3500000,
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      duration: 720,
      language: 'vi',
      whatYouWillLearn: [
        'Điều trị các vấn đề da chuyên sâu',
        'Kỹ thuật massage và chăm sóc da chuyên nghiệp',
        'Sử dụng máy móc trong chăm sóc da',
        'Xây dựng liệu trình điều trị',
        'Tư vấn khách hàng chuyên nghiệp'
      ],
      requirements: [
        'Đã hoàn thành khóa chăm sóc da cơ bản',
        'Có kiến thức nền về da liễu',
        'Mong muốn phát triển nghề nghiệp trong ngành làm đẹp'
      ],
      targetAudience: [
        'Chuyên viên spa muốn nâng cao kỹ năng',
        'Người muốn trở thành chuyên gia chăm sóc da',
        'Chủ spa muốn cải thiện dịch vụ'
      ],
      tags: ['chăm sóc da nâng cao', 'điều trị da', 'spa', 'skincare pro'],
      categoryId: beautyCategory.id,
      instructorId: instructor.id,
      publishedAt: new Date()
    }
  });
  console.log(`   ✅ Created: ${course3.title}`);

  const c3m1 = await prisma.courseModule.create({
    data: {
      title: 'Điều trị mụn chuyên sâu',
      description: 'Các phương pháp điều trị mụn hiệu quả',
      order: 0,
      courseId: course3.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Phân loại mụn và nguyên nhân',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson1-1',
        duration: 30,
        order: 0,
        moduleId: c3m1.id,
        isPreview: true,
        isFree: true
      },
      {
        title: 'Kỹ thuật làm sạch da chuyên sâu',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson1-2',
        duration: 40,
        order: 1,
        moduleId: c3m1.id
      },
      {
        title: 'Điều trị mụn bằng công nghệ',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson1-3',
        duration: 45,
        order: 2,
        moduleId: c3m1.id
      },
      {
        title: 'Xử lý th��흠 mụn và sẹo',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson1-4',
        duration: 50,
        order: 3,
        moduleId: c3m1.id
      }
    ]
  });

  const c3m2 = await prisma.courseModule.create({
    data: {
      title: 'Chống lão hóa và trẻ hóa da',
      description: 'Kỹ thuật chống lão hóa hiệu quả',
      order: 1,
      courseId: course3.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Cơ chế lão hóa da',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson2-1',
        duration: 35,
        order: 0,
        moduleId: c3m2.id
      },
      {
        title: 'Massage chống lão hóa',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson2-2',
        duration: 45,
        order: 1,
        moduleId: c3m2.id
      },
      {
        title: 'Công nghệ RF và Hifu',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson2-3',
        duration: 40,
        order: 2,
        moduleId: c3m2.id
      },
      {
        title: 'Sử dụng serum và mặt nạ chuyên sâu',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson2-4',
        duration: 38,
        order: 3,
        moduleId: c3m2.id
      }
    ]
  });

  const c3m3 = await prisma.courseModule.create({
    data: {
      title: 'Điều trị nám và tàn nhang',
      description: 'Phương pháp điều trị nám hiệu quả',
      order: 2,
      courseId: course3.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Phân loại nám và nguyên nhân',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson3-1',
        duration: 30,
        order: 0,
        moduleId: c3m3.id
      },
      {
        title: 'Liệu trình điều trị nám',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson3-2',
        duration: 45,
        order: 1,
        moduleId: c3m3.id
      },
      {
        title: 'Công nghệ laser trong điều trị nám',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson3-3',
        duration: 42,
        order: 2,
        moduleId: c3m3.id
      }
    ]
  });

  const c3m4 = await prisma.courseModule.create({
    data: {
      title: 'Tư vấn và xây dựng liệu trình',
      description: 'Kỹ năng tư vấn khách hàng chuyên nghiệp',
      order: 3,
      courseId: course3.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Kỹ năng tư vấn khách hàng',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson4-1',
        duration: 35,
        order: 0,
        moduleId: c3m4.id
      },
      {
        title: 'Xây dựng liệu trình cá nhân hóa',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson4-2',
        duration: 40,
        order: 1,
        moduleId: c3m4.id
      },
      {
        title: 'Quản lý khách hàng hiệu quả',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c3lesson4-3',
        duration: 30,
        order: 2,
        moduleId: c3m4.id
      }
    ]
  });

  await prisma.enrollment.create({
    data: {
      userId: user2.id,
      courseId: course3.id,
      status: 'ACTIVE',
      progress: 0,
      paymentAmount: course3.price,
      paymentMethod: 'TRANSFER'
    }
  });
  console.log(`   ✅ Enrolled ${user2.email} to ${course3.title}\n`);

  // Course 4: Nối mi chuyên nghiệp
  console.log('📖 Creating Course 4: Nối mi chuyên nghiệp...');
  const course4 = await prisma.course.create({
    data: {
      title: 'Nối mi chuyên nghiệp',
      slug: 'noi-mi-chuyen-nghiep',
      description: 'Khóa học toàn diện về nghệ thuật nối mi, từ cơ bản đến nâng cao, giúp bạn trở thành chuyên gia nối mi được khách hàng tin tưởng.',
      thumbnail: 'https://images.unsplash.com/photo-1583001809769-7ccb41ef3f72?w=800',
      trailer: 'https://www.youtube.com/watch?v=example4',
      price: 4500000,
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      duration: 900,
      language: 'vi',
      whatYouWillLearn: [
        'Các kỹ thuật nối mi cơ bản và nâng cao',
        'Thiết kế mi phù hợp với từng khuôn mặt',
        'Kỹ thuật nối mi Volume, Classic, Hybrid',
        'Chăm sóc và bảo quản mi',
        'Kỹ năng tư vấn và chăm sóc khách hàng'
      ],
      requirements: [
        'Có tay nghề khéo léo',
        'Kiên nhẫn và tỉ mỉ',
        'Yêu thích nghề làm đẹp'
      ],
      targetAudience: [
        'Người muốn học nghề nối mi',
        'Thợ làm đẹp muốn mở rộng dịch vụ',
        'Người muốn mở tiệm nối mi riêng'
      ],
      tags: ['nối mi', 'eyelash extension', 'volume lash', 'classic lash'],
      categoryId: beautyCategory.id,
      instructorId: instructor.id,
      publishedAt: new Date()
    }
  });
  console.log(`   ✅ Created: ${course4.title}`);

  const c4m1 = await prisma.courseModule.create({
    data: {
      title: 'Kiến thức nền tảng về nối mi',
      description: 'Lý thuyết cơ bản về nối mi và dụng cụ',
      order: 0,
      courseId: course4.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Giới thiệu về nghề nối mi',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson1-1',
        duration: 25,
        order: 0,
        moduleId: c4m1.id,
        isPreview: true,
        isFree: true
      },
      {
        title: 'Các loại mi và đặc điểm',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson1-2',
        duration: 30,
        order: 1,
        moduleId: c4m1.id
      },
      {
        title: 'Dụng cụ và vật liệu nối mi',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson1-3',
        duration: 35,
        order: 2,
        moduleId: c4m1.id
      },
      {
        title: 'Vệ sinh và an toàn',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson1-4',
        duration: 28,
        order: 3,
        moduleId: c4m1.id
      }
    ]
  });

  const c4m2 = await prisma.courseModule.create({
    data: {
      title: 'Kỹ thuật nối mi Classic',
      description: 'Kỹ thuật nối mi Classic cơ bản',
      order: 1,
      courseId: course4.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Nguyên lý nối mi Classic',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson2-1',
        duration: 30,
        order: 0,
        moduleId: c4m2.id
      },
      {
        title: 'Cách cầm nhíp và keo',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson2-2',
        duration: 35,
        order: 1,
        moduleId: c4m2.id
      },
      {
        title: 'Thực hành nối mi Classic cơ bản',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson2-3',
        duration: 60,
        order: 2,
        moduleId: c4m2.id
      },
      {
        title: 'Hoàn thiện và kiểm tra',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson2-4',
        duration: 40,
        order: 3,
        moduleId: c4m2.id
      }
    ]
  });

  const c4m3 = await prisma.courseModule.create({
    data: {
      title: 'Kỹ thuật nối mi Volume',
      description: 'Kỹ thuật nối mi Volume chuyên nghiệp',
      order: 2,
      courseId: course4.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Giới thiệu mi Volume',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson3-1',
        duration: 30,
        order: 0,
        moduleId: c4m3.id
      },
      {
        title: 'Kỹ thuật tạo chùm mi',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson3-2',
        duration: 50,
        order: 1,
        moduleId: c4m3.id
      },
      {
        title: 'Nối mi Volume 2D-3D',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson3-3',
        duration: 55,
        order: 2,
        moduleId: c4m3.id
      },
      {
        title: 'Nối mi Volume 4D-6D',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson3-4',
        duration: 60,
        order: 3,
        moduleId: c4m3.id
      },
      {
        title: 'Mega Volume và Russian Volume',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson3-5',
        duration: 65,
        order: 4,
        moduleId: c4m3.id
      }
    ]
  });

  const c4m4 = await prisma.courseModule.create({
    data: {
      title: 'Thiết kế và tạo kiểu mi',
      description: 'Nghệ thuật thiết kế mi đẹp',
      order: 3,
      courseId: course4.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Tướng học và phân tích khuôn mặt',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson4-1',
        duration: 40,
        order: 0,
        moduleId: c4m4.id
      },
      {
        title: 'Các kiểu mi phổ biến',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson4-2',
        duration: 45,
        order: 1,
        moduleId: c4m4.id
      },
      {
        title: 'Thiết kế mi phù hợp từng khách',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson4-3',
        duration: 50,
        order: 2,
        moduleId: c4m4.id
      },
      {
        title: 'Xu hướng mi hiện đại',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson4-4',
        duration: 35,
        order: 3,
        moduleId: c4m4.id
      }
    ]
  });

  const c4m5 = await prisma.courseModule.create({
    data: {
      title: 'Chăm sóc và tư vấn khách hàng',
      description: 'Kỹ năng chăm sóc khách hàng chuyên nghiệp',
      order: 4,
      courseId: course4.id
    }
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Hướng dẫn khách chăm sóc mi',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson5-1',
        duration: 30,
        order: 0,
        moduleId: c4m5.id
      },
      {
        title: 'Xử lý các trường hợp đặc biệt',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson5-2',
        duration: 35,
        order: 1,
        moduleId: c4m5.id
      },
      {
        title: 'Tư vấn và chăm sóc khách hàng',
        type: LessonType.VIDEO,
        content: 'https://www.youtube.com/watch?v=c4lesson5-3',
        duration: 28,
        order: 2,
        moduleId: c4m5.id
      }
    ]
  });

  await prisma.enrollment.create({
    data: {
      userId: user2.id,
      courseId: course4.id,
      status: 'ACTIVE',
      progress: 0,
      paymentAmount: course4.price,
      paymentMethod: 'TRANSFER'
    }
  });
  console.log(`   ✅ Enrolled ${user2.email} to ${course4.title}\n`);

  console.log('✨ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Created 4 courses`);
  console.log(`   - Created multiple modules per course`);
  console.log(`   - Created multiple lessons per module`);
  console.log(`   - Enrolled users to their respective courses`);
  console.log('\n🎉 All done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
