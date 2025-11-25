# 🚀 rausachcore - Modern Fullstack Starter Kit

![rausachcore](https://img.shields.io/badge/rausachcore-Starter%20Kit-blue)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1.6-red)](https://nestjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1.12-38B2AC)](https://tailwindcss.com/)

A modern, production-ready fullstack starter kit built with the latest technologies. Get your project up and running in minutes with best practices, modern tooling, and comprehensive features out of the box.

## 📚 Documentation

**Complete documentation is available in the [`docs/`](docs/) folder**:

- 📖 [Getting Started](docs/01-GETTING-STARTED.md) - 5-minute setup guide
- 🏗️ [Architecture](docs/02-ARCHITECTURE.md) - System design and tech stack
- ✨ [Features](docs/03-FEATURES.md) - 100+ features overview
- 💻 [Development](docs/04-DEVELOPMENT.md) - Workflow and best practices
- 🚀 [Deployment](docs/05-DEPLOYMENT.md) - Production deployment guide
- 📡 [API Reference](docs/06-API-REFERENCE.md) - GraphQL API documentation
- 🐛 [Troubleshooting](docs/07-TROUBLESHOOTING.md) - Common issues and solutions

👉 **Start here**: [docs/README.md](docs/README.md)

## 🚀 Quick Start

```bash
# Deploy to production server
./deploy.sh

# Or use interactive menu
./menu.sh
```

### 🎯 **Frontend (Next.js 15 + React 19)**

## 🌐 Access URLs- ⚡ **Next.js 15** with App Router

- ⚛️ **React 19** with latest features

- **Rausach**: http://116.118.49.243:12000- 🎨 **TailwindCSS v4** with latest improvements

- **Tazagroup**: http://116.118.49.243:13000- 📱 **Responsive Design** with mobile-first approach

- 🔒 **NextAuth.js** authentication

## 🏗️ Architecture- 📊 **Apollo Client** for GraphQL

- 🧪 **Comprehensive Testing** (Jest + Cypress)

- **Backend**: NestJS + Bun.js + GraphQL + PostgreSQL

- **Frontend**: Next.js 16 (App Router)### 🏗️ **Backend (NestJS + GraphQL)**

- **Shared**: Redis (Cache) + Minio (Storage)- 🚀 **NestJS 11** with modern architecture

- **Server**: 2 Core, 4GB RAM, Ubuntu 22.04- 🔗 **GraphQL API** with Apollo Server

- 🗄️ **Prisma ORM** with PostgreSQL

## 📁 Project Structure- 🔐 **JWT Authentication** & authorization

- ⚡ **Redis** for caching and sessions

```- 📦 **File Upload** with MinIO

├── backend/              # NestJS Backend- 🛡️ **Security** best practices

├── frontend/             # Next.js Frontend  - 📈 **Health Checks** and monitoring

├── docker/               # Docker configs

├── docker-compose.hybrid.yml### 🛠️ **Developer Experience**

├── .env.rausach- 🏃‍♂️ **Bun.js** for ultra-fast package management

├── .env.tazagroup- 🐳 **Docker** containerization

├── deploy.sh            # Main deployment- � **TypeScript** throughout the stack

├── cleanup-server.sh    # Disk cleanup- 📝 **ESLint** and **Prettier** configured

└── menu.sh              # Interactive menu- 🧪 **Testing** setup for both frontend and backend

```- 📚 **Comprehensive documentation**



## 🛠️ Scripts### Local Development Setup



| Command | Description |1. **Clone the repository**

|---------|-------------|   ```bash

| `./deploy.sh` | Deploy to production |   git clone https://github.com/rausachcore/rausachcore.git

| `./menu.sh` | Management menu |   cd rausachcore

| `./cleanup-server.sh` | Clean disk space |   ```



## 📊 Monitoring2. **Start development environment**

## 🏗️ Tech Stack

```bash

# Container status| Category | Technology | Version | Purpose |

ssh root@116.118.49.243 'docker compose -f docker-compose.hybrid.yml ps'|----------|------------|---------|---------|

| **Frontend** | Next.js | 15.5.0 | React framework |

# View logs| **Frontend** | React | 19.1.1 | UI library |

ssh root@116.118.49.243 'docker compose -f docker-compose.hybrid.yml logs -f shopbackend'| **Frontend** | TailwindCSS | 4.1.12 | CSS framework |

| **Backend** | NestJS | 11.1.6 | Node.js framework |

# Resource usage| **Database** | PostgreSQL | 16+ | Primary database |

ssh root@116.118.49.243 'docker stats'| **Cache** | Redis | 7+ | Caching and sessions |

```| **Storage** | MinIO | Latest | Object storage |

| **ORM** | Prisma | 6+ | Database toolkit |

## 🎯 Ports| **API** | GraphQL | 16+ | Query language |

| **Runtime** | Bun.js | 1.0+ | JavaScript runtime |

### Rausach| **Container** | Docker | 20+ | Containerization |

- Frontend: 12000

- Backend: 12001## 🚀 Quick Start

- PostgreSQL: 12003

### 1. Clone the Repository

### Tazagroup

- Frontend: 13000```bash

- Backend: 13001  git clone https://github.com/KataChannel/katastarterkit.git

- PostgreSQL: 13003cd katastarterkit

```

### Shared

- Redis: 12004### 2. Install Dependencies

- Minio: 12007-12008

```bash

## 🧹 Maintenance# Install root dependencies

bun install

```bash

# Weekly cleanup# Install backend dependencies

ssh root@116.118.49.243 'bash /root/cleanup-server.sh'cd backend && bun install



# Restart services# Install frontend dependencies

ssh root@116.118.49.243 'cd /root/shoprausach && docker compose -f docker-compose.hybrid.yml restart'cd ../frontend && bun install && cd ..

``````



## 💾 Memory Allocation (4GB Total)### 3. Setup Environment



- Backend (2x): 512MB each = 1024MB```bash

- Frontend (2x): 256MB each = 512MB# Copy environment files

- PostgreSQL (2x): 256MB each = 512MBcp .env.example .env

- Redis: 128MBcp backend/.env.example backend/.env.local

- Minio: 128MBcp frontend/.env.example frontend/.env.local

- **Total**: ~2.3GB (58%)

# Edit environment variables as needed

## 🐛 Troubleshootingnano .env

```

### Containers unhealthy?

```bash### 4. Start Infrastructure

docker compose -f docker-compose.hybrid.yml logs shopbackend

docker compose -f docker-compose.hybrid.yml restart shopbackend```bash

```# Start PostgreSQL, Redis, and MinIO

docker-compose up -d

### Out of disk space?

```bash# Wait for services to be ready

bash cleanup-server.shsleep 10

``````



### Frontend not loading?### 5. Setup Database

```bash

curl http://116.118.49.243:12001/graphql -d '{"query":"{__typename}"}'```bash

```# Generate Prisma client

cd backend && bunx prisma generate

## 📈 Optimizations

# Run database migrations

✅ Multi-stage Docker builds (70% smaller)  bunx prisma migrate dev

✅ Production dependencies only  

✅ PostgreSQL tuned for 2-core  # Seed the database (optional)

✅ Redis LRU eviction  bunx prisma db seed

✅ Optimized memory allocation  ```



## 📄 License### 6. Start Development Servers



MIT```bash

# Start both frontend and backend
bun run dev

# Or start them separately:
# bun run dev:backend  # http://localhost:14000
# bun run dev:frontend # http://localhost:13000
```

### 7. Access Your Application

- **Frontend**: http://localhost:13000
- **Backend API**: http://localhost:14000
- **GraphQL Playground**: http://localhost:14000/graphql
- **MinIO Console**: http://localhost:9001

## 📁 Project Structure

```
rausachcore/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   └── pages/           # Pages router (optional)
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # NestJS application
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── graphql/         # GraphQL resolvers
│   │   ├── prisma/          # Database service
│   │   └── main.ts          # Application entry
│   ├── prisma/              # Database schema
│   └── package.json
├── docker/                   # Docker configurations
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Development services
└── package.json             # Root workspace
```

## 🛠️ Available Scripts

### Root Commands
```bash
bun run dev          # Start both frontend and backend
bun run build        # Build both applications
bun run test         # Run all tests
bun run lint         # Lint all code
bun run format       # Format all code
bun run clean        # Clean dependencies
```

### Backend Commands
```bash
cd backend
bun run dev          # Start development server
bun run build        # Build for production
bun run test         # Run tests
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed database
bun run db:studio    # Open Prisma Studio
```

### Frontend Commands
```bash
cd frontend
bun run dev          # Start development server
bun run build        # Build for production
bun run test         # Run tests
bun run test:e2e     # Run E2E tests
bun run storybook    # Start Storybook
```

## 🔧 Configuration

### Environment Variables

The starter kit uses environment variables for configuration. Key variables include:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# MinIO
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Frontend
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:14000/graphql
NEXTAUTH_SECRET=your-nextauth-secret
```

### Database Schema

The project includes a complete database schema with:
- User management
- Authentication tables
- File upload tracking
- Audit logs

Customize the schema in `backend/prisma/schema.prisma`.

## 🧪 Testing

### Backend Testing
```bash
cd backend
bun test              # Unit tests
bun run test:e2e      # E2E tests
bun run test:cov      # Coverage report
```

### Frontend Testing
```bash
cd frontend
bun test              # Unit tests with Jest
bun run test:e2e      # E2E tests with Cypress
```

## 🚀 Production Deployment

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build applications: `bun run build`
2. Setup production database
3. Configure environment variables
4. Deploy to your hosting platform

## 📚 Documentation

### Core Documentation
- [**Getting Started**](docs/getting-started.md) - Detailed setup guide
- [**Frontend Guide**](docs/frontend-setup.md) - Frontend development
- [**Backend Guide**](docs/backend-setup.md) - Backend development
- [**API Documentation**](docs/api.md) - GraphQL API reference
- [**Deployment Guide**](docs/deployment.md) - Production deployment

### 🚀 Universal Dynamic Query System (NEW)
Modern, flexible query system that eliminates GraphQL schema conflicts and provides powerful Prisma-based queries.

**Quick Start:**
- [**📖 Documentation Index**](docs/DOCUMENTATION-INDEX.md) - Complete guide navigation
- [**⚡ Quick Reference**](docs/QUICK-REFERENCE-USESEARCHUSERS.md) - Fast lookup & examples
- [**🎨 Visual Architecture**](docs/ARCHITECTURE-VISUAL-DIAGRAM.md) - System diagrams

**Detailed Guides:**
- [**🔧 Migration Report**](docs/USERSEARCH-DYNAMIC-QUERY-MIGRATION.md) - useSearchUsers migration
- [**🎉 Complete Report**](docs/DYNAMIC-QUERY-MIGRATION-COMPLETE.md) - Full implementation details
- [**🐛 Bug Fix Guide**](docs/SEARCHUSERS-BUG-FIX-GUIDE.md) - Problem analysis & solutions

**System Documentation:**
- [**Backend System**](docs/DYNAMIC-QUERY-SYSTEM.md) - Server-side implementation
- [**Frontend Integration**](docs/FRONTEND-DYNAMIC-QUERY-GUIDE.md) - Client-side hooks

**Examples:**
- [**💻 Code Examples**](frontend/src/components/examples/UserSearchExamples.tsx) - Production-ready samples

### 🎨 Advanced Page Builder System (NEW)
Modern, nested block-based page builder with dynamic content and advanced layouts.

**Quick Start:**
- [**🚀 Quick Start Guide**](PAGE_BUILDER_QUICK_START.md) - Get started in 5 minutes
- [**📖 Complete Implementation**](PAGE_BUILDER_IMPLEMENTATION_COMPLETE.md) - Full system overview
- [**🇻🇳 Vietnamese Guide**](PAGE_BUILDER_COMPLETE_VIETNAMESE_SUMMARY.md) - Hướng dẫn tiếng Việt

**Core Documentation:**
- [**🏗️ Implementation Guide**](PAGE_BUILDER_NESTED_BLOCKS_IMPLEMENTATION.md) - Architecture & components
- [**🔧 Hook API Reference**](docs/NESTED_BLOCK_HOOK_GUIDE.md) - useNestedBlockOperations guide
- [**✅ Task 9 Report**](TASK_9_COMPLETION_REPORT.md) - Hook implementation details

**Features:**
- ✨ **Nested Blocks**: Unlimited nesting depth (recommended max: 4 levels)
- 📦 **5 Container Types**: Container, Section, Grid, FlexRow, FlexColumn
- ⚡ **Dynamic Blocks**: Data fetching from API/GraphQL with templates
- 🎯 **10 Hook Operations**: Complete nested block management
- 🔄 **Recursive Rendering**: Automatic nested structure rendering
- 📊 **GraphQL API**: Full nested queries and mutations

**Example Component:**
- [**💻 Example Implementation**](frontend/src/components/page-builder/NestedPageBuilder.example.tsx) - Full UI example

### 🏗️ Nested Blocks Feature (LATEST)
Complete implementation of hierarchical, nestable block structures in Page Builder.

**Quick Start:**
- [**⚡ Quick Reference**](QUICK-REFERENCE-NESTED-BLOCKS.md) - 2-minute overview
- [**🧪 Testing Guide**](NESTED-BLOCKS-TESTING-GUIDE.md) - Test procedures & validation
- [**📋 Implementation Details**](NESTED-BLOCKS-IMPLEMENTATION.md) - Technical architecture
- [**✅ Complete Report**](NESTED-BLOCKS-COMPLETE-REPORT.md) - Full feature summary

**What's New:**
- ✅ Add child blocks to any container (right-click "Add Block")
- ✅ Edit, delete, and reorder child blocks
- ✅ Nest containers unlimited levels (max 5 recommended)
- ✅ All container types fully supported
- ✅ Proper spacing and layout for children
- ✅ Full drag-and-drop support for reordering

### 🎯 Dynamic Block System (NEW)
Powerful dynamic content system that fetches and renders data from multiple sources with flexible templating.

**Quick Start:**
- [**⚡ Quick Start Guide**](DYNAMIC_BLOCK_QUICK_START.md) - Get started in 15 minutes
- [**📖 Complete Guide**](DYNAMIC_BLOCK_GUIDE.md) - Full documentation with all features
- [**📚 Documentation Index**](DYNAMIC_BLOCK_INDEX.md) - Navigation guide

**Features:**
- ✅ **Multiple Data Sources**: Static, REST API, GraphQL, Database
- ✅ **Template System**: Flexible Handlebars-like templates
- ✅ **Repeater Pattern**: Loop through arrays and render multiple items
- ✅ **Conditional Rendering**: Display content based on conditions
- ✅ **Real-time Updates**: Auto-refresh data at intervals
- ✅ **Error Handling**: Graceful error display and fallbacks

**Data Source Support:**
- 📊 **Static Data**: Hard-coded JSON objects
- 🔌 **REST API**: HTTP endpoints with custom headers
- 🔗 **GraphQL**: GraphQL queries with variables
- 🗄️ **Database**: Direct Prisma queries

**Common Use Cases:**
- Product listings and carousels
- Blog post feeds
- Testimonials and reviews
- Category showcases
- Team member directories
- Live pricing tables
- Recent news/updates

**Features:**
- ✅ No GraphQL schema conflicts
- ✅ Multi-field search (email, username, name)
- ✅ Advanced filtering (role, status, dates)
- ✅ Parallel query execution
- ✅ 100% backward compatible
- ✅ Type-safe with TypeScript

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

## 🔗 Links

- [GitHub Repository](https://github.com/KataChannel/katastarterkit)
- [Issue Tracker](https://github.com/KataChannel/katastarterkit/issues)
- [Discussions](https://github.com/KataChannel/katastarterkit/discussions)

---

**Happy coding! 🎉**

> **rausachcore** - Build faster, ship smarter.
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS 3.x
- **Language**: TypeScript 5.x
- **Runtime**: Bun.js for improved performance
- **State Management**: React Query + Zustand
- **Authentication**: NextAuth.js

### Backend
- **Framework**: NestJS 10.x
- **API**: GraphQL with Apollo Server
- **Language**: TypeScript 5.x
- **Runtime**: Bun.js for improved performance
- **Database ORM**: Prisma 5.x
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator + class-transformer

### Database & Storage
- **Primary Database**: PostgreSQL 15
- **Caching**: Redis 7.x Cluster
- **Object Storage**: MinIO (S3-compatible)
- **Search**: Elasticsearch 8.x (planned)

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (k3s)
- **Ingress**: NGINX Ingress Controller
- **SSL/TLS**: cert-manager with Let's Encrypt
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions
- **Service Mesh**: Istio (planned)

## � Development Commands

### Using Makefile (Recommended)

```bash
# Install all dependencies
make install

# Start development environment
make dev

# Run tests
make test

# Build for production
make build

# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-production

# Database operations
make db-reset      # Reset database
make db-migrate    # Run migrations
make db-seed       # Seed database

# Monitoring
make logs          # View application logs
make monitor       # Open monitoring dashboard
```

### Manual Commands

#### Backend Development
```bash
cd backend

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test
bun run test:e2e

# Database operations
bun run prisma:migrate
bun run prisma:generate
bun run prisma:seed

# Build for production
bun run build
```

#### Frontend Development
```bash
cd frontend

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build for production
bun run build

# Start production server
bun run start
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Validation**: Input validation with class-validator
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy (CSP) headers
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Rate Limiting**: API rate limiting with Redis
- **SSL/TLS**: Automatic HTTPS with Let's Encrypt
- **Secrets Management**: Kubernetes secrets for sensitive data
- **Network Policies**: Kubernetes network isolation

## 📊 Monitoring & Observability

### Metrics & Monitoring
- **Application Metrics**: Custom Prometheus metrics
- **System Metrics**: Node Exporter for system monitoring
- **Database Metrics**: PostgreSQL Exporter
- **Cache Metrics**: Redis Exporter
- **Custom Dashboards**: Grafana dashboards for visualization

### Logging
- **Structured Logging**: JSON-formatted logs with Winston
- **Log Aggregation**: Centralized logging with Kubernetes
- **Log Levels**: Configurable log levels per environment
- **Request Tracking**: Correlation IDs for request tracing

### Health Checks
- **Application Health**: Custom health check endpoints
- **Database Health**: Connection and query performance monitoring
- **Cache Health**: Redis cluster status monitoring
- **Infrastructure Health**: Kubernetes resource monitoring

## � Deployment

### Development Deployment
```bash
# Start local development environment
docker-compose up -d

# Initialize database
make db-setup

# Start development servers
make dev
```

### Staging Deployment
```bash
# Deploy to staging Kubernetes cluster
make deploy-staging

# Check deployment status
kubectl get pods -n rausachcore-staging

# View logs
kubectl logs -f deployment/backend -n rausachcore-staging
```

### Production Deployment
```bash
# Deploy to production Kubernetes cluster
make deploy-production

# Monitor deployment
kubectl rollout status deployment/backend -n rausachcore
kubectl rollout status deployment/frontend -n rausachcore

# Verify deployment
make verify-production
```

### Cloud Server Setup
```bash
# Setup cloud server (Ubuntu 20.04+)
chmod +x k8s/scripts/setup-cloud-server.sh
./k8s/scripts/setup-cloud-server.sh

# Deploy application
chmod +x k8s/scripts/deploy.sh
./k8s/scripts/deploy.sh
```

## 📚 API Documentation

### GraphQL API
- **Endpoint**: `/graphql`
- **Playground**: Available in development at `/graphql`
- **Schema**: Auto-generated from TypeScript definitions
- **Documentation**: Introspective schema with descriptions

### REST Endpoints
- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics` (Prometheus format)
- **OpenAPI**: `GET /api/docs` (Swagger UI)

### Authentication
```graphql
# Login mutation
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    user {
      id
      email
      role
    }
  }
}

# Protected query example
query GetUserProfile {
  me {
    id
    email
    profile {
      firstName
      lastName
      avatar
    }
  }
}
```

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Jest with comprehensive coverage
- **Integration Tests**: Database and API integration testing
- **E2E Tests**: GraphQL endpoint testing
- **Load Testing**: Performance testing with Artillery

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Isolated component testing
- **E2E Tests**: Playwright for full application testing
- **Visual Tests**: Screenshot comparison testing

### Test Commands
```bash
# Run all tests
make test

# Backend tests only
make test-backend

# Frontend tests only
make test-frontend

# E2E tests
make test-e2e

# Test coverage
make test-coverage
```

## � CI/CD Pipeline

### GitHub Actions Workflows

1. **Continuous Integration** (`.github/workflows/ci-cd.yml`)
   - Code linting and formatting
   - Unit and integration tests
   - Security vulnerability scanning
   - Docker image building and pushing

2. **Monitoring** (`.github/workflows/monitoring.yml`)
   - Infrastructure health checks
   - Performance metrics collection
   - SSL certificate monitoring
   - Automated alerting

3. **Dependency Updates** (`.github/workflows/dependency-updates.yml`)
   - Automated dependency updates
   - Security audit scanning
   - Pull request creation for updates

4. **Release Management** (`.github/workflows/release.yml`)
   - Automated release creation
   - Changelog generation
   - Production deployment
   - Release notifications

### Deployment Pipeline
```
Code Push → Tests → Build → Security Scan → Deploy Staging → Tests → Deploy Production → Monitor
```

## 🛡️ Security & Best Practices

### Code Quality
- **ESLint**: Strict linting rules for code consistency
- **Prettier**: Code formatting automation
- **Husky**: Git hooks for pre-commit validation
- **TypeScript**: Strict type checking
- **SonarQube**: Code quality analysis

### Security Scanning
- **Trivy**: Container vulnerability scanning
- **npm audit**: Dependency vulnerability scanning
- **SAST**: Static Application Security Testing
- **Dependabot**: Automated security updates

### Performance Optimization
- **Bun.js Runtime**: Improved JavaScript performance
- **Code Splitting**: Optimized bundle loading
- **Image Optimization**: Next.js image optimization
- **Caching Strategy**: Multi-layer caching with Redis
- **CDN Integration**: Static asset optimization

## 📖 Documentation

- [Backend Setup Guide](docs/backend-setup.md)
- [Frontend Setup Guide](docs/frontend-setup.md)
- [Deployment Guide](docs/deployment.md)
- [API Documentation](docs/api.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code of Conduct
This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NestJS Team** for the excellent backend framework
- **Next.js Team** for the powerful React framework
- **Prisma Team** for the outstanding database toolkit
- **Bun Team** for the fast JavaScript runtime
- **Kubernetes Community** for container orchestration
- **Open Source Community** for inspiration and tools

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/rausachcore/rausachcore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rausachcore/rausachcore/discussions)
- **Security**: [security@rausachcore.dev](mailto:security@rausachcore.dev)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rausachcore/rausachcore&type=Date)](https://star-history.com/#rausachcore/rausachcore&Date)

---

<div align="center">
  <strong>Built with ❤️ by the rausachcore Team</strong>
  <br>
  <sub>Making fullstack development accessible and scalable</sub>
</div>
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Inspired by best practices from the developer community
- Optimized for developer experience and production performance

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/KataChannel/katastarterkit/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/KataChannel/katastarterkit/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/KataChannel/katastarterkit/discussions)

---

**Happy coding! 🎉**

> **rausachcore** - Build faster, ship smarter.

⭐ **If you find this project helpful, please give it a star on GitHub!**




docker stop $(docker ps -q) 2>/dev/null
docker container prune
docker builder prune -f
docker image prune -a -f
docker network prune -f
echo "Đã xóa sạch, GIỮ LẠI VOLUME!"