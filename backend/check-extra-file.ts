import * as fs from 'fs';
import * as path from 'path';

function camelToSnakeCase(str: string): string {
  if (str.includes('_')) {
    return str.toLowerCase();
  }
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

// Parse schema models
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
const lines = schemaContent.split('\n');
const models: string[] = [];

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
    
    models.push(tableName);
  } else {
    i++;
  }
}

// Get backup files
const backupPath = path.join(__dirname, 'backups/rausach/20251124_150524');
const backupFiles = fs.readdirSync(backupPath)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

console.log(`\n📊 Comparing backup files with schema models:\n`);
console.log(`Schema models: ${models.length}`);
console.log(`Backup files: ${backupFiles.length}\n`);

// Find files not in schema
const extraFiles = backupFiles.filter(f => !models.includes(f));
console.log(`🔍 Extra files in backup (not in schema):`);
if (extraFiles.length === 0) {
  console.log(`   None`);
} else {
  extraFiles.forEach(f => console.log(`   - ${f}`));
}

// Find schema models not backed up
const missingBackups = models.filter(m => !backupFiles.includes(m));
console.log(`\n❌ Schema models not backed up:`);
if (missingBackups.length === 0) {
  console.log(`   None`);
} else {
  missingBackups.slice(0, 10).forEach(m => console.log(`   - ${m}`));
  if (missingBackups.length > 10) {
    console.log(`   ... and ${missingBackups.length - 10} more (likely empty tables)`);
  }
}
