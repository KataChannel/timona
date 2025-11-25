import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Course Summary Report\n');
  console.log('='.repeat(80));

  const courses = await prisma.course.findMany({
    include: {
      instructor: {
        select: { email: true, username: true }
      },
      modules: {
        include: {
          lessons: true
        },
        orderBy: { order: 'asc' }
      },
      enrollments: {
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true }
          }
        }
      },
      category: true
    },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  for (const course of courses) {
    console.log(`\n📖 ${course.title}`);
    console.log(`   Slug: ${course.slug}`);
    console.log(`   Price: ${Number(course.price).toLocaleString()} VNĐ`);
    console.log(`   Level: ${course.level}`);
    console.log(`   Status: ${course.status}`);
    console.log(`   Duration: ${course.duration} minutes`);
    console.log(`   Category: ${course.category?.name || 'N/A'}`);
    console.log(`   Instructor: ${course.instructor.email}`);
    
    console.log(`\n   📚 Modules (${course.modules.length}):`);
    for (const module of course.modules) {
      console.log(`      ${module.order + 1}. ${module.title} (${module.lessons.length} lessons)`);
      for (const lesson of module.lessons) {
        const preview = lesson.isPreview ? ' 🔓' : '';
        const free = lesson.isFree ? ' 💰' : '';
        console.log(`         ${lesson.order + 1}. ${lesson.title} - ${lesson.duration}m${preview}${free}`);
      }
    }

    console.log(`\n   👥 Enrollments (${course.enrollments.length}):`);
    for (const enrollment of course.enrollments) {
      const userName = `${enrollment.user.firstName || ''} ${enrollment.user.lastName || ''}`.trim();
      console.log(`      - ${enrollment.user.email} ${userName ? `(${userName})` : ''}`);
      console.log(`        Status: ${enrollment.status}, Progress: ${enrollment.progress}%`);
    }

    console.log(`\n   📝 What You Will Learn:`);
    course.whatYouWillLearn.forEach((item, idx) => {
      console.log(`      ${idx + 1}. ${item}`);
    });

    console.log('\n' + '-'.repeat(80));
  }

  // Overall statistics
  const totalModules = courses.reduce((sum, c) => sum + c.modules.length, 0);
  const totalLessons = courses.reduce((sum, c) => 
    sum + c.modules.reduce((s, m) => s + m.lessons.length, 0), 0
  );
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollments.length, 0);

  console.log('\n📊 Overall Statistics:');
  console.log(`   Total Courses: ${courses.length}`);
  console.log(`   Total Modules: ${totalModules}`);
  console.log(`   Total Lessons: ${totalLessons}`);
  console.log(`   Total Enrollments: ${totalEnrollments}`);
  
  // User enrollments
  console.log('\n👥 User Enrollments:');
  const user1Enrollments = await prisma.enrollment.findMany({
    where: { user: { email: 'foxmelanie77@gmail.com' } },
    include: { course: { select: { title: true } } }
  });
  console.log(`\n   foxmelanie77@gmail.com (${user1Enrollments.length} courses):`);
  user1Enrollments.forEach(e => console.log(`      - ${e.course.title}`));

  const user2Enrollments = await prisma.enrollment.findMany({
    where: { user: { email: 'phanngocdanthanh94@gmail.com' } },
    include: { course: { select: { title: true } } }
  });
  console.log(`\n   phanngocdanthanh94@gmail.com (${user2Enrollments.length} courses):`);
  user2Enrollments.forEach(e => console.log(`      - ${e.course.title}`));

  console.log('\n' + '='.repeat(80));
  console.log('✨ Report complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
