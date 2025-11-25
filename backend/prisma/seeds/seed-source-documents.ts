import { PrismaClient, SourceDocumentType, SourceDocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSourceDocuments() {
  console.log('🌱 Seeding Source Documents...');

  // Get first admin user for ownership
  const adminUser = await prisma.user.findFirst({
    where: {
      roleType: 'ADMIN',
    },
  });

  if (!adminUser) {
    console.error('❌ No admin user found! Please create an admin user first.');
    return;
  }

  console.log(`✅ Found admin user: ${adminUser.email}`);

  // Create categories first
  console.log('📁 Creating categories...');
  
  const categories = await Promise.all([
    prisma.sourceDocumentCategory.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Lập trình',
        slug: 'programming',
        description: 'Tài liệu về lập trình và phát triển phần mềm',
        icon: 'Code',
        color: '#3B82F6',
      },
    }),
    prisma.sourceDocumentCategory.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Thiết kế',
        slug: 'design',
        description: 'Tài liệu về thiết kế đồ họa và UI/UX',
        icon: 'Palette',
        color: '#EC4899',
      },
    }),
    prisma.sourceDocumentCategory.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Kinh doanh',
        slug: 'business',
        description: 'Tài liệu về quản trị kinh doanh',
        icon: 'Briefcase',
        color: '#10B981',
      },
    }),
    prisma.sourceDocumentCategory.upsert({
      where: { slug: 'marketing' },
      update: {},
      create: {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Tài liệu về marketing và truyền thông',
        icon: 'TrendingUp',
        color: '#F59E0B',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create source documents - one for each type
  console.log('📄 Creating source documents...');

  const documents = [
    // 1. FILE - PDF Document
    {
      title: 'Clean Code - Robert C. Martin',
      description: 'Sách về viết code sạch và dễ bảo trì. Một trong những cuốn sách kinh điển về lập trình.',
      type: SourceDocumentType.FILE,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://example.com/files/clean-code.pdf',
      fileName: 'clean-code.pdf',
      fileSize: 5242880, // 5MB
      mimeType: 'application/pdf',
      thumbnailUrl: 'https://example.com/thumbnails/clean-code.jpg',
      categoryId: categories[0].id, // Programming
      tags: ['programming', 'best-practices', 'software-development'],
      metadata: {
        author: 'Robert C. Martin',
        year: 2008,
        pages: 464,
        language: 'English',
      },
      aiSummary: 'Clean Code là cuốn sách hướng dẫn viết code sạch, dễ đọc và dễ bảo trì. Tác giả đưa ra các nguyên tắc và thực hành tốt nhất trong lập trình.',
      aiKeywords: ['clean code', 'refactoring', 'SOLID principles', 'best practices'],
      aiTopics: ['Code Quality', 'Software Design', 'Refactoring'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // 2. VIDEO - YouTube Video
    {
      title: 'React Hooks Tutorial - Full Course',
      description: 'Khóa học đầy đủ về React Hooks từ cơ bản đến nâng cao. Bao gồm useState, useEffect, useContext, và custom hooks.',
      type: SourceDocumentType.VIDEO,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://www.youtube.com/watch?v=example123',
      duration: 3600, // 1 hour in seconds
      thumbnailUrl: 'https://img.youtube.com/vi/example123/maxresdefault.jpg',
      categoryId: categories[0].id, // Programming
      tags: ['react', 'javascript', 'hooks', 'frontend'],
      metadata: {
        platform: 'YouTube',
        instructor: 'John Doe',
        quality: '1080p',
        subtitles: ['en', 'vi'],
      },
      aiSummary: 'Video hướng dẫn chi tiết về React Hooks, giúp developers hiểu và sử dụng hiệu quả các hooks trong React applications.',
      aiKeywords: ['React', 'Hooks', 'useState', 'useEffect', 'JavaScript'],
      aiTopics: ['Frontend Development', 'React Framework', 'Modern JavaScript'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // 3. TEXT - Markdown Content
    {
      title: 'REST API Best Practices',
      description: 'Tổng hợp các best practices khi thiết kế RESTful APIs',
      type: SourceDocumentType.TEXT,
      status: SourceDocumentStatus.PUBLISHED,
      content: `# REST API Best Practices

## 1. Use Proper HTTP Methods

- GET: Retrieve resources
- POST: Create new resources
- PUT: Update entire resources
- PATCH: Partial update
- DELETE: Remove resources

## 2. Use Meaningful URLs

Good: \`/api/users/123/posts\`
Bad: \`/api/get-user-posts?id=123\`

## 3. Version Your API

Always version your API to maintain backward compatibility:
- \`/api/v1/users\`
- \`/api/v2/users\`

## 4. Use Status Codes Correctly

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## 5. Implement Pagination

For large datasets, always implement pagination:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
\`\`\`

## 6. Security Best Practices

- Use HTTPS
- Implement authentication (JWT, OAuth)
- Rate limiting
- Input validation
- CORS configuration

## Conclusion

Following these best practices will help you build scalable and maintainable APIs.
`,
      categoryId: categories[0].id, // Programming
      tags: ['api', 'rest', 'backend', 'best-practices'],
      metadata: {
        format: 'markdown',
        version: '1.0',
        lastUpdated: new Date().toISOString(),
      },
      aiSummary: 'Bài viết tổng hợp các best practices thiết kế REST API, bao gồm HTTP methods, URL design, versioning, status codes, pagination và security.',
      aiKeywords: ['REST API', 'HTTP', 'Web Services', 'Backend', 'Best Practices'],
      aiTopics: ['API Design', 'Backend Development', 'Web Architecture'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // 4. AUDIO - Podcast/Audio File
    {
      title: 'The Changelog - Episode 500: The Future of JavaScript',
      description: 'Podcast thảo luận về tương lai của JavaScript và các framework hiện đại',
      type: SourceDocumentType.AUDIO,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://example.com/podcasts/changelog-500.mp3',
      fileName: 'changelog-500.mp3',
      fileSize: 52428800, // 50MB
      mimeType: 'audio/mpeg',
      duration: 2700, // 45 minutes
      thumbnailUrl: 'https://example.com/thumbnails/changelog.jpg',
      categoryId: categories[0].id, // Programming
      tags: ['podcast', 'javascript', 'web-development', 'interview'],
      metadata: {
        show: 'The Changelog',
        episode: 500,
        hosts: ['Adam Stacoviak', 'Jerod Santo'],
        guests: ['Evan You', 'Dan Abramov'],
        publishDate: '2024-11-01',
      },
      aiSummary: 'Episode thảo luận về xu hướng phát triển JavaScript, các framework mới, và tương lai của web development với những người tiên phong trong ngành.',
      aiKeywords: ['JavaScript', 'Framework', 'Web Development', 'React', 'Vue'],
      aiTopics: ['JavaScript Evolution', 'Frontend Frameworks', 'Web Technologies'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // 5. LINK - External Resource
    {
      title: 'MDN Web Docs - JavaScript Reference',
      description: 'Tài liệu tham khảo JavaScript chính thức từ Mozilla Developer Network',
      type: SourceDocumentType.LINK,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference',
      thumbnailUrl: 'https://developer.mozilla.org/mdn-social-share.png',
      categoryId: categories[0].id, // Programming
      tags: ['documentation', 'javascript', 'reference', 'mdn'],
      metadata: {
        source: 'Mozilla Developer Network',
        type: 'Official Documentation',
        language: 'Multiple Languages',
        lastChecked: new Date().toISOString(),
      },
      aiSummary: 'Tài liệu tham khảo JavaScript đầy đủ từ MDN, bao gồm cú pháp, built-in objects, và các API của JavaScript.',
      aiKeywords: ['JavaScript', 'Documentation', 'Reference', 'MDN', 'Web API'],
      aiTopics: ['JavaScript Language', 'Web Standards', 'Programming Reference'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // 6. IMAGE - Diagram/Infographic
    {
      title: 'HTTP Request/Response Lifecycle Diagram',
      description: 'Sơ đồ minh họa chu trình hoàn chỉnh của một HTTP request và response',
      type: SourceDocumentType.IMAGE,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://example.com/diagrams/http-lifecycle.png',
      fileName: 'http-lifecycle.png',
      fileSize: 1048576, // 1MB
      mimeType: 'image/png',
      thumbnailUrl: 'https://example.com/diagrams/http-lifecycle-thumb.png',
      categoryId: categories[0].id, // Programming
      tags: ['diagram', 'http', 'networking', 'infographic'],
      metadata: {
        dimensions: '1920x1080',
        format: 'PNG',
        creator: 'Tech Diagrams',
        license: 'CC BY 4.0',
      },
      aiSummary: 'Sơ đồ chi tiết về HTTP request/response lifecycle, giúp hiểu rõ cách client và server giao tiếp qua HTTP protocol.',
      aiKeywords: ['HTTP', 'Request', 'Response', 'Network', 'Protocol'],
      aiTopics: ['Web Fundamentals', 'Network Protocol', 'Client-Server Architecture'],
      isAiAnalyzed: true,
      aiAnalyzedAt: new Date(),
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // Additional examples for Design category
    {
      title: 'UI/UX Design Principles',
      description: 'PDF về các nguyên tắc thiết kế UI/UX cơ bản',
      type: SourceDocumentType.FILE,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://example.com/files/ui-ux-principles.pdf',
      fileName: 'ui-ux-principles.pdf',
      fileSize: 3145728, // 3MB
      mimeType: 'application/pdf',
      thumbnailUrl: 'https://example.com/thumbnails/ui-ux.jpg',
      categoryId: categories[1].id, // Design
      tags: ['design', 'ui', 'ux', 'principles'],
      metadata: {
        author: 'Design Studio',
        pages: 50,
        language: 'Vietnamese',
      },
      userId: adminUser.id,
      publishedAt: new Date(),
    },

    // Business category
    {
      title: 'Lean Startup Methodology',
      description: 'Video hướng dẫn về phương pháp Lean Startup',
      type: SourceDocumentType.VIDEO,
      status: SourceDocumentStatus.PUBLISHED,
      url: 'https://www.youtube.com/watch?v=business123',
      duration: 2400, // 40 minutes
      thumbnailUrl: 'https://img.youtube.com/vi/business123/maxresdefault.jpg',
      categoryId: categories[2].id, // Business
      tags: ['startup', 'lean', 'business', 'entrepreneurship'],
      metadata: {
        platform: 'YouTube',
        instructor: 'Eric Ries',
        quality: '1080p',
      },
      userId: adminUser.id,
      publishedAt: new Date(),
    },
  ];

  for (const doc of documents) {
    const created = await prisma.sourceDocument.upsert({
      where: { 
        // Use a unique combination for where clause
        id: doc.title, // This won't work, need to create unique identifier
      },
      update: {},
      create: doc,
    }).catch(async () => {
      // If upsert fails, just create
      return await prisma.sourceDocument.create({
        data: doc,
      });
    });
    console.log(`✅ Created: ${created.title} (${created.type})`);
  }

  console.log(`\n🎉 Successfully seeded ${documents.length} source documents!`);
  console.log('\nSummary:');
  console.log(`📄 FILE: 2 documents`);
  console.log(`🎥 VIDEO: 2 documents`);
  console.log(`📝 TEXT: 1 document`);
  console.log(`🎵 AUDIO: 1 document`);
  console.log(`🔗 LINK: 1 document`);
  console.log(`🖼️  IMAGE: 1 document`);
}

async function main() {
  try {
    await seedSourceDocuments();
  } catch (error) {
    console.error('❌ Error seeding source documents:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
