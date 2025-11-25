# Features Module

Folder này chứa các feature modules được tổ chức theo **Clean Architecture**.

## 📁 Structure

```
features/
├── menu/                   # Menu feature module
│   ├── types/             # Domain layer (types, interfaces)
│   ├── hooks/             # Application layer (business logic)
│   ├── components/        # Presentation layer (UI components)
│   └── index.ts          # Public API exports
│
└── page-builder/          # Page builder feature module
    ├── hooks/             # Application layer
    ├── components/        # Presentation layer
    └── index.ts          # Public API exports
```

## 🎯 Principles

### 1. Clean Architecture
- **Domain**: Types, interfaces, business rules
- **Application**: Hooks, use cases, business logic
- **Presentation**: React components, UI

### 2. Feature-Based Organization
- Mỗi feature là một module độc lập
- Self-contained với dependencies riêng
- Easy to add/remove features

### 3. Public API
- Mỗi feature export qua `index.ts`
- Chỉ expose những gì cần thiết
- Hide implementation details

## 🚀 Usage

### Import từ Feature Module

```typescript
// ✅ Good - Import từ public API
import { useMenu, MenuRenderer, MenuItem } from '@/features/menu';

// ❌ Bad - Import trực tiếp từ internal files
import { useMenu } from '@/features/menu/hooks/useMenu';
```

### Example Usage

```tsx
import { useHeaderMenu, MenuRenderer } from '@/features/menu';

function Header() {
  const { tree, loading } = useHeaderMenu();
  
  if (loading) return <Skeleton />;
  
  return <MenuRenderer items={tree} variant="horizontal" />;
}
```

## 📦 Available Features

### Menu Feature
**Path**: `@/features/menu`

**Exports**:
- `useMenu` - Main menu hook
- `useHeaderMenu` - Header menu convenience hook
- `useFooterMenu` - Footer menu convenience hook
- `useSidebarMenu` - Sidebar menu hook
- `useMobileMenu` - Mobile menu hook
- `MenuRenderer` - Menu rendering component
- `MenuItem` - Menu item type
- `MenuType` - Menu type enum
- `MenuTarget` - Menu target enum
- `MenuLinkType` - Menu link type enum

### Page Builder Feature
**Path**: `@/features/page-builder`

**Exports**:
- `usePageLayout` - Page layout management hook
- `PageLayoutSettings` - Layout settings component

## 🔧 Adding New Features

### Template

```
features/
└── your-feature/
    ├── types/
    │   └── your-feature.types.ts    # Domain types
    ├── hooks/
    │   └── useYourFeature.ts        # Business logic
    ├── components/
    │   └── YourComponent.tsx        # UI components
    └── index.ts                     # Public exports
```

### Example

```typescript
// features/your-feature/index.ts
export * from './types/your-feature.types';
export * from './hooks/useYourFeature';
export * from './components/YourComponent';
```

## 📖 Documentation

Xem chi tiết tại: [docs/REFACTORING_MENU_PAGEBUILDER.md](../../docs/REFACTORING_MENU_PAGEBUILDER.md)

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for functions, PascalCase for components/types
- **Exports**: Named exports preferred over default
- **Comments**: JSDoc for public APIs

## ✅ Best Practices

1. **Single Responsibility** - Mỗi file có một mục đích duy nhất
2. **Type Safety** - Always use TypeScript types
3. **Immutability** - Không mutate state trực tiếp
4. **Performance** - Use memoization khi cần
5. **Testing** - Write tests cho hooks và components
6. **Documentation** - Comment public APIs

---

**Maintained by**: Development Team  
**Last Updated**: 5 tháng 11, 2025
