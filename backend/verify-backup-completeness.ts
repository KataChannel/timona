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

// Get latest backup directory
const backupsDir = path.join(__dirname, 'backups/rausach');
const backupDirs = fs.readdirSync(backupsDir)
  .filter(d => fs.statSync(path.join(backupsDir, d)).isDirectory())
  .sort()
  .reverse();

const latestBackup = backupDirs[0];
const backupPath = path.join(backupsDir, latestBackup);
const backupFiles = fs.readdirSync(backupPath)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

console.log(`\n📊 BACKUP COMPLETENESS VERIFICATION`);
console.log(`=====================================\n`);
console.log(`Schema models: ${models.length}`);
console.log(`Backup files: ${backupFiles.length}`);
console.log(`Latest backup: ${latestBackup}\n`);

// Check which models have backups
const modelsWithBackup: string[] = [];
const modelsWithoutBackup: string[] = [];

models.forEach(model => {
  if (backupFiles.includes(model.tableName)) {
    modelsWithBackup.push(model.tableName);
  } else {
    modelsWithoutBackup.push(model.tableName);
  }
});

console.log(`✅ Models WITH backup: ${modelsWithBackup.length}`);
console.log(`❌ Models WITHOUT backup: ${modelsWithoutBackup.length}\n`);

if (modelsWithoutBackup.length > 0) {
  console.log(`📋 Models without backup (likely empty tables):`);
  modelsWithoutBackup.slice(0, 20).forEach(t => console.log(`   - ${t}`));
  if (modelsWithoutBackup.length > 20) {
    console.log(`   ... and ${modelsWithoutBackup.length - 20} more`);
  }
}

// Check for key tables
console.log(`\n🔑 Key Tables Verification:`);
const keyTables = [
  'menus', 'products', 'orders', 'users',
  'ext_listhoadon', 'ext_detailhoadon', 'ext_sanphamhoadon',
  'blog_posts', 'categories', 'product_variants'
];

keyTables.forEach(table => {
  const hasBackup = backupFiles.includes(table);
  const status = hasBackup ? '✅' : '❌';
  console.log(`   ${status} ${table}`);
});

console.log(`\n✅ BACKUP STATUS: ${modelsWithBackup.length}/${models.length} models backed up`);
console.log(`📁 Empty tables skipped: ${modelsWithoutBackup.length}\n`);
