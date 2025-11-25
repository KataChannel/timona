# 📚 Documentation

> **rausachcore** - Modern Fullstack Starter Kit

---

## 📖 Quick Navigation

| Document | Description | Read Time |
|----------|-------------|-----------|
| [🚀 Getting Started](./01-GETTING-STARTED.md) | Quick setup & installation | 5 min |
| [🏗️ Architecture](./02-ARCHITECTURE.md) | System architecture & tech stack | 10 min |
| [⚙️ Features](./03-FEATURES.md) | Complete feature list | 15 min |
| [🔧 Development](./04-DEVELOPMENT.md) | Development guide | 20 min |
| [🚢 Deployment](./05-DEPLOYMENT.md) | Production deployment | 15 min |
| [📘 API Reference](./06-API-REFERENCE.md) | GraphQL API docs | 30 min |
| [🐛 Troubleshooting](./07-TROUBLESHOOTING.md) | Common issues & fixes | - |
| [🚀 Release Hub Guide](./08-RELEASE-HUB-GUIDE.md) | Release & Support Center system | 20 min |

---

## 🎯 Quick Start

```bash
# 1. Clone & Setup
git clone <repository>
cd shoprausach
bun install

# 2. Environment
cp .env.example .env.local

# 3. Database
bun run db:push
bun run db:seed

# 4. Start Development
bun run dev:rausach  # Port 12000/12001
```

---

## 🏗️ Tech Stack

**Frontend**
- Next.js 15 + React 19
- TailwindCSS v4
- Apollo Client
- TypeScript

**Backend**
- NestJS 11 + Bun
- GraphQL + Apollo
- Prisma ORM
- PostgreSQL

**Infrastructure**
- Redis (Cache)
- MinIO (Storage)
- Docker

---

## 📂 Project Structure

```
shoprausach/
├── frontend/          # Next.js application
├── backend/           # NestJS application
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── docker/            # Docker configs
```

---

## 🎯 Key Features

✅ **Authentication & RBAC** - JWT + Role-based access control  
✅ **E-commerce** - Products, Cart, Orders, Payments  
✅ **CMS** - Page Builder, Blog, Menu Management  
✅ **LMS** - Courses, Lessons, Quizzes, Certificates  
✅ **Project Management** - Tasks, Chat, Files  
✅ **Advanced Tables** - Google Sheets-like interface  
✅ **Real-time** - WebSocket, Notifications  
✅ **Multi-domain** - Rausach + Tazagroup  
✅ **File Manager** - Upload, Storage, CDN  
✅ **Analytics** - Dashboards, Reports  
✅ **Mobile First** - Responsive design  
✅ **SEO** - Metadata, Sitemap, SSR  
✅ **PWA** - Offline support, Push notifications  

---

## 🚀 Scripts

### Development
```bash
bun run dev:rausach           # Rausach (12000/12001)
bun run dev:tazagroup         # Tazagroup (13000/13001)
bun run dev:rausach:backend   # Backend only
bun run dev:rausach:frontend  # Frontend only
```

### Database
```bash
bun run db:push              # Push schema
bun run db:seed              # Seed data
bun run db:studio            # Prisma Studio
bun run db:migrate           # Create migration
```

### Production
```bash
bun run build                # Build all
bun run docker:prod          # Docker production
./deploy.sh                  # Deploy to server
```

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: Create GitHub issue
- **Email**: support@rausach.com

---

## 📝 License

MIT License - See [LICENSE](../LICENSE) for details.

---

**Last Updated**: 2025-11-21  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
