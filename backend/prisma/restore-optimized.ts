import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Transform } from 'stream';
import * as readline from 'readline';

const prisma = new PrismaClient();

const BACKUP_ROOT_DIR = './kata_json';
const BATCH_SIZE = 1000; // Process records in batches of 1000
const STREAM_BUFFER_SIZE = 50; // Keep 50 batches in memory

interface RestoreStats {
  tablesProcessed: number;
  recordsRestored: number;
  recordsSkipped: number;
  errors: string[];
  warnings: string[];
  backupFolder?: string;
  startTime: number;
  tableStats: Map<string, { restored: number; skipped: number; errors: number }>;
}

const stats: RestoreStats = {
  tablesProcessed: 0,
  recordsRestored: 0,
  recordsSkipped: 0,
  errors: [],
  warnings: [],
  startTime: Date.now(),
  tableStats: new Map(),
};

/**
 * Get latest backup folder
 */
function getLatestBackupFolder(): string | null {
  try {
    if (!fs.existsSync(BACKUP_ROOT_DIR)) {
      console.error(`⚠️ Backup directory does not exist: ${BACKUP_ROOT_DIR}`);
      return null;
    }

    const folders = fs.readdirSync(BACKUP_ROOT_DIR)
      .filter(folder => fs.statSync(path.join(BACKUP_ROOT_DIR, folder)).isDirectory())
      .sort()
      .reverse();
    return folders[0] || null;
  } catch (error) {
    console.error(`⚠️ Cannot read backup directory: ${error}`);
    return null;
  }
}

/**
 * Get file size in MB
 */
function getFileSizeInMB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

/**
 * Stream-based JSON parser for large files
 */
async function parseJsonStreaming(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const lines: any[] = [];
    let fileContent = '';

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => {
      fileContent += line;
    });

    rl.on('close', () => {
      try {
        const data = JSON.parse(fileContent);
        resolve(Array.isArray(data) ? data : []);
      } catch (error) {
        reject(error);
      }
    });

    rl.on('error', reject);
  });
}

/**
 * Transform raw data - convert date strings to Date objects
 */
function transformRecord(record: any): any {
  const transformed = { ...record };
  const dateFields = [
    'createdAt', 'updatedAt', 'publishedAt', 'completedAt',
    'dueDate', 'processedAt', 'expiresAt', 'lastLoginAt',
    'lockedUntil', 'startEpoch', 'endEpoch', 'answerEpoch',
  ];

  for (const field of dateFields) {
    if (transformed[field] && typeof transformed[field] === 'string') {
      transformed[field] = new Date(transformed[field]);
    }
  }

  return transformed;
}

/**
 * Batch insert with optimized error handling
 */
async function batchInsert(
  model: any,
  table: string,
  records: any[],
  batchSize: number = BATCH_SIZE,
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  // Try batch insert first with dynamic batch sizing
  try {
    const result = await model.createMany({
      data: records,
      skipDuplicates: true,
    });
    inserted = result.count || records.length;
    return { inserted, skipped: records.length - inserted };
  } catch (batchError: any) {
    // If batch fails and batch size > 100, try smaller batches
    if (batchSize > 100) {
      const smallerBatchSize = Math.max(100, Math.floor(batchSize / 2));
      console.log(`   ⚠️  Batch insert failed, retrying with smaller batches (${smallerBatchSize} records)...`);
      
      for (let i = 0; i < records.length; i += smallerBatchSize) {
        const chunk = records.slice(i, i + smallerBatchSize);
        try {
          const result = await model.createMany({
            data: chunk,
            skipDuplicates: true,
          });
          inserted += result.count || 0;
        } catch (error) {
          // Fall back to individual inserts for this chunk
          for (const record of chunk) {
            try {
              await model.create({ data: record });
              inserted++;
            } catch (recordError) {
              skipped++;
            }
          }
        }
      }
      return { inserted, skipped };
    } else {
      // Already at small batch size, try individual inserts
      console.log(`   ⚠️  Batch insert failed, trying individual records...`);
      
      for (const record of records) {
        try {
          await model.create({ data: record });
          inserted++;
        } catch (error) {
          skipped++;
        }
      }
      return { inserted, skipped };
    }
  }
}

/**
 * Restore table with streaming for large files
 */
async function restoreTableOptimized(
  table: string,
  backupFolder: string,
): Promise<void> {
  try {
    const filePath = path.join(BACKUP_ROOT_DIR, backupFolder, `${table}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Backup file not found for table ${table}`);
      stats.warnings.push(`Backup file does not exist for table ${table}`);
      return;
    }

    const fileSizeMB = getFileSizeInMB(filePath);
    console.log(`📥 Reading ${table} (${fileSizeMB.toFixed(2)} MB)`);

    // Parse JSON data
    let records: any[];
    try {
      records = await parseJsonStreaming(filePath);
    } catch (error) {
      console.log(`⚠️  Cannot parse file ${table}.json: ${error}`);
      stats.warnings.push(`Cannot parse backup file for table ${table}`);
      return;
    }

    if (!Array.isArray(records) || records.length === 0) {
      console.log(`⚠️  No data to restore for table ${table}`);
      return;
    }

    console.log(`   📊 Total records: ${records.length.toLocaleString()}`);

    // Get Prisma model
    const modelName = toCamelCase(table);
    const model = (prisma as any)[modelName];

    if (!model || typeof model.createMany !== 'function') {
      console.log(`   🔧 Using raw SQL for ${table}...`);
      await restoreWithRawSQL(table, records);
      return;
    }

    // Determine batch size based on table characteristics
    // Tables with FK constraints need smaller batches
    const tablesWithFKConstraints = [
      'ext_detailhoadon',
      'ext_sanphamhoadon',
      'comments',
      'likes',
      'task_comments',
      'task_media',
      'task_shares',
      'post_tags',
      'aff_clicks',
      'aff_conversions',
      'aff_payment_requests',
    ];
    
    const effectiveBatchSize = tablesWithFKConstraints.includes(table)
      ? Math.min(BATCH_SIZE, 100) // Use smaller batches for FK-heavy tables
      : BATCH_SIZE;

    // Process in batches with progress reporting
    let totalInserted = 0;
    let totalSkipped = 0;
    const totalBatches = Math.ceil(records.length / effectiveBatchSize);

    for (let i = 0; i < records.length; i += effectiveBatchSize) {
      const batch = records.slice(i, i + effectiveBatchSize);
      const transformedBatch = batch.map(transformRecord);

      const { inserted, skipped } = await batchInsert(
        model,
        table,
        transformedBatch,
        effectiveBatchSize,
      );

      totalInserted += inserted;
      totalSkipped += skipped;

      // Progress report every 10 batches or at the end
      const currentBatch = Math.floor(i / effectiveBatchSize) + 1;
      if (currentBatch % 10 === 0 || currentBatch === totalBatches) {
        const percent = Math.round((currentBatch / totalBatches) * 100);
        console.log(
          `   📈 Progress: ${currentBatch}/${totalBatches} batches (${percent}%) - ${totalInserted.toLocaleString()} inserted`,
        );
      }

      // Allow event loop to process
      await new Promise(resolve => setImmediate(resolve));
    }

    // Store statistics
    stats.recordsRestored += totalInserted;
    stats.recordsSkipped += totalSkipped;
    stats.tablesProcessed++;
    stats.tableStats.set(table, {
      restored: totalInserted,
      skipped: totalSkipped,
      errors: 0,
    });

    const status = totalSkipped > 0 ? `${totalInserted} inserted, ${totalSkipped} skipped` : `${totalInserted} inserted`;
    console.log(`✅ Table ${table}: ${status}`);

  } catch (error) {
    const errorMsg = `Error restoring table ${table}: ${error}`;
    console.error(`❌ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

/**
 * Restore with raw SQL for tables without Prisma models
 */
async function restoreWithRawSQL(table: string, records: any[]): Promise<void> {
  try {
    const columns = Object.keys(records[0])
      .map(col => `"${col}"`)
      .join(', ');

    let inserted = 0;
    let skipped = 0;

    // Process in batches for better performance
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      for (const row of batch) {
        try {
          const values = Object.keys(records[0])
            .map((_, idx) => `$${idx + 1}`)
            .join(', ');

          await prisma.$queryRawUnsafe(
            `INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING`,
            ...Object.values(row),
          );
          inserted++;
        } catch (error) {
          skipped++;
        }
      }
    }

    stats.recordsRestored += inserted;
    stats.recordsSkipped += skipped;
    stats.tableStats.set(table, {
      restored: inserted,
      skipped,
      errors: 0,
    });

    console.log(`✅ Table ${table} (raw SQL): ${inserted} inserted`);
  } catch (error) {
    const errorMsg = `Raw SQL insert failed for table ${table}: ${error}`;
    console.log(`⚠️  ${errorMsg}`);
    stats.warnings.push(errorMsg);
  }
}

/**
 * Clean up existing data with optimized batch deletes
 */
async function cleanupBeforeRestore(): Promise<void> {
  console.log('🧹 Cleaning up existing data...');

  const cleanupOrder = [
    'ext_detailhoadon', 'ext_listhoadon',
    'chat_messages', 'chat_conversations', 'training_data', 'chatbot_models',
    'task_shares', 'task_media', 'task_comments', 'tasks',
    'post_tags', 'likes', 'comments', 'posts', 'notifications', 'tags',
    'RolePermission', 'UserRoleAssignment', 'UserPermission', 'ResourceAccess',
    'Permission', 'Role', 'SecurityEvent', 'UserDevice', 'UserMfaSettings',
    'PageBlock', 'Page',
    'audit_logs', 'user_sessions', 'verification_tokens', 'auth_methods', 'users',
  ];

  let totalDeleted = 0;

  for (const table of cleanupOrder) {
    try {
      const model = (prisma as any)[toCamelCase(table)];
      if (model && typeof model.deleteMany === 'function') {
        const result = await model.deleteMany({});
        const deleted = result.count || 0;
        totalDeleted += deleted;
        if (deleted > 0) {
          console.log(`   🗑️  ${table}: ${deleted} records deleted`);
        }
      }
    } catch (error) {
      // Silently skip tables that don't exist
    }
  }

  console.log(`✅ Cleanup completed: ${totalDeleted.toLocaleString()} records deleted\n`);
}

/**
 * Convert table name to camelCase for Prisma
 */
function toCamelCase(tableName: string): string {
  const mapping: { [key: string]: string } = {
    'users': 'user',
    'auth_methods': 'authMethod',
    'verification_tokens': 'verificationToken',
    'user_sessions': 'userSession',
    'audit_logs': 'auditLog',
    'posts': 'post',
    'comments': 'comment',
    'tags': 'tag',
    'likes': 'like',
    'post_tags': 'postTag',
    'notifications': 'notification',
    'tasks': 'task',
    'task_comments': 'taskComment',
    'task_media': 'taskMedia',
    'task_shares': 'taskShare',
    'chatbot_models': 'chatbotModel',
    'training_data': 'trainingData',
    'chat_conversations': 'chatConversation',
    'chat_messages': 'chatMessage',
    'menus': 'menu',
    'aff_users': 'affUser',
    'aff_campaigns': 'affCampaign',
    'aff_campaign_affiliates': 'affCampaignAffiliate',
    'aff_links': 'affLink',
    'aff_clicks': 'affClick',
    'aff_conversions': 'affConversion',
    'aff_payment_requests': 'affPaymentRequest',
    'employee_profiles': 'employeeProfile',
    'employment_history': 'employmentHistory',
    'employee_documents': 'employeeDocument',
    'onboarding_checklists': 'onboardingChecklist',
    'offboarding_processes': 'offboardingProcess',
    'categories': 'category',
    'products': 'product',
    'product_images': 'productImage',
    'product_variants': 'productVariant',
  };

  return mapping[tableName] || tableName;
}

/**
 * Get list of tables to restore in proper dependency order
 */
async function getTablesToRestore(backupFolder: string): Promise<string[]> {
  try {
    const backupPath = path.join(BACKUP_ROOT_DIR, backupFolder);
    const allFiles = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    // Define restoration order - parent tables first
    const restorationOrder = [
      // Core users
      'users', 'auth_methods', 'user_sessions', 'verification_tokens',
      // Core content
      'posts', 'tags', 'post_tags', 'comments', 'likes', 'notifications',
      // Tasks
      'tasks', 'task_comments', 'task_media', 'task_shares',
      // AI/Chat
      'chatbot_models', 'training_data', 'chat_conversations', 'chat_messages',
      // Affiliate system
      'aff_users', 'aff_campaigns', 'aff_campaign_affiliates', 'aff_links', 'aff_clicks', 'aff_conversions', 'aff_payment_requests',
      // Employee management
      'employee_profiles', 'employment_history', 'employee_documents', 'onboarding_checklists', 'offboarding_processes',
      // E-commerce
      'categories', 'products', 'product_images', 'product_variants',
      // Invoice system (parent first)
      'ext_listhoadon', 'ext_detailhoadon', 'ext_sanphamhoadon',
      // Pages
      'pages', 'page_blocks',
      // Audit & Security
      'audit_logs', 'rbac_roles', 'rbac_permissions', 'rbac_role_permissions',
      // Menus
      'menus',
    ];

    // Sort files according to restoration order
    const sortedFiles = restorationOrder.filter(table => allFiles.includes(table));
    
    // Add any remaining files not in the order list
    const remaining = allFiles.filter(f => !sortedFiles.includes(f));
    const finalOrder = [...sortedFiles, ...remaining.sort()];

    console.log(`📋 Found ${finalOrder.length} backup files`);
    console.log(`📊 Restoration order optimized for dependencies\n`);
    return finalOrder;
  } catch (error) {
    console.error(`❌ Error reading backup folder: ${error}`);
    return [];
  }
}

/**
 * Print final statistics
 */
function printFinalStats(): void {
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESTORE PROCESS COMPLETED');
  console.log('='.repeat(70));
  console.log(`📂 Backup folder: ${stats.backupFolder || 'N/A'}`);
  console.log(`✅ Tables processed: ${stats.tablesProcessed}`);
  console.log(`📝 Total records restored: ${stats.recordsRestored.toLocaleString()}`);
  console.log(`⏭️  Records skipped: ${stats.recordsSkipped.toLocaleString()}`);
  console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
  console.log(`⚠️  Warnings: ${stats.warnings.length}`);
  console.log(`❌ Errors: ${stats.errors.length}`);

  if (stats.tableStats.size > 0) {
    console.log('\n📋 Table Statistics:');
    for (const [table, data] of Array.from(stats.tableStats.entries()).sort()) {
      const total = data.restored + data.skipped;
      const percent = total > 0 ? Math.round((data.restored / total) * 100) : 0;
      console.log(
        `   ${table.padEnd(25)} | Restored: ${data.restored.toString().padStart(6)} | Skipped: ${data.skipped.toString().padStart(6)} | Success: ${percent}%`,
      );
    }
  }

  if (stats.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    stats.warnings.slice(0, 5).forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning.substring(0, 80)}`);
    });
    if (stats.warnings.length > 5) {
      console.log(`   ... and ${stats.warnings.length - 5} more warnings`);
    }
  }

  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.slice(0, 3).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error.substring(0, 80)}`);
    });
    if (stats.errors.length > 3) {
      console.log(`   ... and ${stats.errors.length - 3} more errors`);
    }
  }

  console.log('='.repeat(70));

  // Success indicator
  if (stats.errors.length === 0) {
    console.log('✅ Restore completed successfully!\n');
  } else {
    console.log('⚠️  Restore completed with some errors (see above)\n');
  }
}

/**
 * Main restore function
 */
async function main(): Promise<void> {
  console.log('🚀 STARTING OPTIMIZED rausachcore DATA RESTORE');
  console.log(`⏰ Start time: ${new Date().toLocaleString()}`);
  console.log(`⚙️  Batch size: ${BATCH_SIZE.toLocaleString()} records`);
  console.log(`💾 Backup root: ${BACKUP_ROOT_DIR}\n`);

  try {
    const backupFolder = getLatestBackupFolder();
    if (!backupFolder) {
      throw new Error('No backup folder found');
    }

    stats.backupFolder = backupFolder;
    console.log(`📂 Using backup: ${backupFolder}\n`);

    // Step 1: Cleanup
    await cleanupBeforeRestore();

    // Step 2: Get tables to restore
    const tables = await getTablesToRestore(backupFolder);
    if (tables.length === 0) {
      throw new Error('No backup files found');
    }

    // Step 3: Restore tables
    console.log(`🔄 Restoring ${tables.length} tables...\n`);
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      console.log(`[${i + 1}/${tables.length}] Restoring: ${table}`);
      await restoreTableOptimized(table, backupFolder);
      console.log('');
    }

  } catch (error) {
    console.error(`❌ Unexpected error: ${error}`);
    stats.errors.push(String(error));
  }

  // Print final statistics
  printFinalStats();
}

// Run the restore
main()
  .catch((err) => {
    console.error('❌ Critical error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
