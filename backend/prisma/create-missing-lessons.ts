import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Create missing lessons that are referenced by quizzes
 * This is needed to satisfy foreign key constraints when restoring quiz data
 */
async function createMissingLessons() {
  console.log('🔍 Finding missing lessons referenced by quizzes...\n');

  // Get latest backup folder
  const BACKUP_ROOT_DIR = './kata_json';
  const folders = fs.readdirSync(BACKUP_ROOT_DIR)
    .filter(folder => fs.statSync(path.join(BACKUP_ROOT_DIR, folder)).isDirectory())
    .sort()
    .reverse();
  
  const latestBackup = folders[0];
  if (!latestBackup) {
    console.error('❌ No backup folder found');
    process.exit(1);
  }

  console.log(`📁 Using backup: ${latestBackup}\n`);

  // Read quizzes to find lessonIds
  const quizzesFile = path.join(BACKUP_ROOT_DIR, latestBackup, 'quizzes.json');
  if (!fs.existsSync(quizzesFile)) {
    console.log('⚠️  No quizzes.json found - nothing to do');
    return;
  }

  const quizzes = JSON.parse(fs.readFileSync(quizzesFile, 'utf8'));
  const lessonIds = [...new Set(quizzes.map((q: any) => q.lessonId))];

  console.log(`Found ${lessonIds.length} unique lesson IDs in quizzes\n`);

  // Check which lessons already exist
  const existingLessons = await prisma.lesson.findMany({
    where: { id: { in: lessonIds } },
    select: { id: true },
  });

  const existingIds = new Set(existingLessons.map(l => l.id));
  const missingIds = lessonIds.filter(id => !existingIds.has(id));

  if (missingIds.length === 0) {
    console.log('✅ All lessons already exist - nothing to create');
    return;
  }

  console.log(`📝 Need to create ${missingIds.length} missing lessons:\n`);

  // Get or create a course module to attach lessons to
  let module = await prisma.courseModule.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!module) {
    console.log('📦 No course module found - creating one...');
    
    // Get or create a course
    let course = await prisma.course.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!course) {
      console.log('📚 No course found - creating one...');
      course = await prisma.course.create({
        data: {
          title: '[Restored] Default Course',
          slug: 'restored-default-course-' + Date.now(),
          description: 'Auto-created course for restored data',
          level: 'BEGINNER',
          status: 'DRAFT',
          categoryId: null,
          instructorId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || '',
        },
      });
      console.log(`✅ Created course: ${course.id}\n`);
    }

    module = await prisma.courseModule.create({
      data: {
        title: '[Restored] Default Module',
        description: 'Auto-created module for restored data',
        order: 1,
        courseId: course.id,
      },
    });
    console.log(`✅ Created module: ${module.id}\n`);
  }

  // Create missing lessons
  let created = 0;
  for (const lessonId of missingIds) {
    try {
      await prisma.lesson.create({
        data: {
          id: lessonId,
          title: `[Restored] Lesson ${lessonId.substring(0, 8)}`,
          description: 'Auto-created lesson to satisfy FK constraints',
          type: 'TEXT',
          content: 'This lesson was auto-created during data restoration.',
          order: created + 1,
          moduleId: module.id,
          isPreview: false,
          isFree: false,
        },
      });
      created++;
      console.log(`✅ Created lesson ${created}/${missingIds.length}: ${lessonId.substring(0, 8)}...`);
    } catch (error: any) {
      console.error(`❌ Failed to create lesson ${lessonId}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Created ${created} lessons successfully!`);
  console.log(`💡 You can now run restore again and quizzes should work.\n`);
}

createMissingLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
