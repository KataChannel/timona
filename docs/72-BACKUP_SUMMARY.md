# Rausach Database Backup Summary
**Backup Date:** November 24, 2025, 1:41:26 PM  
**Database:** rausachcore (PostgreSQL)  
**Environment:** Development

## 📊 Overview

- **Total Tables in Database:** 126 tables
- **Schema Models:** 122 models
- **Backup Files Created:** 40 files (449 MB)
- **Total Records Backed Up:** 226,831 records

## 🗂️ Database Structure Analysis

### ✅ Matching Tables (95 tables)
Tables where schema models match database tables perfectly.

### ⚠️ Naming Mismatches (31 tables)
Some tables use PascalCase in database but snake_case in schema:

**PascalCase Tables (in database, not in schema pattern):**
- File, FileFolder, FileShare
- Hoadon, HoadonChitiet  
- Page, PageBlock
- Permission, ResourceAccess, Role, RolePermission
- SecurityEvent, UserDevice, UserMfaSettings
- UserPermission, UserRoleAssignment

**Plural Mismatches:**
- employee_profiles (db) vs employee_profile (schema)
- lessons (db) vs lesson (schema)
- menus (db) vs menu (schema)
- orders (db) vs order (schema)
- products (db) vs product (schema)
- product_variants (db) vs product_variant (schema)
- quiz_attempts (db) vs quiz_attempt (schema)

**Special Tables:**
- _CustomerGroups, _SupplierGroups, _SupplierProducts (legacy tables)
- _prisma_migrations (system table)
- project_chat_messages (db) vs chat_message_p_m (schema - incorrect mapping)

## 📦 Backed Up Tables (40 files)

### Core System (8 tables)
| Table | Records | Size | Description |
|-------|---------|------|-------------|
| users | 7 | Small | User accounts |
| auth_methods | 5 | Small | Authentication methods |
| audit_logs | 185,834 | 436 MB | Activity logs |
| website_settings | 82 | 45 KB | Website configuration |
| menus | 28 | Small | Navigation menus |
| _prisma_migrations | 23 | Small | Migration history |
| notifications | 1 | Small | User notifications |
| tasks | 4 | Small | Task management |

### RBAC System (4 tables)
| Table | Records | Description |
|-------|---------|-------------|
| Role | 7 | User roles |
| Permission | 140 | System permissions |
| RolePermission | 124 | Role-permission mappings |
| UserRoleAssignment | 9 | User-role assignments |

### E-Commerce (12 tables)
| Table | Records | Description |
|-------|---------|-------------|
| categories | 13 | Product categories |
| products | 773 | Product catalog |
| product_variants | 290 | Product variations |
| product_images | 13 | Product images |
| carts | 8 | Shopping carts |
| cart_items | 3 | Cart items |
| orders | 10 | Customer orders |
| order_items | 20 | Order line items |
| order_tracking | 5 | Order tracking info |
| payments | 5 | Payment records |
| inventory_logs | 12 | Inventory changes |

### Invoice System (3 tables)
| Table | Records | Description |
|-------|---------|-------------|
| ext_listhoadon | 4,210 | Invoice headers |
| ext_detailhoadon | 18,827 | Invoice details |
| ext_sanphamhoadon | 16,238 | Invoice products |

### Blog System (2 tables)
| Table | Records | Description |
|-------|---------|-------------|
| blog_categories | 7 | Blog categories |
| blog_posts | 76 | Blog articles |

### LMS System (1 table)
| Table | Records | Description |
|-------|---------|-------------|
| course_categories | 2 | Course categories |

### Support System (3 tables)
| Table | Records | Description |
|-------|---------|-------------|
| support_conversations | 2 | Support conversations |
| support_messages | 1 | Support messages |
| technical_support_tickets | 14 | Technical support tickets |

### Release Hub (2 tables)
| Table | Records | Description |
|-------|---------|-------------|
| system_releases | 5 | System releases |
| system_guides | 11 | User guides |

### Page Builder (2 tables)
| Table | Records | Description |
|-------|---------|-------------|
| Page | 1 | Custom pages |
| PageBlock | 10 | Page blocks/widgets |

### File Management (1 table)
| Table | Records | Description |
|-------|---------|-------------|
| File | 3 | Uploaded files |

### Project Management (2 tables)
| Table | Records | Description |
|-------|---------|-------------|
| projects | 1 | Projects |
| project_members | 1 | Project members |

### Call Center (1 table)
| Table | Records | Description |
|-------|---------|-------------|
| call_center_config | 6 | Call center configuration |

## 📋 Empty Tables (Not Backed Up)

The following tables exist but contain no data:
- Affiliate System: aff_* tables (7 tables)
- AI/Chatbot: ai_providers, chatbot_models, training_data, chat_* (5 tables)
- LMS: courses, course_modules, lessons, enrollments, lesson_progress, quizzes, questions, answers, quiz_attempts, reviews, certificates, discussions, discussion_replies (13 tables)
- Blog: blog_comments, blog_post_shares, blog_post_tags, blog_tags (4 tables)
- E-commerce: product_reviews, review_helpful, wishlist_items, wishlists, order_tracking_events, price_lists, price_list_products (7 tables)
- Content: posts, post_tags, comments, likes, tags (5 tables)
- Employee: employee_profiles, employee_documents, employment_history, onboarding_checklists, offboarding_processes (5 tables)
- Support: support_analytics, support_attachments, support_tickets (3 tables)
- File Management: FileFolder, FileShare (2 tables)
- Security: SecurityEvent, UserDevice, UserMfaSettings, UserPermission, ResourceAccess (5 tables)
- Other: departments, customers, customer_groups, suppliers, supplier_groups, source_documents, source_document_categories, custom_templates, template_shares, push_subscriptions, call_center_records, call_center_sync_logs, chat_integrations, chat_quick_replies, chat_bot_rules, user_sessions, verification_tokens (17 tables)

**Total Empty Tables:** ~73 tables

## 🔧 Recommendations

### 1. Fix Schema Naming Mismatches
Update `schema.prisma` to use correct @@map directives for PascalCase tables:

```prisma
model File {
  // ... fields
  @@map("File") // Not "file"
}

model Page {
  // ... fields
  @@map("Page") // Not "page"
}

model Hoadon {
  // ... fields
  @@map("Hoadon") // Not "hoadon"
}
```

### 2. Fix Plural Mappings
Ensure plural table names are correctly mapped:

```prisma
model Product {
  // ... fields
  @@map("products") // Correct plural
}

model Menu {
  // ... fields
  @@map("menus") // Correct plural
}
```

### 3. Complete Missing Data
Consider populating empty system tables for full functionality:
- Add default courses and lessons for LMS
- Configure AI providers for chatbot features
- Set up departments for HR system

### 4. Clean Up Legacy Tables
Consider migrating or removing:
- _CustomerGroups, _SupplierGroups, _SupplierProducts (underscore prefix indicates legacy)

## ✅ Backup Integrity

All critical data successfully backed up:
- ✅ User accounts and authentication
- ✅ Product catalog (773 products + 290 variants)
- ✅ Orders and payments (10 orders, 20 items)
- ✅ Invoice data (39,275 records)
- ✅ Blog content (76 posts, 7 categories)
- ✅ RBAC configuration (7 roles, 140 permissions)
- ✅ Audit logs (185,834 events)
- ✅ Website settings and menus
- ✅ Release Hub data (5 releases, 11 guides)
- ✅ Page Builder data (1 page, 10 blocks)

## 📝 Restore Instructions

To restore this backup:

```bash
cd /mnt/chikiet/kataoffical/shoprausach/backend
./restore-database.sh
```

Or manually:
```bash
bun run prisma/restore.ts
```

The restore script will:
1. Clean up existing data
2. Restore tables in dependency order
3. Handle foreign key constraints
4. Skip duplicate records
5. Report statistics

---
**Backup Location:** `/mnt/chikiet/kataoffical/shoprausach/backend/backups/rausach/20251124_134126`  
**Backup Size:** 449 MB  
**Compression:** None (JSON format)  
**Generated:** November 24, 2025
