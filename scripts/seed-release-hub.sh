#!/bin/bash

# Script to seed Release Hub data

echo "🌱 Seeding Release Hub data..."

# Create sample releases
curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSystemRelease(input: { version: \"v1.0.0\", releaseType: MAJOR, title: \"rausachcore 1.0 - Initial Release\", summary: \"First stable release with core features\", features: [\"User Authentication & Authorization\", \"Admin Dashboard\", \"Product Management\", \"Blog System\", \"File Manager\"], improvements: [\"Performance optimization\", \"Better error handling\"], bugfixes: [\"Fixed login redirect issue\", \"Resolved file upload bug\"], releaseNotes: \"## What'\''s New\\n\\nWelcome to rausachcore 1.0! This is our first stable release.\\n\\n### Features\\n- Complete authentication system\\n- Admin panel with RBAC\\n- E-commerce foundation\\n\\n### Technical Details\\n- Built with Next.js 15 & NestJS 11\\n- PostgreSQL database\\n- Redis caching\\n- MinIO file storage\", upgradeGuide: \"## Installation\\n\\n```bash\\nbun install\\nbun run db:push\\nbun run dev\\n```\" }) { id version title } }"
  }' 2>&1 | jq .

curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSystemRelease(input: { version: \"v1.1.0\", releaseType: MINOR, title: \"Enhanced User Management\", summary: \"New features for user roles and permissions\", features: [\"Advanced RBAC system\", \"Custom role creation\", \"Permission templates\", \"User activity logs\"], improvements: [\"Faster user search\", \"Better UI/UX\", \"Improved security\"], bugfixes: [\"Fixed role assignment bug\", \"Resolved permission sync issue\"], releaseNotes: \"## v1.1.0 Updates\\n\\n### New Features\\n- Advanced RBAC with custom roles\\n- Permission management UI\\n- User activity tracking\\n\\n### Improvements\\n- 3x faster user search\\n- Modern UI components\\n- Enhanced security headers\", upgradeGuide: \"## Upgrade Steps\\n\\n1. Backup database\\n```bash\\nbun run db:backup\\n```\\n\\n2. Pull latest code\\n```bash\\ngit pull origin main\\n```\\n\\n3. Run migrations\\n```bash\\nbun run db:migrate\\n```\\n\\n4. Restart services\\n```bash\\nbun run docker:restart\\n```\" }) { id version title } }"
  }' 2>&1 | jq .

curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSystemRelease(input: { version: \"v1.1.1\", releaseType: PATCH, title: \"Bug Fixes & Performance\", summary: \"Critical bug fixes and performance improvements\", features: [], improvements: [\"Database query optimization\", \"Reduced memory usage\", \"Faster API response times\"], bugfixes: [\"Fixed GraphQL timeout issue\", \"Resolved Redis connection leak\", \"Fixed file upload progress\", \"Corrected timezone handling\"], releaseNotes: \"## v1.1.1 Patch\\n\\n### Bug Fixes\\n- Fixed critical GraphQL timeout\\n- Resolved Redis connection issues\\n- Fixed file upload problems\\n\\n### Performance\\n- 40% faster API responses\\n- 25% reduced memory usage\\n- Optimized database queries\" }) { id version title } }"
  }' 2>&1 | jq .

curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSystemRelease(input: { version: \"v1.2.0\", releaseType: MINOR, title: \"LMS System & Project Management\", summary: \"Complete Learning Management System and Project tools\", features: [\"LMS with courses and lessons\", \"Quiz system with multiple question types\", \"Certificate generation\", \"Student progress tracking\", \"Project Management with Kanban\", \"Task assignment and tracking\", \"Team collaboration tools\"], improvements: [\"Better file organization\", \"Enhanced search functionality\", \"Mobile responsive design\"], bugfixes: [\"Fixed course enrollment bug\", \"Resolved quiz submission issue\"], releaseNotes: \"## v1.2.0 - Major Feature Release\\n\\n### LMS Features\\n- Complete course management\\n- Interactive quizzes\\n- Auto-generated certificates\\n- Progress analytics\\n\\n### Project Management\\n- Kanban board view\\n- Task dependencies\\n- Time tracking\\n- Team chat integration\\n\\n### UI/UX\\n- Fully mobile responsive\\n- Dark mode support\\n- Accessibility improvements\", upgradeGuide: \"## Upgrade Guide\\n\\n### Prerequisites\\n- Node.js 18+\\n- PostgreSQL 14+\\n- Redis 6+\\n\\n### Steps\\n\\n1. Stop services\\n```bash\\nbun run docker:down\\n```\\n\\n2. Backup database\\n```bash\\npg_dump rausachcore > backup.sql\\n```\\n\\n3. Update code\\n```bash\\ngit pull\\nbun install\\n```\\n\\n4. Run migrations\\n```bash\\nbun run db:migrate\\n```\\n\\n5. Restart\\n```bash\\nbun run docker:up -d\\n```\" }) { id version title } }"
  }' 2>&1 | jq .

curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSystemRelease(input: { version: \"v1.3.0\", releaseType: MINOR, title: \"Release Hub & Support Center\", summary: \"Integrated release management and customer support system\", features: [\"Release versioning system\", \"Changelog management\", \"Support ticket system\", \"Knowledge base\", \"Email notifications\", \"Analytics dashboard\"], improvements: [\"Better documentation\", \"Improved error messages\", \"Enhanced logging\"], bugfixes: [], releaseNotes: \"## v1.3.0 - Release Hub\\n\\n### Release Management\\n- Version control system\\n- Automated changelogs\\n- Download tracking\\n- Release notes in Markdown\\n\\n### Support Center\\n- Ticket management\\n- Priority levels\\n- Agent assignment\\n- Response SLA tracking\\n\\n### Knowledge Base\\n- Guide categories\\n- Search functionality\\n- Video tutorials\\n- FAQ system\", upgradeGuide: \"## Upgrade to v1.3.0\\n\\n### New Features\\nThis release adds Release Hub and Support Center modules.\\n\\n### Database Changes\\nNew tables will be created automatically.\\n\\n### Steps\\n```bash\\n# 1. Update code\\ngit pull origin main\\n\\n# 2. Install dependencies\\nbun install\\n\\n# 3. Push schema\\nbun run db:push\\n\\n# 4. Restart\\nbun run dev\\n```\" }) { id version title } }"
  }' 2>&1 | jq .

echo ""
echo "✅ Seeding complete!"
echo ""
echo "Now publish releases:"
echo ""

# Get all releases and publish them
RELEASES=$(curl -s -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ systemReleases(take: 10) { id version } }"}' | jq -r '.data.systemReleases[].id')

for release_id in $RELEASES; do
  echo "Publishing release: $release_id"
  curl -X POST http://localhost:12001/graphql \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"mutation { publishSystemRelease(id: \\\"$release_id\\\") { id version status } }\"}" 2>&1 | jq .
done

echo ""
echo "🚀 All releases published!"
echo ""
echo "Visit: http://localhost:12000/releases"
