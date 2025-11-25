# 🔧 Development Guide

> Complete development workflow and best practices

---

## 🚀 Quick Reference

```bash
# Start development
bun run dev:rausach           # Rausach domain
bun run dev:tazagroup         # Tazagroup domain

# Database operations
bun run db:push:rausach       # Push schema
bun run db:seed:rausach       # Seed data
bun run db:studio:rausach     # Prisma Studio

# Production build
bun run build                 # Build all
```

---

## 📝 Coding Standards

### TypeScript
- **Strict mode** enabled
- **Type everything** - No `any`
- **Interface over type** for objects
- **Enums** for constants

### Naming Conventions
- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Example
```typescript
// Good ✅
interface UserProfile {
  id: string;
  email: string;
}

export const getUserProfile = async (id: string): Promise<UserProfile> => {
  // ...
}

// Bad ❌
const get_user = async (id: any) => {
  // ...
}
```

---

## 🎨 Frontend Development

### Component Structure
```typescript
// components/ProductCard.tsx
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
}

export function ProductCard({ id, name, price }: ProductCardProps) {
  return (
    <Card>
      <h3>{name}</h3>
      <p>${price}</p>
    </Card>
  );
}
```

### GraphQL Queries
```typescript
// lib/graphql/queries/product.ts
import { gql } from '@apollo/client';

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price
      description
    }
  }
`;

// Usage in component
const { data, loading } = useQuery(GET_PRODUCT, {
  variables: { id: '123' }
});
```

### State Management
- **Apollo Cache**: GraphQL data
- **Zustand**: UI state (modals, theme)
- **React Context**: Auth, settings

---

## 🏗️ Backend Development

### Module Structure
```
module/
├── entities/          # TypeORM/Prisma entities
├── dto/               # Data Transfer Objects
├── services/          # Business logic
├── resolvers/         # GraphQL resolvers
├── guards/            # Authorization guards
└── module.ts          # Module definition
```

### Service Example
```typescript
// services/product.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id }
    });
  }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data
    });
  }
}
```

### Resolver Example
```typescript
// resolvers/product.resolver.ts
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Resolver('Product')
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => Product)
  async product(@Args('id') id: string) {
    return this.productService.findById(id);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard)
  async createProduct(@Args('input') input: CreateProductDto) {
    return this.productService.create(input);
  }
}
```

---

## 🗄️ Database

### Schema Updates
```bash
# 1. Edit schema.prisma
# 2. Push to database
bun run db:push:rausach

# 3. If migrations needed
bun run db:migrate:rausach
```

### Prisma Client
```typescript
// Always use through PrismaService
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}

  async getData() {
    return this.prisma.myModel.findMany();
  }
}
```

---

## 🧪 Testing

### Unit Tests
```typescript
// product.service.spec.ts
describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductService, PrismaService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find product by id', async () => {
    const mockProduct = { id: '1', name: 'Test' };
    jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(mockProduct);

    const result = await service.findById('1');
    expect(result).toEqual(mockProduct);
  });
});
```

### E2E Tests
```typescript
// app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/graphql (POST)', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ __typename }' })
      .expect(200)
      .expect({ data: { __typename: 'Query' } });
  });
});
```

---

## 🐛 Debugging

### Backend
```typescript
// Use console.log or Winston logger
import { Logger } from '@nestjs/common';

const logger = new Logger('ProductService');
logger.debug('Finding product', { id });
logger.error('Failed to find product', error);
```

### Frontend
```typescript
// React DevTools + Apollo DevTools
console.log('Data:', data);
console.table(products);
```

### VS Code Debug Config
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "bun",
  "args": ["run", "dev"],
  "cwd": "${workspaceFolder}/backend"
}
```

---

## 📦 Dependencies

### Add Dependency
```bash
# Frontend
cd frontend && bun add <package>

# Backend
cd backend && bun add <package>

# Dev dependency
bun add -D <package>
```

### Update Dependencies
```bash
bun update
```

---

## 🔥 Common Tasks

### Create New Module
```bash
# Backend
cd backend/src
mkdir my-module
cd my-module
touch my-module.module.ts my-module.service.ts my-module.resolver.ts
```

### Add GraphQL Query
```typescript
// 1. Add to schema (auto-generated from TypeScript)
@ObjectType()
export class MyType {
  @Field()
  id: string;
}

// 2. Add resolver
@Query(() => MyType)
async getMyData() {
  return this.service.getData();
}

// 3. Use in frontend
const { data } = useQuery(GET_MY_DATA);
```

### Add New Page
```bash
# Frontend
cd frontend/src/app
mkdir my-page
touch my-page/page.tsx
```

```typescript
// my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

---

## 🎯 Best Practices

### Security
- ✅ Use JWT for authentication
- ✅ Validate all inputs (DTO)
- ✅ Use Guards for authorization
- ✅ Sanitize user content
- ✅ Use HTTPS in production
- ✅ Set secure HTTP headers

### Performance
- ✅ Use Redis caching
- ✅ Optimize database queries
- ✅ Lazy load components
- ✅ Use CDN for static assets
- ✅ Enable compression

### Code Quality
- ✅ Write tests
- ✅ Use TypeScript
- ✅ Follow naming conventions
- ✅ Document complex logic
- ✅ Review before commit

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://prisma.io/docs)
- [GraphQL Docs](https://graphql.org/learn)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

**Last Updated**: 2025-11-21  
**Read Time**: 20 minutes
