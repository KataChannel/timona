const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuizzes() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      modules: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
              quizzes: {
                select: {
                  id: true,
                  title: true,
                  questions: {
                    select: { id: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('\n📊 Kiểm tra Quiz trong 10 khóa học gần nhất:\n');
  console.log('=' .repeat(80));
  
  for (const course of courses) {
    const moduleCount = course.modules.length;
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const quizCount = course.modules.reduce((sum, m) => 
      sum + m.lessons.reduce((s, l) => s + l.quizzes.length, 0), 0
    );
    
    console.log(`\n🎓 ${course.title}`);
    console.log(`   ID: ${course.id}`);
    console.log(`   Ngày tạo: ${course.createdAt.toISOString()}`);
    console.log(`   📚 Modules: ${moduleCount}`);
    console.log(`   📖 Lessons: ${lessonCount}`);
    console.log(`   ❓ Quizzes: ${quizCount}`);
    
    if (quizCount === 0) {
      console.log(`   ⚠️  THIẾU QUIZ!`);
    }
    
    // Chi tiết từng module
    course.modules.forEach((module, idx) => {
      const moduleQuizCount = module.lessons.reduce((s, l) => s + l.quizzes.length, 0);
      console.log(`      Module ${idx + 1}: ${module.title} - ${module.lessons.length} lessons, ${moduleQuizCount} quizzes`);
      
      module.lessons.forEach((lesson, lidx) => {
        if (lesson.quizzes.length > 0) {
          lesson.quizzes.forEach(quiz => {
            console.log(`         ✓ Lesson ${lidx + 1}: "${lesson.title}" có quiz "${quiz.title}" (${quiz.questions.length} câu)`);
          });
        }
      });
    });
  }
  
  console.log('\n' + '='.repeat(80));
  await prisma.$disconnect();
}

checkQuizzes().catch(console.error);
