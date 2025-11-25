#!/usr/bin/env bun

/**
 * Comprehensive test for admin access with all roles
 */

// Updated hasAdminAccess function matching frontend code
function hasAdminAccess(user: any): boolean {
  if (!user) return false;
  
  // Check system roleType
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  // Check RBAC roles
  if (user.roles && user.roles.length > 0) {
    const adminRoles = [
      'admin',
      'super_admin',
      'content_manager',
      'content_editor',
      'product_manager',
      'order_manager',
      'user_manager',
      'blog_manager',           // Quản lý Blog
      'blog_editor',            // Biên tập viên Blog
      'ecommerce_manager',      // Quản lý E-commerce
      'page_builder_manager'    // Quản lý Page Builder
    ];
    
    const hasAdminRole = user.roles.some((role: any) => 
      adminRoles.includes(role.name.toLowerCase())
    );
    
    if (hasAdminRole) {
      return true;
    }
  }
  
  return false;
}

// Test cases
const testCases = [
  {
    name: 'User with ADMIN roleType',
    user: {
      id: '1',
      email: 'admin@test.com',
      roleType: 'ADMIN',
      roles: []
    },
    expected: true
  },
  {
    name: 'User with blog_manager role',
    user: {
      id: '2',
      email: 'chikiet88@gmail.com',
      roleType: 'USER',
      roles: [{ name: 'blog_manager', displayName: 'Quản lý Blog' }]
    },
    expected: true
  },
  {
    name: 'User with blog_editor role',
    user: {
      id: '3',
      email: 'editor@test.com',
      roleType: 'USER',
      roles: [{ name: 'blog_editor', displayName: 'Biên tập viên Blog' }]
    },
    expected: true
  },
  {
    name: 'User with ecommerce_manager role',
    user: {
      id: '4',
      email: 'ecommerce@test.com',
      roleType: 'USER',
      roles: [{ name: 'ecommerce_manager', displayName: 'Quản lý E-commerce' }]
    },
    expected: true
  },
  {
    name: 'User with page_builder_manager role',
    user: {
      id: '5',
      email: 'pagebuilder@test.com',
      roleType: 'USER',
      roles: [{ name: 'page_builder_manager', displayName: 'Quản lý Page Builder' }]
    },
    expected: true
  },
  {
    name: 'User with no roles (regular USER)',
    user: {
      id: '6',
      email: 'regular@test.com',
      roleType: 'USER',
      roles: []
    },
    expected: false
  },
  {
    name: 'User with unknown role',
    user: {
      id: '7',
      email: 'unknown@test.com',
      roleType: 'USER',
      roles: [{ name: 'unknown_role', displayName: 'Unknown' }]
    },
    expected: false
  }
];

console.log('🧪 Running Admin Access Tests...\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = hasAdminAccess(test.user);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`\n${status} - ${test.name}`);
  console.log(`  Email: ${test.user.email}`);
  console.log(`  RoleType: ${test.user.roleType}`);
  console.log(`  Roles: ${test.user.roles.map((r: any) => r.name).join(', ') || 'none'}`);
  console.log(`  Expected: ${test.expected ? 'Has Access' : 'No Access'}`);
  console.log(`  Got: ${result ? 'Has Access' : 'No Access'}`);
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('✅ All tests passed!');
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
