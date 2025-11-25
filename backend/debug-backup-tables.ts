import * as fs from 'fs';
import * as path from 'path';

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

function parseSchemaModels(): { modelName: string; tableName: string }[] {
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const models: { modelName: string; tableName: string }[] = [];
  const lines = schemaContent.split('\n');
  
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
      
      models.push({ modelName, tableName });
    } else {
      i++;
    }
  }
  
  return models;
}

const models = parseSchemaModels();
console.log(`\n📋 Backup script finds ${models.length} models\n`);
console.log('Missing important tables:');
const important = ['Menu', 'Product', 'Order', 'Lesson', 'Course'];
for (const model of important) {
  const found = models.find(m => m.modelName === model);
  if (found) {
    console.log(`   ✅ ${model} → ${found.tableName}`);
  } else {
    console.log(`   ❌ ${model} → NOT FOUND`);
  }
}

console.log('\n📊 All models found:');
models.forEach(m => console.log(`   ${m.modelName} → ${m.tableName}`));
