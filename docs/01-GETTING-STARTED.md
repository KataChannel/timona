# 🚀 Getting Started

> Quick setup guide to get rausachcore running in 5 minutes

---

## ✅ Prerequisites

- **Bun** >= 1.0.0 ([install](https://bun.sh))
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0
- **Git**

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourorg/shoprausach.git
cd shoprausach
```

### 2. Install Dependencies

```bash
bun install
```

This installs dependencies for both frontend and backend (monorepo setup).

### 3. Environment Setup

**Rausach (Development)**:
```bash
cp .env.dev.rausach.example .env.dev.rausach
```

**Tazagroup (Development)**:
```bash
cp .env.dev.tazagroup.example .env.dev.tazagroup
```

**Edit your `.env.dev.rausach` file**:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rausachcore"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# JWT
JWT_SECRET="your-secret-key-here"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:12001/graphql"
```

---

## 🗄️ Database Setup

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL, Redis, MinIO
bun run docker:dev
```

### Option 2: Local Install

Install PostgreSQL, Redis, MinIO manually and configure URLs in `.env`.

### Initialize Database

```bash
# Push schema to database
bun run db:push:rausach

# Seed initial data
bun run db:seed:rausach
```

---

## 🚀 Start Development

### Start Both Frontend + Backend (Rausach)

```bash
bun run dev:rausach
```

This starts:
- **Backend**: http://localhost:12001
- **Frontend**: http://localhost:12000
- **GraphQL Playground**: http://localhost:12001/graphql

### Start Individual Services

```bash
# Backend only
bun run dev:rausach:backend

# Frontend only
bun run dev:rausach:frontend
```

### Start Tazagroup

```bash
bun run dev:tazagroup
```

This starts:
- **Backend**: http://localhost:13001
- **Frontend**: http://localhost:13000

---

## 🎯 First Steps

### 1. Access GraphQL Playground

Visit http://localhost:12001/graphql

Test query:
```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```

### 2. Login to Admin

Visit http://localhost:12000/admin/login

**Default Admin**:
- Email: `admin@rausach.com`
- Password: `Admin@123`

### 3. Explore Features

- **Admin Dashboard**: `/admin`
- **Page Builder**: `/admin/pagebuilder`
- **Products**: `/admin/products`
- **LMS Courses**: `/admin/lms/courses`
- **File Manager**: `/admin/files`

---

## 📂 Project Structure

```
shoprausach/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   ├── features/         # Feature modules
│   │   ├── lib/              # GraphQL queries, utils
│   │   └── styles/           # Global styles
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── auth/             # Authentication
│   │   ├── user/             # User management
│   │   ├── ecommerce/        # E-commerce modules
│   │   ├── lms/              # LMS modules
│   │   ├── pagebuilder/      # Page builder
│   │   └── prisma/           # Database schema
│   └── package.json
│
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
└── docker/                   # Docker configs
```

---

## 🔧 Development Tools

### Prisma Studio

Visual database browser:

```bash
bun run db:studio:rausach
```

Visit: http://localhost:5555

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- Prisma
- GraphQL
- TailwindCSS IntelliSense

---

## 📊 Verify Setup

### Check Backend Health

```bash
curl http://localhost:12001/test/ping
```

Expected response: `pong`

### Check Database Connection

```bash
curl http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

Expected: `{"data":{"__typename":"Query"}}`

---

## 🐛 Common Issues

### Port Already in Use

```bash
# Kill processes on ports
bun run kill:12000
bun run kill:12001
bun run kill:13000
bun run kill:13001
```

### Database Connection Error

1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env.dev.rausach`
3. Test connection: `psql $DATABASE_URL`

### Redis Connection Error

1. Check Redis is running: `redis-cli ping`
2. Verify REDIS_HOST and REDIS_PORT in `.env`

### MinIO Connection Error

1. Check MinIO is running: `curl http://localhost:9000/minio/health/live`
2. Verify credentials in `.env`

---

## 🎓 Next Steps

1. **Read Architecture**: [02-ARCHITECTURE.md](./02-ARCHITECTURE.md)
2. **Explore Features**: [03-FEATURES.md](./03-FEATURES.md)
3. **Development Guide**: [04-DEVELOPMENT.md](./04-DEVELOPMENT.md)
4. **Deploy to Production**: [05-DEPLOYMENT.md](./05-DEPLOYMENT.md)

---

## 📞 Need Help?

- Check [Troubleshooting Guide](./07-TROUBLESHOOTING.md)
- Create GitHub issue
- Contact: support@rausach.com

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy  
**Last Updated**: 2025-11-21
