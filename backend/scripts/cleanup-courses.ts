import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Danh sách 8 khóa học được giữ lại
const KEEP_COURSES = [
  // Kỹ năng cơ bản
  'ky-nang-giao-tiep-hieu-qua',
  'quan-ly-thoi-gian-nang-suat',
  'tu-duy-logic-giai-quyet-van-de',
  'tin-hoc-van-phong-nang-cao',
  // Kỹ năng nâng cao
  'ky-nang-lanh-dao-quan-ly-nhom',
  'dam-phan-thuyet-phuc-chuyen-nghiep',
  'tu-duy-chien-luoc-ke-hoach-kinh-doanh',
  'doi-moi-sang-tao-quan-ly-thay-doi'
];

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🗑️  DỌN DẸP KHÓA HỌC - Chỉ giữ 8 khóa học');
  console.log('='.repeat(60) + '\n');

  try {
    // Lấy tất cả khóa học
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        level: true
      }
    });

    console.log(`📊 Tổng số khóa học hiện tại: ${allCourses.length}\n`);

    // Tìm các khóa học cần xóa
    const coursesToDelete = allCourses.filter(
      course => !KEEP_COURSES.includes(course.slug)
    );

    const coursesToKeep = allCourses.filter(
      course => KEEP_COURSES.includes(course.slug)
    );

    console.log(`✅ Giữ lại: ${coursesToKeep.length} khóa học`);
    coursesToKeep.forEach(course => {
      console.log(`   ✓ ${course.title} (${course.level})`);
    });

    console.log(`\n🗑️  Sẽ xóa: ${coursesToDelete.length} khóa học`);
    coursesToDelete.forEach(course => {
      console.log(`   ✗ ${course.title}`);
    });

    if (coursesToDelete.length === 0) {
      console.log('\n✅ Không có khóa học nào cần xóa!\n');
      return;
    }

    console.log('\n⏳ Bắt đầu xóa...\n');

    // Xóa các bản ghi liên quan trước
    for (const course of coursesToDelete) {
      console.log(`🗑️  Xóa dữ liệu liên quan: ${course.title}`);

      // Xóa enrollments
      await prisma.enrollment.deleteMany({
        where: { courseId: course.id }
      });

      // Xóa reviews
      await prisma.review.deleteMany({
        where: { courseId: course.id }
      });

      // Xóa progress (qua enrollment)
      await prisma.lessonProgress.deleteMany({
        where: {
          enrollment: {
            courseId: course.id
          }
        }
      });

      // Xóa quiz attempts (qua enrollment)
      await prisma.quizAttempt.deleteMany({
        where: {
          enrollment: {
            courseId: course.id
          }
        }
      });

      // Lấy tất cả modules của course
      const modules = await prisma.courseModule.findMany({
        where: { courseId: course.id },
        select: { id: true }
      });

      // Xóa quiz questions và quizzes qua lessons
      for (const module of modules) {
        const lessons = await prisma.lesson.findMany({
          where: { moduleId: module.id },
          select: { id: true }
        });

        for (const lesson of lessons) {
          // Xóa quiz questions
          const quizzes = await prisma.quiz.findMany({
            where: { lessonId: lesson.id },
            select: { id: true }
          });

          for (const quiz of quizzes) {
            await prisma.question.deleteMany({
              where: { quizId: quiz.id }
            });
          }

          // Xóa quizzes
          await prisma.quiz.deleteMany({
            where: { lessonId: lesson.id }
          });
        }

        // Xóa lessons
        await prisma.lesson.deleteMany({
          where: { moduleId: module.id }
        });
      }

      // Xóa modules
      await prisma.courseModule.deleteMany({
        where: { courseId: course.id }
      });

      // Xóa certificates
      await prisma.certificate.deleteMany({
        where: { courseId: course.id }
      });

      // Xóa discussions
      await prisma.discussion.deleteMany({
        where: { courseId: course.id }
      });

      console.log(`   ✅ Đã xóa dữ liệu liên quan`);
    }

    // Xóa các khóa học
    const deleteResult = await prisma.course.deleteMany({
      where: {
        slug: {
          notIn: KEEP_COURSES
        }
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ HOÀN TẤT DỌN DẸP');
    console.log('='.repeat(60));
    console.log(`🗑️  Đã xóa: ${deleteResult.count} khóa học`);
    console.log(`✅ Giữ lại: ${coursesToKeep.length} khóa học\n`);

    // Hiển thị danh sách khóa học còn lại
    console.log('📚 DANH SÁCH KHÓA HỌC CÒN LẠI:\n');

    const remainingCourses = await prisma.course.findMany({
      select: {
        title: true,
        level: true,
        price: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: [
        { level: 'asc' },
        { title: 'asc' }
      ]
    });

    let basicCount = 0;
    let advancedCount = 0;

    console.log('🟢 KỸ NĂNG CƠ BẢN:');
    remainingCourses
      .filter(c => c.level === 'BEGINNER')
      .forEach(course => {
        basicCount++;
        const price = Number(course.price) === 0 ? 'MIỄN PHÍ' : `${Number(course.price).toLocaleString('vi-VN')}đ`;
        console.log(`   ${basicCount}. ${course.title} (${price})`);
      });

    console.log('\n🔴 KỸ NĂNG NÂNG CAO:');
    remainingCourses
      .filter(c => c.level === 'ADVANCED')
      .forEach(course => {
        advancedCount++;
        const price = Number(course.price) === 0 ? 'MIỄN PHÍ' : `${Number(course.price).toLocaleString('vi-VN')}đ`;
        console.log(`   ${advancedCount}. ${course.title} (${price})`);
      });

    console.log('\n📊 THỐNG KÊ:');
    console.log(`   Kỹ năng cơ bản: ${basicCount}`);
    console.log(`   Kỹ năng nâng cao: ${advancedCount}`);
    console.log(`   Tổng cộng: ${remainingCourses.length}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Cleanup failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
