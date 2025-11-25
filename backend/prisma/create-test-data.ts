import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🚀 Creating test data...');

  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        isVerified: true
      }
    });
    console.log('✅ Created user:', user.id);

    // Create test tags
    const tag1 = await prisma.tag.create({
      data: {
        name: 'React',
        slug: 'react',
        color: '#61dafb'
      }
    });

    const tag2 = await prisma.tag.create({
      data: {
        name: 'TypeScript',
        slug: 'typescript',
        color: '#3178c6'
      }
    });
    console.log('✅ Created tags:', tag1.id, tag2.id);

    // Create a test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post',
        content: 'This is a test post content.',
        slug: 'test-post-' + Date.now(),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: user.id
      }
    });
    console.log('✅ Created post:', post.id);

    // Create post-tag relationships
    await prisma.postTag.create({
      data: {
        postId: post.id,
        tagId: tag1.id
      }
    });

    await prisma.postTag.create({
      data: {
        postId: post.id,
        tagId: tag2.id
      }
    });
    console.log('✅ Created post-tag relationships');

    // Create a test task
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'This is a test task.',
        category: 'WORK',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: user.id
      }
    });
    console.log('✅ Created task:', task.id);

    // Create a test notification
    await prisma.notification.create({
      data: {
        title: 'Test Notification',
        message: 'This is a test notification.',
        type: 'info',
        userId: user.id
      }
    });
    console.log('✅ Created notification');

    console.log('🎉 Test data creation completed!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();