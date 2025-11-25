import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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

async function checkTablesWithData() {
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  const lines = schemaContent.split('\n');
  const models: Array<{ name: string; tableName: string }> = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
    
    if (modelMatch) {
      const modelName = modelMatch[1];
      let braceCount = 1;
      let modelBody = '';
      i++;
      
      while (i < lines.length && braceCount > 0) {
        const bodyLine = lines[i];
        modelBody += bodyLine + '\n';
        
        for (const char of bodyLine) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        i++;
      }
      
      const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
      const tableName = mapMatch ? mapMatch[1] : camelToSnakeCase(modelName);
      
      models.push({ name: modelName, tableName });
    } else {
      i++;
    }
  }
  
  console.log(`\n📊 Found ${models.length} models in schema\n`);
  
  const tablesWithData: string[] = [];
  const emptyTables: string[] = [];
  
  for (const model of models) {
    try {
      const count = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count FROM "${model.tableName}"`
      );
      const recordCount = Number(count[0].count);
      
      if (recordCount > 0) {
        tablesWithData.push(model.tableName);
      } else {
        emptyTables.push(model.tableName);
      }
    } catch (error: any) {
      console.log(`❌ ${model.tableName}: ERROR - ${error.message.split('\n')[0]}`);
    }
  }
  
  console.log(`\n📈 Summary:`);
  console.log(`   Tables with data: ${tablesWithData.length}`);
  console.log(`   Empty tables: ${emptyTables.length}`);
  console.log(`   Total models: ${models.length}`);
  
  console.log(`\n✅ Tables with data (${tablesWithData.length}):`);
  tablesWithData.forEach(t => console.log(`   - ${t}`));
  
  await prisma.$disconnect();
}

checkTablesWithData().catch(console.error);
