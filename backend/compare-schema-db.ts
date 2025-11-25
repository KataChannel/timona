import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseSchemaModels(): { modelName: string; tableName: string }[] {
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const modelBlockRegex = /^model\s+(\w+)\s*\{([^}]*)\}/gm;
  const models: { modelName: string; tableName: string }[] = [];
  let match;
  
  while ((match = modelBlockRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    
    const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
    const tableName = mapMatch ? mapMatch[1] : camelToSnakeCase(modelName);
    
    models.push({ modelName, tableName });
  }
  
  return models;
}

function camelToSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

async function main() {
  console.log('\n🔍 Analyzing Rausach Database Structure\n');
  console.log('='.repeat(80));
  
  // Get database tables
  const dbTables: any[] = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const dbTableNames = dbTables.map(t => t.tablename);
  
  // Get schema models
  const schemaModels = parseSchemaModels();
  const schemaTableNames = schemaModels.map(m => m.tableName);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Schema Models: ${schemaModels.length}`);
  console.log(`   Database Tables: ${dbTableNames.length}`);
  
  // Find differences
  const missingInDb = schemaTableNames.filter(t => !dbTableNames.includes(t));
  const extraInDb = dbTableNames.filter(t => !schemaTableNames.includes(t));
  const matching = schemaTableNames.filter(t => dbTableNames.includes(t));
  
  console.log(`   ✅ Matching: ${matching.length}`);
  console.log(`   ⚠️  Missing in DB: ${missingInDb.length}`);
  console.log(`   ⚠️  Extra in DB (not in schema): ${extraInDb.length}`);
  
  if (missingInDb.length > 0) {
    console.log(`\n⚠️  Tables defined in schema but NOT in database:`);
    missingInDb.forEach((t, i) => console.log(`   ${(i+1).toString().padStart(2)}. ${t}`));
  }
  
  if (extraInDb.length > 0) {
    console.log(`\n⚠️  Tables in database but NOT in schema:`);
    extraInDb.forEach((t, i) => console.log(`   ${(i+1).toString().padStart(2)}. ${t}`));
  }
  
  // Count records per table
  console.log(`\n📈 Record counts for key tables:\n`);
  
  const keyTables = [
    'users', 'blog_posts', 'blog_categories', 'products', 'categories',
    'orders', 'order_items', 'carts', 'cart_items', 'courses',
    'lessons', 'enrollments', 'ext_listhoadon', 'ext_detailhoadon',
    'ext_sanphamhoadon', 'audit_logs', 'website_settings', 'menus',
    'pages', 'system_releases', 'system_guides', 'technical_support_tickets'
  ];
  
  for (const table of keyTables) {
    if (dbTableNames.includes(table)) {
      try {
        const count: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        const recordCount = parseInt(count[0].count);
        const status = recordCount > 0 ? '✅' : '⚠️ ';
        console.log(`   ${status} ${table.padEnd(30)} : ${recordCount.toLocaleString().padStart(8)} records`);
      } catch (e) {
        console.log(`   ❌ ${table.padEnd(30)} : Error reading`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Analysis complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
