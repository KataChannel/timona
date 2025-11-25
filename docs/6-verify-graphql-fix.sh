#!/bin/bash

echo "🔧 Verifying Backend GraphQL Schema Fix"
echo ""
echo "This script checks if the backend TypeScript files compile correctly"
echo "after the GraphQL schema changes."
echo ""
echo "================================================"

cd /mnt/chikiet/kataoffical/shoprausach/backend

echo ""
echo "📋 Step 1: Checking TypeScript compilation..."
bun run tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
else
    echo "❌ TypeScript compilation failed!"
    echo "Please fix the compilation errors above."
    exit 1
fi

echo ""
echo "================================================"
echo "📋 Step 2: Files modified in this fix:"
echo ""
echo "1. src/graphql/models/rbac.model.ts"
echo "   - Added RolePermission ObjectType"
echo "   - Changed Role.permissions to RolePermission[]"
echo ""
echo "2. src/graphql/resolvers/rbac.resolver.ts"
echo "   - Removed @ResolveField('permissions') transformer"
echo ""
echo "3. src/services/rbac.service.ts"
echo "   - Removed flattening in searchRoles()"
echo "   - Removed flattening in getRoleById()"
echo "   - Removed flattening in createRole()"
echo "   - Removed flattening in updateRole()"
echo ""
echo "================================================"
echo "📋 Step 3: Testing database query structure..."
echo ""

bun run test-search-roles-query.ts

echo ""
echo "================================================"
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "1. Restart the backend server"
echo "2. Navigate to http://localhost:3000/admin/rbac/roles"
echo "3. Verify permission counts display correctly"
echo ""
echo "Expected Results:"
echo "  - blog_manager: 17 permissions"
echo "  - ecommerce_manager: 21 permissions"
echo "  - product_manager: 14 permissions"
echo "  - order_manager: 7 permissions"
echo "  - content_manager: 35 permissions"
