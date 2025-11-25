/**
 * Script để generate tất cả model mappings từ schema.prisma
 * Chạy: bun generate-model-mappings.ts > model-mappings.json
 */

import * as fs from 'fs';
import * as path from 'path';

function parseSchemaModels() {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const models: { modelName: string; tableName: string }[] = [];

  // Extract model blocks
  const modelBlockRegex = /^model\s+(\w+)\s*\{([^}]*)\}/gm;
  let match;

  while ((match = modelBlockRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    // Look for @@map directive
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

function generateTableToModelMapping(models: any[]) {
  const mapping: { [tableName: string]: string } = {};

  for (const model of models) {
    // Prisma model names use lowercase first letter for access
    const modelAccessName = model.modelName.charAt(0).toLowerCase() + model.modelName.slice(1);
    mapping[model.tableName] = modelAccessName;
  }

  return mapping;
}

function main() {
  console.log('📋 Parsing schema.prisma...\n');

  const models = parseSchemaModels();
  const mapping = generateTableToModelMapping(models);

  console.log(`✅ Found ${models.length} models\n`);

  console.log('📊 Model to Table Mapping:');
  console.log('─'.repeat(60));

  for (const model of models.sort((a, b) => a.tableName.localeCompare(b.tableName))) {
    console.log(`  ${model.tableName.padEnd(35)} → ${model.modelName}`);
  }

  console.log('\n📄 JSON Output:\n');
  console.log(JSON.stringify(mapping, null, 2));

  console.log('\n✅ Total:', models.length, 'models');
}

main();
