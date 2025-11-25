import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReleaseHub() {
  console.log('🌱 Seeding Release Hub data...');

  // Create releases
  const releases = [
    {
      version: 'v1.0.0',
      versionNumber: '1.0.0',
      releaseType: 'MAJOR',
      status: 'RELEASED',
      title: 'rausachcore 1.0 - Initial Release',
      summary: 'First stable release with core features',
      description: 'Complete platform with authentication, admin dashboard, and e-commerce foundation',
      features: [
        'User Authentication & Authorization',
        'Admin Dashboard',
        'Product Management',
        'Blog System',
        'File Manager',
      ],
      improvements: ['Performance optimization', 'Better error handling'],
      bugfixes: ['Fixed login redirect issue', 'Resolved file upload bug'],
      releaseNotes: `## What's New

Welcome to rausachcore 1.0! This is our first stable release.

### Features
- Complete authentication system
- Admin panel with RBAC
- E-commerce foundation

### Technical Details
- Built with Next.js 15 & NestJS 11
- PostgreSQL database
- Redis caching
- MinIO file storage`,
      upgradeGuide: `## Installation

\`\`\`bash
bun install
bun run db:push
bun run dev
\`\`\``,
      slug: 'rausachcore-1-0-initial-release',
      releaseDate: new Date('2024-01-15'),
      publishedAt: new Date('2024-01-15'),
    },
    {
      version: 'v1.1.0',
      versionNumber: '1.1.0',
      releaseType: 'MINOR',
      status: 'RELEASED',
      title: 'Enhanced User Management',
      summary: 'New features for user roles and permissions',
      description: 'Advanced RBAC system with custom roles and permission management',
      features: [
        'Advanced RBAC system',
        'Custom role creation',
        'Permission templates',
        'User activity logs',
      ],
      improvements: ['Faster user search', 'Better UI/UX', 'Improved security'],
      bugfixes: ['Fixed role assignment bug', 'Resolved permission sync issue'],
      releaseNotes: `## v1.1.0 Updates

### New Features
- Advanced RBAC with custom roles
- Permission management UI
- User activity tracking

### Improvements
- 3x faster user search
- Modern UI components
- Enhanced security headers`,
      upgradeGuide: `## Upgrade Steps

1. Backup database
\`\`\`bash
bun run db:backup
\`\`\`

2. Pull latest code
\`\`\`bash
git pull origin main
\`\`\`

3. Run migrations
\`\`\`bash
bun run db:migrate
\`\`\`

4. Restart services
\`\`\`bash
bun run docker:restart
\`\`\``,
      slug: 'enhanced-user-management',
      releaseDate: new Date('2024-03-20'),
      publishedAt: new Date('2024-03-20'),
    },
    {
      version: 'v1.1.1',
      versionNumber: '1.1.1',
      releaseType: 'PATCH',
      status: 'RELEASED',
      title: 'Bug Fixes & Performance',
      summary: 'Critical bug fixes and performance improvements',
      description: 'Patch release focusing on stability and performance',
      features: [],
      improvements: [
        'Database query optimization',
        'Reduced memory usage',
        'Faster API response times',
      ],
      bugfixes: [
        'Fixed GraphQL timeout issue',
        'Resolved Redis connection leak',
        'Fixed file upload progress',
        'Corrected timezone handling',
      ],
      releaseNotes: `## v1.1.1 Patch

### Bug Fixes
- Fixed critical GraphQL timeout
- Resolved Redis connection issues
- Fixed file upload problems

### Performance
- 40% faster API responses
- 25% reduced memory usage
- Optimized database queries`,
      slug: 'bug-fixes-and-performance',
      releaseDate: new Date('2024-04-05'),
      publishedAt: new Date('2024-04-05'),
    },
    {
      version: 'v1.2.0',
      versionNumber: '1.2.0',
      releaseType: 'MINOR',
      status: 'RELEASED',
      title: 'LMS System & Project Management',
      summary: 'Complete Learning Management System and Project tools',
      description: 'Major feature release with LMS and project management capabilities',
      features: [
        'LMS with courses and lessons',
        'Quiz system with multiple question types',
        'Certificate generation',
        'Student progress tracking',
        'Project Management with Kanban',
        'Task assignment and tracking',
        'Team collaboration tools',
      ],
      improvements: [
        'Better file organization',
        'Enhanced search functionality',
        'Mobile responsive design',
      ],
      bugfixes: ['Fixed course enrollment bug', 'Resolved quiz submission issue'],
      releaseNotes: `## v1.2.0 - Major Feature Release

### LMS Features
- Complete course management
- Interactive quizzes
- Auto-generated certificates
- Progress analytics

### Project Management
- Kanban board view
- Task dependencies
- Time tracking
- Team chat integration

### UI/UX
- Fully mobile responsive
- Dark mode support
- Accessibility improvements`,
      upgradeGuide: `## Upgrade Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Steps

1. Stop services
\`\`\`bash
bun run docker:down
\`\`\`

2. Backup database
\`\`\`bash
pg_dump rausachcore > backup.sql
\`\`\`

3. Update code
\`\`\`bash
git pull
bun install
\`\`\`

4. Run migrations
\`\`\`bash
bun run db:migrate
\`\`\`

5. Restart
\`\`\`bash
bun run docker:up -d
\`\`\``,
      slug: 'lms-system-project-management',
      releaseDate: new Date('2024-07-10'),
      publishedAt: new Date('2024-07-10'),
    },
    {
      version: 'v1.3.0',
      versionNumber: '1.3.0',
      releaseType: 'MINOR',
      status: 'RELEASED',
      title: 'Release Hub & Support Center',
      summary: 'Integrated release management and customer support system',
      description: 'Complete release versioning and support ticket system',
      features: [
        'Release versioning system',
        'Changelog management',
        'Support ticket system',
        'Knowledge base',
        'Email notifications',
        'Analytics dashboard',
      ],
      improvements: ['Better documentation', 'Improved error messages', 'Enhanced logging'],
      bugfixes: [],
      releaseNotes: `## v1.3.0 - Release Hub

### Release Management
- Version control system
- Automated changelogs
- Download tracking
- Release notes in Markdown

### Support Center
- Ticket management
- Priority levels
- Agent assignment
- Response SLA tracking

### Knowledge Base
- Guide categories
- Search functionality
- Video tutorials
- FAQ system`,
      upgradeGuide: `## Upgrade to v1.3.0

### New Features
This release adds Release Hub and Support Center modules.

### Database Changes
New tables will be created automatically.

### Steps
\`\`\`bash
# 1. Update code
git pull origin main

# 2. Install dependencies
bun install

# 3. Push schema
bun run db:push

# 4. Restart
bun run dev
\`\`\``,
      slug: 'release-hub-support-center',
      releaseDate: new Date('2024-11-21'),
      publishedAt: new Date('2024-11-21'),
    },
  ];

  for (const releaseData of releases) {
    try {
      const release = await prisma.systemRelease.create({
        data: releaseData,
      });
      console.log(`✅ Created release: ${release.version} - ${release.title}`);
    } catch (error) {
      console.error(`❌ Error creating release ${releaseData.version}:`, error.message);
    }
  }

  console.log('\n🎉 Seeding completed!');
  console.log('\nVisit: http://localhost:12000/releases');
}

seedReleaseHub()
  .catch((error) => {
    console.error('Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
