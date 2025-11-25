import * as path from 'path';
import * as fs from 'fs';

function camelToSnakeCase(str: string): string {
  // If model name already has underscores, keep it as-is (already snake_case)
  if (str.includes('_')) {
    return str.toLowerCase();
  }
  
  // Convert PascalCase/camelCase to snake_case
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

console.log('\n🧪 Testing camelToSnakeCase function:\n');

const testCases = [
  'ext_listhoadon',
  'ext_detailhoadon',
  'ext_sanphamhoadon',
  'User',
  'UserSession',
  'TaskComment',
  'BlogPost',
  'ProductVariant'
];

testCases.forEach(input => {
  const output = camelToSnakeCase(input);
  console.log(`   ${input.padEnd(25)} → ${output}`);
});
