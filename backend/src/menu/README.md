# Menu Module - Senior Level Architecture

## 📁 Folder Structure

```
src/menu/
├── constants/
│   └── menu.constants.ts          # Constants & configuration
├── dto/
│   ├── create-menu.dto.ts         # Create menu DTO with validation
│   ├── update-menu.dto.ts         # Update menu DTO with validation
│   ├── menu-filter.dto.ts         # Filter DTO for queries
│   ├── menu-response.dto.ts       # Response DTOs
│   └── index.ts                   # Barrel export
├── exceptions/
│   └── menu.exceptions.ts         # Custom exceptions
├── repositories/
│   └── menu.repository.ts         # Data access layer (DAL)
├── menu.service.refactored.ts     # Business logic layer
├── menu.resolver.refactored.ts    # GraphQL resolver
├── menu.module.ts                 # NestJS module
└── menu.graphql                   # GraphQL schema definition
```

## 🏗️ Architecture Principles

### 1. **Layered Architecture**
```
Resolver (Presentation) 
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database
```

### 2. **Separation of Concerns**
- **DTOs**: Input/Output data transfer objects with validation
- **Entities**: Database models (Prisma)
- **Exceptions**: Custom error handling
- **Constants**: Configuration values
- **Repositories**: Database operations only

### 3. **SOLID Principles**
- **S**: Single Responsibility - Each class has one job
- **O**: Open/Closed - DTOs are extensible
- **L**: Liskov Substitution - Interfaces are consistent
- **I**: Interface Segregation - Small, focused interfaces
- **D**: Dependency Inversion - Depend on abstractions (Repository pattern)

## 🎯 Key Features

### DTOs with Validation
```typescript
@InputType()
export class CreateMenuDto {
  @Field()
  @IsString()
  @Length(1, 100)
  title!: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;
}
```

### Custom Exceptions
```typescript
export class MenuNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Menu with identifier "${identifier}" not found`);
  }
}
```

### Repository Pattern
```typescript
@Injectable()
export class MenuRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findById(id: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({ where: { id } });
  }
}
```

### Service Layer
```typescript
@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}
  
  async createMenu(dto: CreateMenuDto): Promise<MenuResponseDto> {
    // Business logic here
  }
}
```

## 📝 Usage Examples

### Create Menu
```graphql
mutation {
  createMenu(input: {
    title: "Dashboard"
    slug: "dashboard"
    type: SIDEBAR
    route: "/admin/dashboard"
    icon: "LayoutDashboard"
  }) {
    id
    title
    slug
  }
}
```

### Query Menus
```graphql
query {
  menus(
    filter: { type: SIDEBAR, isActive: true }
    page: 1
    limit: 20
  ) {
    items {
      id
      title
      slug
    }
    total
    hasMore
  }
}
```

### Get Menu Tree
```graphql
query {
  menuTree(type: SIDEBAR) {
    id
    title
    children {
      id
      title
    }
  }
}
```

## 🛡️ Error Handling

All errors are properly typed and handled:

```typescript
try {
  await menuService.createMenu(dto);
} catch (error) {
  if (error instanceof MenuAlreadyExistsException) {
    // Handle duplicate
  } else if (error instanceof MenuMaxDepthExceededException) {
    // Handle max depth
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
- Test service methods in isolation
- Mock repository layer
- Test business logic edge cases

### Integration Tests
- Test resolver → service → repository flow
- Use test database
- Test GraphQL queries/mutations

### E2E Tests
- Test full user flows
- Test authentication/authorization
- Test error scenarios

## 🚀 Performance Optimizations

1. **Pagination**: Default page size of 50, max 100
2. **Indexing**: Database indexes on slug, type, parentId
3. **Eager Loading**: Include relations in repository
4. **Caching**: Can add Redis caching at service layer
5. **Query Optimization**: Use Prisma's `select` and `include`

## 📊 Best Practices Implemented

✅ **Type Safety**: Strict TypeScript, no `any`
✅ **Validation**: class-validator decorators
✅ **Error Handling**: Custom exceptions
✅ **Logging**: Structured logging with Logger
✅ **Documentation**: JSDoc comments
✅ **Consistency**: Naming conventions (DTOs, Services, etc.)
✅ **Separation**: Clear layer boundaries
✅ **Testability**: Dependency injection
✅ **Security**: Input validation, SQL injection protection
✅ **Scalability**: Repository pattern for easy database switching

## 🔄 Migration Guide

To switch from old implementation to refactored:

1. **Update imports**:
```typescript
// Old
import { MenuService } from './menu.service';
import { CreateMenuInput } from './menu.service';

// New
import { MenuService } from './menu.service.refactored';
import { CreateMenuDto } from './dto';
```

2. **Update module**:
```typescript
import { MenuRepository } from './repositories/menu.repository';

@Module({
  providers: [MenuService, MenuResolver, MenuRepository],
})
```

3. **Test thoroughly** before deploying to production

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
