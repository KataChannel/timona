import { PrismaClient, UserRoleType, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rausachcore.dev' },
    update: {},
    create: {
      email: 'admin@rausachcore.dev',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      roleType: 'ADMIN',
      isActive: true,
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@rausachcore.dev' },
    update: {},
    create: {
      email: 'user@rausachcore.dev',
      username: 'testuser',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      roleType: 'USER',
    },
  });

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: {
        name: 'Next.js',
        slug: 'nextjs',
        color: '#000000',
        createdBy: adminUser.id,
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'nestjs' },
      update: {},
      create: {
        name: 'NestJS',
        slug: 'nestjs',
        color: '#ea2845',
        createdBy: adminUser.id,
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'graphql' },
      update: {},
      create: {
        name: 'GraphQL',
        slug: 'graphql',
        color: '#e10098',
        createdBy: adminUser.id,
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'prisma' },
      update: {},
      create: {
        name: 'Prisma',
        slug: 'prisma',
        color: '#2d3748',
        createdBy: adminUser.id,
      },
    }),
  ]);

  // Create sample posts using upsert to avoid duplicate slug errors
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { slug: 'welcome-to-rausachcore' },
      update: {},
      create: {
        title: 'Welcome to rausachcore',
        content: `# Welcome to rausachcore

rausachcore is a modern fullstack starter kit built with the latest technologies.

## Features

- **Next.js 15** with React 19 and TypeScript
- **NestJS 11** with GraphQL
- **Prisma ORM** with PostgreSQL
- **Redis** for caching
- **MinIO** for object storage
- **TailwindCSS v4** for styling
- **Docker** for containerization

This starter kit provides everything you need to build scalable, production-ready applications.`,
        excerpt: 'Learn about rausachcore, the modern fullstack starter kit.',
        slug: 'welcome-to-rausachcore',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
    }),
    prisma.post.upsert({
      where: { slug: 'getting-started-with-graphql' },
      update: {},
      create: {
        title: 'Getting Started with GraphQL',
        content: `# Getting Started with GraphQL

GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.

## Why GraphQL?

1. **Single Endpoint**: All your data needs through one URL
2. **Type Safety**: Strong type system
3. **Efficient**: Request exactly what you need
4. **Real-time**: Built-in subscription support

## Basic Query Example

\`\`\`graphql
query GetPosts {
  getPosts {
    items {
      id
      title
      author {
        username
      }
    }
    meta {
      total
      page
      totalPages
    }
  }
}
\`\`\`

This query will fetch posts with their titles and author usernames.`,
        excerpt: 'Learn the basics of GraphQL and how to use it effectively.',
        slug: 'getting-started-with-graphql',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: testUser.id,
      },
    }),
    prisma.post.upsert({
      where: { slug: 'building-scalable-applications-with-nestjs' },
      update: {},
      create: {
        title: 'Building Scalable Applications with NestJS',
        content: `# Building Scalable Applications with NestJS

NestJS is a framework for building efficient, reliable and scalable server-side applications.

## Key Features

- **Modular Architecture**: Organize your code with modules
- **Dependency Injection**: Built-in IoC container
- **GraphQL Support**: First-class GraphQL support
- **Testing**: Comprehensive testing utilities

## Example Module

\`\`\`typescript
@Module({
  imports: [DatabaseModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
\`\`\``,
        excerpt: 'Discover how to build scalable applications using NestJS framework.',
        slug: 'building-scalable-applications-with-nestjs',
        status: PostStatus.DRAFT,
        authorId: adminUser.id,
      },
    }),
  ]);

  // Add tags to posts - use upsert to avoid constraint errors
  await Promise.all([
    prisma.postTag.upsert({
      where: {
        postId_tagId: {
          postId: posts[0].id,
          tagId: tags[0].id,
        },
      },
      update: {},
      create: {
        postId: posts[0].id,
        tagId: tags[0].id, // Next.js
      },
    }),
    prisma.postTag.upsert({
      where: {
        postId_tagId: {
          postId: posts[0].id,
          tagId: tags[1].id,
        },
      },
      update: {},
      create: {
        postId: posts[0].id,
        tagId: tags[1].id, // NestJS
      },
    }),
    prisma.postTag.upsert({
      where: {
        postId_tagId: {
          postId: posts[1].id,
          tagId: tags[2].id,
        },
      },
      update: {},
      create: {
        postId: posts[1].id,
        tagId: tags[2].id, // GraphQL
      },
    }),
    prisma.postTag.upsert({
      where: {
        postId_tagId: {
          postId: posts[2].id,
          tagId: tags[1].id,
        },
      },
      update: {},
      create: {
        postId: posts[2].id,
        tagId: tags[1].id, // NestJS
      },
    }),
  ]);

  // Create sample comments - delete existing first to avoid constraint errors
  await prisma.comment.deleteMany({
    where: {
      postId: {
        in: [posts[0].id, posts[1].id],
      },
    },
  });

  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great introduction to rausachcore! Looking forward to using it.',
        postId: posts[0].id,
        userId: testUser.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Very helpful GraphQL tutorial. Thanks for sharing!',
        postId: posts[1].id,
        userId: adminUser.id,
      },
    }),
  ]);

  // Create sample likes - delete existing first to avoid constraint errors
  await prisma.like.deleteMany({
    where: {
      postId: {
        in: [posts[0].id, posts[1].id],
      },
    },
  });

  await Promise.all([
    prisma.like.create({
      data: {
        postId: posts[0].id,
        userId: testUser.id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[1].id,
        userId: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');
  console.log(`👤 Admin user: admin@rausachcore.dev / admin123`);
  console.log(`👤 Test user: user@rausachcore.dev / user123`);
  console.log(`📝 Created ${posts.length} posts`);
  console.log(`🏷️ Created ${tags.length} tags`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
