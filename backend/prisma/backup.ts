import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Determine environment from DATABASE_URL
function getEnvironmentName(): string {
  const databaseUrl = process.env.DATABASE_URL || '';
  if (databaseUrl.includes('rausachcore')) {
    return 'rausach';
  } else if (databaseUrl.includes('tazagroupcore')) {
    return 'tazagroup';
  }
  return 'default';
}

const ENV_NAME = getEnvironmentName();
const BACKUP_ROOT_DIR = `./backups/${ENV_NAME}`;

function getFormattedDate(): string {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

const BACKUP_DIR = path.join(BACKUP_ROOT_DIR, getFormattedDate());

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
    return true;
  } catch (error: any) {
    // Check for table not exists error codes
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return false;
    }
    // For other errors (like empty table), assume table exists
    return true;
  }
}

/**
 * Get list of existing tables from database
 */
async function getExistingTables(): Promise<string[]> {
  try {
    const result: any[] = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    return result.map(row => row.tablename);
  } catch (error) {
    console.error('❌ Error getting existing tables:', error);
    return [];
  }
}

/**
 * Check if table is a system/metadata table that should always be backed up
 */
function isSystemTable(tableName: string): boolean {
  const systemTables = [
    'website_settings', // WebsiteSetting model - important config
    '_prisma_migrations', // Prisma migrations tracking
    'call_center_config', // Call center configuration
    'call_center_sync_logs', // Call center sync history
    'chat_integrations', // Chat platform integrations
    'ai_providers', // AI provider configurations
  ];
  return systemTables.includes(tableName);
}

/**
 * Parse schema.prisma file to extract all model names and their table mappings
 * Uses proper brace matching to handle nested structures
 */
function parseSchemaModels(): { modelName: string; tableName: string }[] {
  try {
    const schemaPath = path.join(__dirname, 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const models: { modelName: string; tableName: string }[] = [];
    const lines = schemaContent.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check if line starts a model definition
      const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
      if (modelMatch) {
        const modelName = modelMatch[1];
        let braceCount = 1;
        let modelBody = '';
        i++;
        
        // Read until closing brace, handling nested braces
        while (i < lines.length && braceCount > 0) {
          const bodyLine = lines[i];
          modelBody += bodyLine + '\n';
          
          // Count braces
          for (const char of bodyLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          i++;
        }
        
        // Look for @@map directive in the complete model body
        const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
        const tableName = mapMatch ? mapMatch[1] : camelToSnakeCase(modelName);
        
        models.push({ modelName, tableName });
      } else {
        i++;
      }
    }
    
    console.log(`📋 Found ${models.length} models in schema.prisma`);
    if (models.length > 0) {
      console.log(`   Examples: ${models.slice(0, 5).map(m => `${m.modelName} → ${m.tableName}`).join(', ')}`);
    }
    return models;
  } catch (error) {
    console.error('❌ Error parsing schema.prisma:', error);
    // Fallback to empty array if parsing fails
    return [];
  }
}

/**
 * Convert Prisma model names to database table names
 * Automatically builds mapping from schema.prisma by parsing @@map directives
 * Falls back to snake_case conversion for models without explicit @@map
 * Uses proper brace matching to handle nested structures
 */
function buildModelTableMapping(): { [modelName: string]: string } {
  try {
    const schemaPath = path.join(__dirname, 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const mapping: { [modelName: string]: string } = {};
    const lines = schemaContent.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check if line starts a model definition
      const modelMatch = line.match(/^model\s+(\w+)\s*\{/);
      if (modelMatch) {
        const modelName = modelMatch[1];
        let braceCount = 1;
        let modelBody = '';
        i++;
        
        // Read until closing brace, handling nested braces
        while (i < lines.length && braceCount > 0) {
          const bodyLine = lines[i];
          modelBody += bodyLine + '\n';
          
          // Count braces
          for (const char of bodyLine) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          i++;
        }
        
        // Look for @@map directive in the complete model body
        const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
        
        if (mapMatch) {
          // Use @@map value if present
          mapping[modelName] = mapMatch[1];
        } else {
          // Auto-convert to snake_case if no @@map
          mapping[modelName] = camelToSnakeCase(modelName);
        }
      } else {
        i++;
      }
    }
    
    return mapping;
  } catch (error) {
    console.error('❌ Error building model mapping from schema:', error);
    // Return empty mapping to fall back to direct parsing
    return {};
  }
}

/**
 * Convert camelCase to snake_case
 * Examples: User → user, UserSession → user_session, TaskComment → task_comment
 * IMPORTANT: Keeps existing underscores (e.g., ext_listhoadon stays as-is)
 */
function camelToSnakeCase(str: string): string {
  // If model name already has underscores, keep it as-is (already snake_case)
  if (str.includes('_')) {
    return str.toLowerCase();
  }
  
  // Convert PascalCase/camelCase to snake_case
  return str
    .replace(/([A-Z])/g, '_$1')  // Add underscore before uppercase letters
    .toLowerCase()              // Convert to lowercase
    .replace(/^_/, '');         // Remove leading underscore from PascalCase
}

/**
 * Get or create the model-to-table name mapping (cached for performance)
 */
let modelTableMappingCache: { [modelName: string]: string } | null = null;

function convertModelToTableName(modelName: string): string {
  // Initialize cache on first call
  if (!modelTableMappingCache) {
    modelTableMappingCache = buildModelTableMapping();
    
    if (Object.keys(modelTableMappingCache).length === 0) {
      console.warn('⚠️  Could not parse schema.prisma, using default snake_case conversion');
    } else {
      console.log(`✅ Built mapping for ${Object.keys(modelTableMappingCache).length} models from schema.prisma`);
    }
  }
  
  // Return mapped name or convert to snake_case
  return modelTableMappingCache[modelName] || camelToSnakeCase(modelName);
}

async function getTables(): Promise<string[]> {
  console.log('🔍 Parsing schema.prisma to get all models...');
  const models = parseSchemaModels();
  
  if (models.length === 0) {
    console.log('⚠️  No models found in schema.prisma, querying database for tables...');
    // Query database directly if schema parsing fails
    const existingTables = await getExistingTables();
    console.log(`📋 Found ${existingTables.length} tables in database`);
    return existingTables;
  }
  
  const allTableNames = models.map(model => model.tableName);
  console.log(`✅ Parsed ${allTableNames.length} table names from ${models.length} models`);
  
  // Get existing tables from database
  console.log('🔍 Checking which tables actually exist in database...');
  const existingTables = await getExistingTables();
  console.log(`📋 Found ${existingTables.length} existing tables in database`);
  
  // Filter to only include tables that exist in database
  const validTables = allTableNames.filter(tableName => {
    const exists = existingTables.includes(tableName);
    if (!exists) {
      console.log(`   ⚠️  Table '${tableName}' from schema not found in database`);
    }
    return exists;
  });
  
  // Add system tables that should always be included
  for (const table of existingTables) {
    if (isSystemTable(table) && !validTables.includes(table)) {
      validTables.push(table);
    }
  }
  
  // Sort for consistency
  validTables.sort();
  
  console.log(`✅ Final table list (${validTables.length} tables to backup):`);
  console.log(`   ${validTables.slice(0, 10).join(', ')}${validTables.length > 10 ? ` ... and ${validTables.length - 10} more` : ''}`);
  return validTables;
}

async function backupTableToJson(table: string): Promise<void> {
  try {
    console.log(`🔄 Backing up table: ${table}`);
    
    // Check if table exists first
    const exists = await tableExists(table);
    if (!exists) {
      console.log(`⚠️  Table ${table} does not exist in database, skipping...`);
      return;
    }
    
    const data: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
    
    if (data.length === 0) {
      console.log(`⚠️  Table ${table} is empty, skipping...`);
      return;
    }
    
    const filePath: string = path.join(BACKUP_DIR, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Backup JSON successful: ${filePath} (${data.length} records)`);
  } catch (error: any) {
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      console.log(`⚠️  Table ${table} does not exist in database, skipping...`);
    } else {
      console.error(`❌ Error backing up table ${table}:`, error.message || error);
    }
  }
}

async function backupAllTablesToJson(): Promise<void> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`🏷️  Environment: ${ENV_NAME.toUpperCase()}`);
  console.log(`📂 Creating backup in directory: ${BACKUP_DIR}`);
  console.log(`⏰ Backup started at: ${new Date().toLocaleString()}`);
  
  const tables: string[] = await getTables();
  console.log(`📊 Found ${tables.length} tables to backup`);
  
  let totalRecords = 0;
  let totalFiles = 0;
  const startTime = Date.now();
  
  // Store statistics for each table
  interface TableStats {
    table: string;
    records: number;
    size: number;
    time: number;
  }
  const tableStats: TableStats[] = [];
  
  for (const table of tables) {
    const tableStartTime = Date.now();
    const beforeBackup = fs.existsSync(path.join(BACKUP_DIR, `${table}.json`));
    
    await backupTableToJson(table);
    
    // Check if file was created (means table had data)
    const filePath = path.join(BACKUP_DIR, `${table}.json`);
    const fileCreated = fs.existsSync(filePath);
    
    // Count records for statistics
    try {
      if (fileCreated) {
        const recordCount: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = parseInt(recordCount[0].count);
        totalRecords += count;
        totalFiles++;
        
        const tableTime = Date.now() - tableStartTime;
        const fileSize = fs.statSync(filePath).size;
        
        tableStats.push({
          table,
          records: count,
          size: fileSize,
          time: tableTime
        });
        
        if (count > 0) {
          console.log(`   📈 ${count.toLocaleString()} records in ${tableTime}ms`);
        }
      }
    } catch (e) {
      console.log(`   ⚠️  Could not count records for ${table}`);
    }
  }
  
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const totalSize = tableStats.reduce((sum, stat) => sum + stat.size, 0);
  
  // Print summary
  console.log(`\n🎉 Backup completed successfully!`);
  console.log(`📊 Total records: ${totalRecords.toLocaleString()}`);
  console.log(`⏱️  Total time: ${totalTime} seconds`);
  console.log(`📁 Backup location: ${BACKUP_DIR}`);
  
  // Print detailed statistics table
  console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║                      📊 BACKUP STATISTICS REPORT                           ║`);
  console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);
  
  console.log(`📈 Overview:`);
  console.log(`   Total Files: ${totalFiles}`);
  console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
  console.log(`   Total Size: ${formatBytes(totalSize)}`);
  console.log(`   Duration: ${totalTime} seconds`);
  console.log(`   Average Speed: ${Math.round(totalRecords / totalTime).toLocaleString()} records/sec\n`);
  
  // Sort by record count (descending) and show top 15 tables
  const topTables = tableStats.sort((a, b) => b.records - a.records).slice(0, 15);
  
  console.log(`🏆 Top 15 Tables by Record Count:\n`);
  console.log(`${'No.'.padEnd(4)} ${'Table Name'.padEnd(30)} ${'Records'.padStart(12)} ${'Size'.padStart(10)} ${'Time'.padStart(8)}`);
  console.log(`${'─'.repeat(4)} ${'─'.repeat(30)} ${'─'.repeat(12)} ${'─'.repeat(10)} ${'─'.repeat(8)}`);
  
  topTables.forEach((stat, index) => {
    const num = `${index + 1}.`.padEnd(4);
    const table = stat.table.padEnd(30);
    const records = stat.records.toLocaleString().padStart(12);
    const size = formatBytes(stat.size).padStart(10);
    const time = `${stat.time}ms`.padStart(8);
    console.log(`${num} ${table} ${records} ${size} ${time}`);
  });
  
  // Show tables by size
  const topBySize = [...tableStats].sort((a, b) => b.size - a.size).slice(0, 10);
  console.log(`\n💾 Top 10 Tables by File Size:\n`);
  console.log(`${'No.'.padEnd(4)} ${'Table Name'.padEnd(30)} ${'Size'.padStart(10)} ${'Records'.padStart(12)}`);
  console.log(`${'─'.repeat(4)} ${'─'.repeat(30)} ${'─'.repeat(10)} ${'─'.repeat(12)}`);
  
  topBySize.forEach((stat, index) => {
    const num = `${index + 1}.`.padEnd(4);
    const table = stat.table.padEnd(30);
    const size = formatBytes(stat.size).padStart(10);
    const records = stat.records.toLocaleString().padStart(12);
    console.log(`${num} ${table} ${size} ${records}`);
  });
  
  console.log(`\n${'═'.repeat(80)}\n`);
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function restoreTableFromJson(table: string): Promise<void> {
  try {
    const latestBackupDir = fs.readdirSync(BACKUP_ROOT_DIR).sort().reverse()[0];
    if (!latestBackupDir) {
      console.error(`❌ No backup directory found.`);
      return;
    }
    
    const filePath: string = path.join(BACKUP_ROOT_DIR, latestBackupDir, `${table}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Backup file not found for table ${table}`);
      return;
    }

    console.log(`📥 Restoring table: ${table}`);
    const data: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.length === 0) {
      console.log(`⚠️  No data to restore for table ${table}`);
      return;
    }
    
    // Use batch insert with ON CONFLICT handling
    const columns = Object.keys(data[0]).map(col => `"${col}"`).join(', ');
    const placeholders = Object.keys(data[0]).map((_, i) => `$${i + 1}`).join(', ');
    
    let successCount = 0;
    for (const row of data) {
      try {
        await prisma.$queryRawUnsafe(
          `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          ...Object.values(row)
        );
        successCount++;
      } catch (error) {
        console.log(`⚠️  Skipped duplicate/invalid record in ${table}`);
      }
    }
    
    console.log(`✅ Successfully restored ${successCount}/${data.length} records to table ${table}`);
  } catch (error) {
    console.error(`❌ Error restoring table ${table}:`, error);
  }
}

async function restoreAllTablesFromJson(): Promise<void> {
  console.log(`🔄 Starting restore process...`);
  
  const tables: string[] = await getTables();
  console.log(`📊 Found ${tables.length} tables to restore`);
  
  const startTime = Date.now();
  let totalRestored = 0;
  
  for (const table of tables) {
    const tableStartTime = Date.now();
    await restoreTableFromJson(table);
    
    const tableTime = Date.now() - tableStartTime;
    console.log(`   ⏱️  ${table}: ${tableTime}ms`);
  }
  
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n🎉 Restore completed in ${totalTime} seconds!`);
}

backupAllTablesToJson()
  .then(() => console.log(`🎉 ${ENV_NAME.toUpperCase()} backup completed successfully!`))
  .catch((err) => console.error('❌ Backup error:', err))
  .finally(() => prisma.$disconnect());

// To restore data, uncomment and run restoreAllTablesFromJson()
// restoreAllTablesFromJson()
//   .then(() => console.log(`🎉 ${ENV_NAME.toUpperCase()} restore completed successfully!`))
//   .catch((err) => console.error('❌ Restore error:', err))
//   .finally(() => prisma.$disconnect());
