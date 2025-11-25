const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findMissingQuizzes() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      status: true,
      modules: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
              quizzes: {
                select: { id: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n🔍 TÌM KHÓA HỌC THIẾU QUIZ\n');
  console.log('='.repeat(80));
  
  let coursesWithoutQuiz = [];
  let modulesWithoutQuiz = [];
  
  for (const course of courses) {
    const quizCount = course.modules.reduce((sum, m) => 
      sum + m.lessons.reduce((s, l) => s + l.quizzes.length, 0), 0
    );
    
    const moduleCount = course.modules.length;
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    
    if (quizCount === 0 && lessonCount > 0) {
      coursesWithoutQuiz.push(course);
      console.log(`\n❌ THIẾU HOÀN TOÀN: ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Modules: ${moduleCount}, Lessons: ${lessonCount}, Quizzes: 0`);
    } else if (quizCount < moduleCount && lessonCount > 0) {
      modulesWithoutQuiz.push(course);
      console.log(`\n⚠️  THIẾU MỘT PHẦN: ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   Modules: ${moduleCount}, Lessons: ${lessonCount}, Quizzes: ${quizCount}`);
      
      // Chi tiết module nào thiếu quiz
      course.modules.forEach((module, idx) => {
        const moduleQuizCount = module.lessons.reduce((s, l) => s + l.quizzes.length, 0);
        if (moduleQuizCount === 0 && module.lessons.length > 0) {
          console.log(`      ❌ Module ${idx + 1}: "${module.title}" (${module.lessons.length} lessons, 0 quiz)`);
        }
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 TỔNG KẾT:`);
  console.log(`   - Tổng số khóa học: ${courses.length}`);
  console.log(`   - Thiếu quiz hoàn toàn: ${coursesWithoutQuiz.length}`);
  console.log(`   - Thiếu quiz một phần: ${modulesWithoutQuiz.length}`);
  console.log(`   - Khóa học OK: ${courses.length - coursesWithoutQuiz.length - modulesWithoutQuiz.length}`);
  
  await prisma.$disconnect();
}

findMissingQuizzes().catch(console.error);
