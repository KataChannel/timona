# 🏗️ Architecture

> System architecture and technology stack

---

## 🎯 Overview

**rausachcore** is a modern fullstack platform built with:
- **Clean Architecture** - Separation of concerns
- **Monorepo** - Shared code and dependencies
- **Microservices Ready** - Modular backend
- **API-First** - GraphQL API
- **Mobile-First** - Responsive design

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Browser    │  │    Mobile    │  │   Desktop    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SSR/SSG │ App Router │ React 19 │ Apollo Client │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ GraphQL
┌─────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GraphQL API │ JWT Auth │ Guards │ Interceptors │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Services │ Resolvers │ Controllers │ Modules    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
┌─────────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│ PostgreSQL  │ │   Redis   │ │  MinIO   │ │  WebSocket│
│  (Data)     │ │  (Cache)  │ │ (Files)  │ │ (Real-time)│
└─────────────┘ └───────────┘ └──────────┘ └──────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.5.0 | React framework with SSR/SSG |
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **TailwindCSS** | v4.1.12 | Utility-first CSS |
| **Apollo Client** | 3.x | GraphQL client |
| **shadcn/ui** | Latest | Component library |
| **React Hook Form** | Latest | Form management |
| **Zustand** | Latest | State management |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 11.1.6 | Node.js framework |
| **Bun** | Latest | Fast runtime |
| **GraphQL** | Latest | API layer |
| **Apollo Server** | 4.x | GraphQL server |
| **Prisma** | 6.18.0 | ORM |
| **PostgreSQL** | 14+ | Primary database |
| **Redis** | 6+ | Caching |
| **MinIO** | Latest | Object storage |
| **JWT** | Latest | Authentication |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy |
| **PM2** | Process management |

---

## 🎨 Frontend Architecture

### Layer Structure

```
Frontend (Next.js)
├── Presentation Layer
│   ├── Pages (App Router)
│   ├── Components
│   └── Layouts
│
├── Application Layer
│   ├── Features (modules)
│   ├── Hooks
│   └── Services
│
├── Domain Layer
│   ├── Types
│   ├── Interfaces
│   └── Entities
│
└── Infrastructure Layer
    ├── GraphQL Queries
    ├── API Clients
    └── Utils
```

### Key Patterns

**Component Organization**:
- **Atomic Design** - Atoms, Molecules, Organisms
- **Feature Modules** - Self-contained features
- **Smart/Dumb Components** - Container vs Presentational

**State Management**:
- **Apollo Cache** - GraphQL data
- **Zustand** - UI state
- **React Context** - Theme, auth, etc.

**Routing**:
- **App Router** - File-based routing
- **Dynamic Routes** - `[slug]`, `[...slug]`
- **Parallel Routes** - `@modal`, `@sidebar`

---

## 🏗️ Backend Architecture

### Layer Structure

```
Backend (NestJS)
├── Presentation Layer
│   ├── Resolvers (GraphQL)
│   ├── Controllers (REST)
│   └── Guards
│
├── Application Layer
│   ├── Services
│   ├── Use Cases
│   └── DTOs
│
├── Domain Layer
│   ├── Entities
│   ├── Value Objects
│   └── Business Logic
│
└── Infrastructure Layer
    ├── Prisma (ORM)
    ├── Redis
    └── MinIO
```

### Module Organization

```typescript
backend/src/
├── auth/                 # Authentication module
├── user/                 # User management
├── ecommerce/            # E-commerce features
│   ├── product/
│   ├── cart/
│   ├── order/
│   └── payment/
├── lms/                  # LMS features
│   ├── course/
│   ├── lesson/
│   ├── quiz/
│   └── certificate/
├── pagebuilder/          # Page builder
├── blog/                 # Blog/CMS
├── project/              # Project management
├── common/               # Shared utilities
└── prisma/               # Database schema
```

### Key Patterns

**Dependency Injection**:
```typescript
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}
}
```

**Repository Pattern**:
```typescript
class ProductRepository {
  async findById(id: string): Promise<Product> {
    return this.prisma.product.findUnique({ where: { id } });
  }
}
```

**Service Layer**:
```typescript
class ProductService {
  async getProduct(id: string) {
    // Business logic here
    return this.repository.findById(id);
  }
}
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate JWT (Access + Refresh)
   ↓
4. Store Refresh Token (Redis)
   ↓
5. Return Tokens to Client
   ↓
6. Client Stores in httpOnly Cookie
   ↓
7. Send Access Token with Requests
   ↓
8. Verify JWT in Guards
   ↓
9. Extract User from Token
   ↓
10. Check Permissions (RBAC)
```

### RBAC Model

```
User
  ↓ has
Role (Admin, User, Instructor, etc.)
  ↓ has
Permissions (read:product, write:product, etc.)
  ↓ controls
Resources (Product, Course, Order, etc.)
```

---

## 📊 Data Flow

### Read Operation

```
Client
  ↓ GraphQL Query
Apollo Client (Cache Check)
  ↓ Cache Miss
Backend GraphQL Resolver
  ↓
Service Layer
  ↓
Redis Cache (Check)
  ↓ Cache Miss
Prisma ORM
  ↓
PostgreSQL Database
  ↓
Return Data
  ↓
Cache in Redis
  ↓
Return to Client
  ↓
Cache in Apollo
```

### Write Operation

```
Client
  ↓ GraphQL Mutation
Backend GraphQL Resolver
  ↓
Guard (Auth + RBAC)
  ↓
Service Layer (Business Logic)
  ↓
Prisma ORM
  ↓
PostgreSQL Database (Transaction)
  ↓
Invalidate Redis Cache
  ↓
Update Apollo Cache
  ↓
Send Notification (WebSocket)
  ↓
Return Success
```

---

## 🚀 Deployment Architecture

### Production Setup

```
Internet
  ↓
Nginx (Reverse Proxy + SSL)
  ├─→ Frontend (Port 3000)
  └─→ Backend (Port 4000)
        ├─→ PostgreSQL
        ├─→ Redis
        └─→ MinIO
```

### Multi-Domain Setup

```
Internet
  ↓
Nginx
  ├─→ rausach.com → Frontend:12000 → Backend:12001
  │                     ↓
  │                PostgreSQL:12003 (rausachcore)
  │                     ↓
  │                Redis:12004 + MinIO:12007
  │
  └─→ tazagroup.com → Frontend:13000 → Backend:13001
                        ↓
                   PostgreSQL:13003 (tazagroupcore)
                        ↓
                   Redis:13004 + MinIO:13007
```

---

## 📈 Scalability

### Horizontal Scaling

- **Frontend**: Multiple Next.js instances behind load balancer
- **Backend**: Multiple NestJS instances
- **Database**: PostgreSQL read replicas
- **Cache**: Redis cluster
- **Storage**: MinIO distributed mode

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database indexes
- Enable query caching
- Use CDN for static assets

---

## 🔍 Monitoring & Logging

- **Backend Logs**: Winston + File rotation
- **Frontend Logs**: Console + Sentry
- **Performance**: New Relic / Datadog
- **Uptime**: Pingdom / UptimeRobot
- **Errors**: Sentry

---

## 📚 Next Steps

- [Features Overview](./03-FEATURES.md)
- [Development Guide](./04-DEVELOPMENT.md)
- [API Reference](./06-API-REFERENCE.md)

---

**Last Updated**: 2025-11-21  
**Complexity**: Intermediate  
**Read Time**: 15 minutes
