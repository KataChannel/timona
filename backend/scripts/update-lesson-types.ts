import { PrismaClient, LessonType } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLessonTypes() {
  console.log('📝 Updating lesson types to QUIZ...');

  try {
    await prisma.lesson.update({
      where: { id: 'react-lesson-3' },
      data: { type: LessonType.QUIZ },
    });

    await prisma.lesson.update({
      where: { id: 'react-lesson-6' },
      data: { type: LessonType.QUIZ },
    });

    console.log('✅ Lesson types updated successfully');
    console.log('  - react-lesson-3: JSX and Components → QUIZ');
    console.log('  - react-lesson-6: Custom Hooks → QUIZ');
  } catch (error) {
    console.error('❌ Error updating lesson types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateLessonTypes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
