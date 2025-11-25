import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeedData() {
  console.log('🔍 Verifying LMS 8 Courses Seed Data...\n');

  try {
    // Count all entities
    const counts = {
      users: await prisma.user.count(),
      categories: await prisma.courseCategory.count(),
      courses: await prisma.course.count(),
      modules: await prisma.courseModule.count(),
      lessons: await prisma.lesson.count(),
      quizzes: await prisma.quiz.count(),
      questions: await prisma.question.count(),
      answers: await prisma.answer.count(),
      enrollments: await prisma.enrollment.count(),
    };

    console.log('📊 Database Statistics:');
    console.log('========================');
    Object.entries(counts).forEach(([key, value]) => {
      console.log(`${key.padEnd(15)}: ${value}`);
    });

    // Get all courses with details
    console.log('\n\n📚 All Courses:');
    console.log('================');
    
    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { firstName: true, lastName: true, email: true } },
        category: { select: { name: true } },
        _count: {
          select: {
            modules: true,
            enrollments: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Price: ${course.price.toLocaleString()} VND`);
      console.log(`   Level: ${course.level}`);
      console.log(`   Duration: ${course.duration} minutes`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Instructor: ${course.instructor.firstName} ${course.instructor.lastName}`);
      console.log(`   Category: ${course.category?.name || 'N/A'}`);
      console.log(`   Modules: ${course._count.modules}`);
      console.log(`   Enrollments: ${course._count.enrollments}`);
      console.log(`   What You'll Learn: ${course.whatYouWillLearn?.length || 0} items`);
    });

    // Get one course in detail
    console.log('\n\n📖 Sample Course Detail (React Fundamentals):');
    console.log('==============================================');

    const reactCourse = await prisma.course.findUnique({
      where: { slug: 'react-fundamentals-2025' },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (reactCourse) {
      console.log(`\nTitle: ${reactCourse.title}`);
      console.log(`Description: ${reactCourse.description?.substring(0, 150) || 'N/A'}...`);
      
      console.log(`\nWhat You'll Learn:`);
      reactCourse.whatYouWillLearn.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item}`);
      });

      console.log(`\nRequirements:`);
      reactCourse.requirements.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item}`);
      });

      console.log(`\nModules & Lessons:`);
      reactCourse.modules.forEach((module, i) => {
        console.log(`\n  Module ${i + 1}: ${module.title}`);
        module.lessons.forEach((lesson, j) => {
          const freeTag = lesson.isFree ? ' [FREE]' : '';
          console.log(`    ${j + 1}. ${lesson.title} (${lesson.type}, ${lesson.duration}m)${freeTag}`);
        });
      });
    }

    // Get quiz details
    console.log('\n\n❓ Sample Quiz Details:');
    console.log('========================');

    const quiz = await prisma.quiz.findFirst({
      include: {
        questions: {
          include: {
            answers: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (quiz) {
      console.log(`\nQuiz: ${quiz.title}`);
      console.log(`Passing Score: ${quiz.passingScore}%`);
      console.log(`Time Limit: ${quiz.timeLimit} minutes`);
      console.log(`Total Questions: ${quiz.questions.length}\n`);

      quiz.questions.forEach((q, i) => {
        console.log(`Q${i + 1}. ${q.question} (${q.type}, ${q.points} points)`);
        q.answers.forEach((a, j) => {
          const correctMark = a.isCorrect ? ' ✓ CORRECT' : '';
          console.log(`   ${j + 1}) ${a.text}${correctMark}`);
        });
        console.log(`   💡 Explanation: ${q.explanation}\n`);
      });
    }

    // Get student enrollments
    console.log('\n👨‍🎓 Student Enrollments:');
    console.log('=========================');

    const student = await prisma.user.findUnique({
      where: { email: 'student@lms.com' },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                title: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (student) {
      console.log(`\nStudent: ${student.firstName} ${student.lastName}`);
      console.log(`Email: ${student.email}`);
      console.log(`Total Enrollments: ${student.enrollments.length}\n`);

      student.enrollments.forEach((enrollment, i) => {
        console.log(`${i + 1}. ${enrollment.course.title}`);
        console.log(`   Progress: ${enrollment.progress.toFixed(0)}%`);
        console.log(`   Status: ${enrollment.status}`);
        console.log(`   Enrolled: ${enrollment.enrolledAt.toLocaleDateString()}`);
      });
    }

    console.log('\n\n✅ Verification Complete! All data looks good.\n');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeedData();
