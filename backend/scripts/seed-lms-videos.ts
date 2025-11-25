import { PrismaClient, CourseLevel, CourseStatus, EnrollmentStatus, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLMSData() {
  console.log('🌱 Seeding LMS data with video URLs...');

  try {
    // 0. Create instructor user
    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@kata.com' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'instructor@kata.com',
        username: 'instructor',
        password: '$2b$10$aSKnfBzNGqovYEq4VCRDtuyXX4wC6nOj/bfmXBBGUVh4Z8eFcjd8i', // password: "password123"
        firstName: 'John',
        lastName: 'Instructor',
      },
    });

    console.log('✅ Instructor user created');

    // 1. Create categories
    const webDevCategory = await prisma.courseCategory.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learn web development from scratch',
        icon: '💻',
      },
    });

    const dataCategory = await prisma.courseCategory.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Master data science and machine learning',
        icon: '📊',
      },
    });

    const designCategory = await prisma.courseCategory.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX and graphic design courses',
        icon: '🎨',
      },
    });

    console.log('✅ Categories created');

    // 2. Create courses
    const reactCourse = await prisma.course.upsert({
      where: { slug: 'react-complete-guide' },
      update: {},
      create: {
        title: 'Complete React Developer Guide 2024',
        slug: 'react-complete-guide',
        description: 'Master React from fundamentals to advanced topics. Build real-world projects with hooks, context, and more.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        price: 49.99,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.PUBLISHED,
        duration: 1200, // 20 hours
        rating: 4.7,
        enrollmentCount: 12543,
        reviewCount: 3421,
        categoryId: webDevCategory.id,
        instructorId: '00000000-0000-0000-0000-000000000001', // Admin user
      },
    });

    const pythonCourse = await prisma.course.upsert({
      where: { slug: 'python-data-science' },
      update: {},
      create: {
        title: 'Python for Data Science & Machine Learning',
        slug: 'python-data-science',
        description: 'Learn Python programming and apply it to data science, machine learning, and AI.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
        price: 79.99,
        level: CourseLevel.INTERMEDIATE,
        status: CourseStatus.PUBLISHED,
        duration: 1800, // 30 hours
        rating: 4.8,
        enrollmentCount: 8765,
        reviewCount: 2134,
        categoryId: dataCategory.id,
        instructorId: '00000000-0000-0000-0000-000000000001',
      },
    });

    const uxCourse = await prisma.course.upsert({
      where: { slug: 'ux-design-fundamentals' },
      update: {},
      create: {
        title: 'UX Design Fundamentals',
        slug: 'ux-design-fundamentals',
        description: 'Master user experience design principles, research methods, and prototyping tools.',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        price: 0,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.PUBLISHED,
        duration: 600, // 10 hours
        rating: 4.5,
        enrollmentCount: 5432,
        reviewCount: 1234,
        categoryId: designCategory.id,
        instructorId: '00000000-0000-0000-0000-000000000001',
      },
    });

    const nodeCourse = await prisma.course.upsert({
      where: { slug: 'nodejs-advanced' },
      update: {},
      create: {
        title: 'Advanced Node.js Development',
        slug: 'nodejs-advanced',
        description: 'Build scalable backend applications with Node.js, Express, MongoDB, and microservices.',
        thumbnail: 'https://placehold.co/800x400',
        price: 89.99,
        level: CourseLevel.ADVANCED,
        status: CourseStatus.PUBLISHED,
        duration: 2400, // 40 hours
        rating: 4.9,
        enrollmentCount: 6789,
        reviewCount: 1987,
        categoryId: webDevCategory.id,
        instructorId: '00000000-0000-0000-0000-000000000001',
      },
    });

    console.log('✅ Courses created');

    // 3. Create modules with lessons (VIDEO type with actual URLs)
    
    // React Course Modules
    const reactModule1 = await prisma.courseModule.upsert({
      where: { id: 'react-module-1' },
      update: {},
      create: {
        id: 'react-module-1',
        title: 'React Fundamentals',
        description: 'Learn the basics of React',
        order: 1,
        courseId: reactCourse.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-1' },
      update: {},
      create: {
        id: 'react-lesson-1',
        title: 'Introduction to React',
        description: 'Understand what React is and why it is popular',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 15,
        order: 1,
        moduleId: reactModule1.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-2' },
      update: {},
      create: {
        id: 'react-lesson-2',
        title: 'Setting Up Development Environment',
        description: 'Install Node.js, npm, and create your first React app',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 20,
        order: 2,
        moduleId: reactModule1.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-3' },
      update: {},
      create: {
        id: 'react-lesson-3',
        title: 'JSX and Components',
        description: 'Learn JSX syntax and how to create React components',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 25,
        order: 3,
        moduleId: reactModule1.id,
      },
    });

    const reactModule2 = await prisma.courseModule.upsert({
      where: { id: 'react-module-2' },
      update: {},
      create: {
        id: 'react-module-2',
        title: 'React Hooks',
        description: 'Master useState, useEffect, and custom hooks',
        order: 2,
        courseId: reactCourse.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-4' },
      update: {},
      create: {
        id: 'react-lesson-4',
        title: 'useState Hook',
        description: 'Manage component state with useState',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: 30,
        order: 1,
        moduleId: reactModule2.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-5' },
      update: {},
      create: {
        id: 'react-lesson-5',
        title: 'useEffect Hook',
        description: 'Handle side effects in React components',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        duration: 35,
        order: 2,
        moduleId: reactModule2.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'react-lesson-6' },
      update: {},
      create: {
        id: 'react-lesson-6',
        title: 'Custom Hooks',
        description: 'Create reusable custom hooks',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        duration: 28,
        order: 3,
        moduleId: reactModule2.id,
      },
    });

    // Python Course Module
    const pythonModule1 = await prisma.courseModule.upsert({
      where: { id: 'python-module-1' },
      update: {},
      create: {
        id: 'python-module-1',
        title: 'Python Basics',
        description: 'Get started with Python programming',
        order: 1,
        courseId: pythonCourse.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'python-lesson-1' },
      update: {},
      create: {
        id: 'python-lesson-1',
        title: 'Python Installation',
        description: 'Install Python and set up your IDE',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        duration: 18,
        order: 1,
        moduleId: pythonModule1.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'python-lesson-2' },
      update: {},
      create: {
        id: 'python-lesson-2',
        title: 'Variables and Data Types',
        description: 'Learn about Python variables, strings, numbers, and booleans',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        duration: 22,
        order: 2,
        moduleId: pythonModule1.id,
      },
    });

    // UX Course Module
    const uxModule1 = await prisma.courseModule.upsert({
      where: { id: 'ux-module-1' },
      update: {},
      create: {
        id: 'ux-module-1',
        title: 'UX Principles',
        description: 'Core principles of user experience design',
        order: 1,
        courseId: uxCourse.id,
      },
    });

    await prisma.lesson.upsert({
      where: { id: 'ux-lesson-1' },
      update: {},
      create: {
        id: 'ux-lesson-1',
        title: 'What is UX?',
        description: 'Introduction to user experience design',
        type: LessonType.VIDEO,
        content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        duration: 12,
        order: 1,
        moduleId: uxModule1.id,
      },
    });

    console.log('✅ Modules and lessons created with video URLs');

    // 4. Create enrollments for admin user
    const adminId = '00000000-0000-0000-0000-000000000001';

    await prisma.enrollment.upsert({
      where: { id: 'enrollment-1' },
      update: {},
      create: {
        id: 'enrollment-1',
        userId: adminId,
        courseId: reactCourse.id,
        status: EnrollmentStatus.ACTIVE,
        progress: 33.33, // 2 out of 6 lessons completed
        enrolledAt: new Date('2024-01-15'),
      },
    });

    await prisma.enrollment.upsert({
      where: { id: 'enrollment-2' },
      update: {},
      create: {
        id: 'enrollment-2',
        userId: adminId,
        courseId: uxCourse.id,
        status: EnrollmentStatus.ACTIVE,
        progress: 0,
        enrolledAt: new Date('2024-02-01'),
      },
    });

    // Mark some lessons as completed
    await prisma.lessonProgress.upsert({
      where: { id: 'progress-1' },
      update: {},
      create: {
        id: 'progress-1',
        enrollmentId: 'enrollment-1',
        lessonId: 'react-lesson-1',
        completed: true,
        completedAt: new Date('2024-01-16'),
      },
    });

    await prisma.lessonProgress.upsert({
      where: { id: 'progress-2' },
      update: {},
      create: {
        id: 'progress-2',
        enrollmentId: 'enrollment-1',
        lessonId: 'react-lesson-2',
        completed: true,
        completedAt: new Date('2024-01-17'),
      },
    });

    console.log('✅ Enrollments and lesson progress created');

    console.log('');
    console.log('✨ LMS seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - 3 categories');
    console.log('  - 4 courses');
    console.log('  - 5 modules');
    console.log('  - 11 lessons with video URLs');
    console.log('  - 2 enrollments');
    console.log('  - 2 lesson progress records');
    console.log('');
    console.log('🎬 Test video URLs from Google sample videos:');
    console.log('  - BigBuckBunny, ElephantsDream, ForBigger series, Sintel, etc.');
    console.log('');
    console.log('🚀 Start the app and navigate to:');
    console.log('  - /courses - Browse courses');
    console.log('  - /courses/react-complete-guide - View course details');
    console.log('  - /learn/react-complete-guide - Start learning');
    console.log('  - /my-learning - See enrolled courses');

  } catch (error) {
    console.error('❌ Error seeding LMS data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLMSData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
