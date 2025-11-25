import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Transform } from 'stream';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Cache for schema-based model mappings
let tableToModelMappingCache: { [tableName: string]: string } | null = null;

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
 * Transform raw data - convert date strings to Date objects and remove unknown fields
 */
function transformRecord(record: any, tableName?: string): any {
  const transformed = { ...record };
  const dateFields = [
    'createdAt', 'updatedAt', 'publishedAt', 'completedAt',
    'dueDate', 'processedAt', 'expiresAt', 'lastLoginAt',
    'lockedUntil', 'startEpoch', 'endEpoch', 'answerEpoch', 'timestamp',
  ];

  // Convert date strings
  for (const field of dateFields) {
    if (transformed[field] && typeof transformed[field] === 'string') {
      transformed[field] = new Date(transformed[field]);
    }
  }

  // Handle website_settings specific transformations
  if (tableName === 'website_settings') {
    // Ensure options is JSON object/array
    if (transformed.options && typeof transformed.options === 'string') {
      try {
        transformed.options = JSON.parse(transformed.options);
      } catch {
        transformed.options = null;
      }
    }
    // Ensure validation is JSON object
    if (transformed.validation && typeof transformed.validation === 'string') {
      try {
        transformed.validation = JSON.parse(transformed.validation);
      } catch {
        transformed.validation = null;
      }
    }
    // Ensure key field is not null (it's unique and required)
    if (!transformed.key) {
      transformed.key = `setting_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
  }

  // Handle audit_logs specific transformations
  if (tableName === 'audit_logs') {
    // Convert 'details' string to JSON object if it's a string
    if (transformed.details && typeof transformed.details === 'string') {
      transformed.details = { message: transformed.details };
    }
    // Ensure sessionInfo is JSON
    if (transformed.sessionInfo && typeof transformed.sessionInfo === 'string') {
      try {
        transformed.sessionInfo = JSON.parse(transformed.sessionInfo);
      } catch {
        transformed.sessionInfo = { raw: transformed.sessionInfo };
      }
    }
    // Ensure clientInfo is JSON
    if (transformed.clientInfo && typeof transformed.clientInfo === 'string') {
      try {
        transformed.clientInfo = JSON.parse(transformed.clientInfo);
      } catch {
        transformed.clientInfo = { raw: transformed.clientInfo };
      }
    }
    // Ensure required fields have defaults
    if (!transformed.resourceType) {
      transformed.resourceType = 'unknown';
    }
    if (!transformed.action) {
      transformed.action = 'unknown';
    }
    // tags is a required array field
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
  }

  // Handle call_center_config specific transformations
  if (tableName === 'call_center_config') {
    // Remove unknown fields
    const unknownFields = ['_id'];
    for (const field of unknownFields) {
      delete transformed[field];
    }
  }

  // Handle menus specific transformations
  if (tableName === 'menus') {
    // requiredPermissions and requiredRoles are required String[] fields
    if (!transformed.requiredPermissions || !Array.isArray(transformed.requiredPermissions)) {
      transformed.requiredPermissions = [];
    }
    if (!transformed.requiredRoles || !Array.isArray(transformed.requiredRoles)) {
      transformed.requiredRoles = [];
    }
  }

  // Handle AI providers transformations
  if (tableName === 'ai_providers') {
    // Ensure tags is an array
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
    // Ensure numeric fields have proper defaults
    if (transformed.totalRequests === null || transformed.totalRequests === undefined) {
      transformed.totalRequests = 0;
    }
    if (transformed.successCount === null || transformed.successCount === undefined) {
      transformed.successCount = 0;
    }
    if (transformed.failureCount === null || transformed.failureCount === undefined) {
      transformed.failureCount = 0;
    }
  }

  // Handle support conversations transformations
  if (tableName === 'support_conversations') {
    // Ensure tags is an array
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
  }

  // Handle support tickets transformations
  if (tableName === 'support_tickets') {
    // Ensure tags is an array
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
  }

  // Handle chat bot rules transformations
  if (tableName === 'chat_bot_rules') {
    // Ensure arrays are properly formatted
    if (!transformed.keywords || !Array.isArray(transformed.keywords)) {
      transformed.keywords = [];
    }
    if (!transformed.platform || !Array.isArray(transformed.platform)) {
      transformed.platform = [];
    }
  }

  // Handle blog posts transformations
  if (tableName === 'blog_posts') {
    // Ensure arrays are properly formatted
    if (!transformed.metaKeywords || !Array.isArray(transformed.metaKeywords)) {
      transformed.metaKeywords = [];
    }
    if (!transformed.images || !Array.isArray(transformed.images)) {
      transformed.images = [];
    }
  }

  // Handle products transformations
  if (tableName === 'products') {
    // Ensure numeric fields
    if (typeof transformed.viewCount !== 'number') {
      transformed.viewCount = 0;
    }
    if (typeof transformed.soldCount !== 'number') {
      transformed.soldCount = 0;
    }
  }

  // Handle product reviews transformations
  if (tableName === 'product_reviews') {
    // Ensure images is an array
    if (!transformed.images || !Array.isArray(transformed.images)) {
      transformed.images = [];
    }
  }

  // Handle orders transformations
  if (tableName === 'orders') {
    // Ensure numeric fields
    if (typeof transformed.subtotal !== 'number') {
      transformed.subtotal = 0;
    }
    if (typeof transformed.total !== 'number') {
      transformed.total = 0;
    }
    if (typeof transformed.shippingFee !== 'number') {
      transformed.shippingFee = 0;
    }
    if (typeof transformed.tax !== 'number') {
      transformed.tax = 0;
    }
    if (typeof transformed.discount !== 'number') {
      transformed.discount = 0;
    }
  }

  // Handle courses transformations
  if (tableName === 'courses') {
    // Ensure arrays are properly formatted
    if (!transformed.whatYouWillLearn || !Array.isArray(transformed.whatYouWillLearn)) {
      transformed.whatYouWillLearn = [];
    }
    if (!transformed.requirements || !Array.isArray(transformed.requirements)) {
      transformed.requirements = [];
    }
    if (!transformed.targetAudience || !Array.isArray(transformed.targetAudience)) {
      transformed.targetAudience = [];
    }
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
  }

  // Handle employee profiles transformations
  if (tableName === 'employee_profiles') {
    // Ensure skills is an array
    if (!transformed.skills || !Array.isArray(transformed.skills)) {
      transformed.skills = [];
    }
  }

  // Handle tasks transformations
  if (tableName === 'tasks') {
    // Ensure arrays for project management fields
    if (!transformed.assignedTo || !Array.isArray(transformed.assignedTo)) {
      transformed.assignedTo = [];
    }
    if (!transformed.mentions || !Array.isArray(transformed.mentions)) {
      transformed.mentions = [];
    }
    if (!transformed.tags || !Array.isArray(transformed.tags)) {
      transformed.tags = [];
    }
  }

  // Handle Hoadon transformations (Invoice)
  if (tableName === 'Hoadon') {
    // Ensure numeric fields have proper types
    if (transformed.tgia !== null && transformed.tgia !== undefined) {
      transformed.tgia = Number(transformed.tgia);
    }
    if (transformed.tgtcthue !== null && transformed.tgtcthue !== undefined) {
      transformed.tgtcthue = Number(transformed.tgtcthue);
    }
    if (transformed.tgtthue !== null && transformed.tgtthue !== undefined) {
      transformed.tgtthue = Number(transformed.tgtthue);
    }
    if (transformed.tgtttbso !== null && transformed.tgtttbso !== undefined) {
      transformed.tgtttbso = Number(transformed.tgtttbso);
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
    // Tables that need special handling with upsert (have UNIQUE constraints other than id)
    const tablesNeedingUpsert = [
      'menus', // UNIQUE slug
    ];

    if (tablesNeedingUpsert.includes(table)) {
      const errors: any[] = [];
      
      for (const record of records) {
        try {
          // Determine the unique field for each table
          let whereClause: any;
          
          if (table === 'menus') {
            whereClause = { slug: record.slug };
          } else {
            whereClause = { id: record.id };
          }

          await model.upsert({
            where: whereClause,
            update: record,
            create: record,
          });
          inserted++;
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          console.log(`   ❌ Failed to upsert record in ${table}: ${errorMsg.substring(0, 100)}`);
          errors.push({ 
            table, 
            record: JSON.stringify(record).substring(0, 100),
            error: errorMsg.substring(0, 100) 
          });
          skipped++;
        }
      }
      
      if (errors.length > 0 && errors.length <= 5) {
        console.log(`   ⚠️  ${errors.length} ${table} records failed:`);
        errors.forEach(e => console.log(`      - ${e.error}`));
      } else if (errors.length > 5) {
        console.log(`   ⚠️  ${errors.length} ${table} records failed (showing first 5):`);
        errors.slice(0, 5).forEach(e => console.log(`      - ${e.error}`));
      }
      
      return { inserted, skipped };
    }

    // For other tables, use createMany with skipDuplicates
    const result = await model.createMany({
      data: records,
      skipDuplicates: true,
    });
    inserted = result.count || records.length;
    return { inserted, skipped: records.length - inserted };
  } catch (batchError: any) {
    // Log the error for debugging
    const errorMsg = (batchError?.message || String(batchError)).toString();
    if (table === 'audit_logs' || table === 'call_center_config') {
      // Write full error to a debug file
      const fs = require('fs');
      fs.appendFileSync('/tmp/restore_error.log', `\n=== ${table} Error ===\n${errorMsg}\n`);
      console.log(`   ⚠️  Error logged to /tmp/restore_error.log`);
    }
    
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
              // For menus table with unique slug
              if (table === 'menus') {
                await model.upsert({
                  where: { slug: record.slug },
                  update: record,
                  create: record,
                });
              } else {
                await model.create({ data: record });
              }
              inserted++;
            } catch (recordError: any) {
              const errorMsg = recordError.message || String(recordError);
              if (skipped === 0) { // Only log first error
                console.log(`   ❌ Error inserting record: ${errorMsg.substring(0, 80)}`);
              }
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
          // For menus table with unique slug
          if (table === 'menus') {
            await model.upsert({
              where: { slug: record.slug },
              update: record,
              create: record,
            });
          } else {
            await model.create({ data: record });
          }
          inserted++;
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          if (skipped === 0) { // Only log first error
            console.log(`   ❌ First insert error:`);
            console.log(`      ${errorMsg.substring(0, 200)}`);
            
            // Check for foreign key violations
            if (errorMsg.includes('foreign key') || errorMsg.includes('violates')) {
              console.log(`      💡 Foreign key constraint - parent records may not exist`);
            }
          }
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
      // E-commerce with FK relationships
      'ext_detailhoadon',
      'ext_sanphamhoadon',
      'product_images',
      'product_variants',
      'cart_items',
      'order_items',
      'order_tracking',
      'order_tracking_events',
      'payments',
      'inventory_logs',
      'product_reviews',
      'review_helpful',
      'wishlist_items',
      
      // Content with FK relationships
      'comments',
      'likes',
      'post_tags',
      'blog_comments',
      'blog_post_tags',
      'blog_post_shares',
      
      // Tasks with FK relationships
      'task_comments',
      'task_media',
      'task_shares',
      'task_activity_logs',
      
      // Project Management
      'project_members',
      'project_chat_messages',
      
      // Affiliate with FK relationships
      'aff_clicks',
      'aff_conversions',
      'aff_payment_requests',
      'aff_campaign_affiliates',
      'aff_links',
      
      // LMS with FK relationships (courses → modules → lessons → progress)
      'course_modules',
      'lessons',
      'enrollments',
      'lesson_progress',
      'quizzes',
      'questions',
      'answers',
      'quiz_attempts',
      'reviews',
      'certificates',
      'discussions',
      'discussion_replies',
      
      // Employee with FK relationships
      'employment_history',
      'employee_documents',
      'onboarding_checklists',
      'offboarding_processes',
      
      // Pages with FK relationships
      'page_blocks',
      'template_shares',
      
      // RBAC with FK relationships
      'role_permissions',
      'user_role_assignments',
      'user_permissions',
      'resource_accesses',
      
      // Auth & Security
      'auth_methods',
      'user_sessions',
      'verification_tokens',
      'user_devices',
      'security_events',
      
      // Support System
      'support_messages',
      'support_attachments',
      'support_tickets',
      
      // File Management
      'files',
      'file_shares',
      
      // Website settings with FK to users
      'website_settings',
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
      const transformedBatch = batch.map(record => transformRecord(record, table));

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
/**
 * Restore with raw SQL for tables without Prisma models
 */
async function restoreWithRawSQL(table: string, records: any[]): Promise<void> {
  try {
    let inserted = 0;
    let skipped = 0;

    // Determine conflict strategy based on table
    const tablesWithUniqueKey: { [key: string]: string } = {
      '_prisma_migrations': 'id',
      'website_settings': 'key',
    };

    const conflictKey = tablesWithUniqueKey[table];

    // Process in batches for better performance
    for (let i = 0; i < records.length; i += Math.min(BATCH_SIZE, 100)) {
      const batch = records.slice(i, i + Math.min(BATCH_SIZE, 100));

      for (const row of batch) {
        try {
          // Transform the record before inserting
          const transformedRow = transformRecord(row, table);
          
          const columnNames = Object.keys(transformedRow);

          let query: string;
          const pgValues: any[] = [];
          
          // Build parameterized values with proper type casting
          const valuePlaceholders = columnNames.map((col, idx) => {
            const val = transformedRow[col];
            pgValues.push(val);
            
            // Apply type casting for PostgreSQL based on table
            if (table === '_prisma_migrations') {
              // _prisma_migrations columns don't need special casting - use defaults
              if (col === 'finished_at' || col === 'started_at' || col === 'rolled_back_at') {
                return `$${idx + 1}::timestamp with time zone`;
              }
            } else if (table === 'website_settings') {
              if (col === 'type') {
                return `$${idx + 1}::"SettingType"`;
              } else if (col === 'category') {
                return `$${idx + 1}::"SettingCategory"`;
              } else if (col === 'validation' || col === 'options') {
                return `$${idx + 1}::jsonb`;
              }
            } else if (table === 'menus') {
              if (col === 'type') {
                return `$${idx + 1}::"MenuType"`;
              } else if (col === 'target') {
                return `$${idx + 1}::"MenuTarget"`;
              } else if (col === 'linkType') {
                return `$${idx + 1}::"MenuLinkType"`;
              } else if (col === 'queryConditions' || col === 'metadata' || col === 'customData') {
                return `$${idx + 1}::jsonb`;
              } else if (col === 'requiredPermissions' || col === 'requiredRoles') {
                return `$${idx + 1}::text[]`;
              }
            }
            
            return `$${idx + 1}`;
          }).join(', ');
          
          const columnsList = columnNames.map(col => `"${col}"`).join(', ');

          if (conflictKey) {
            // Use ON CONFLICT DO UPDATE for tables with unique constraints
            const updateSetClause = columnNames
              .filter(col => col !== conflictKey) // Don't update the unique key
              .map(col => `"${col}" = EXCLUDED."${col}"`)
              .join(', ');
              
            query = `
              INSERT INTO "${table}" (${columnsList}) 
              VALUES (${valuePlaceholders}) 
              ON CONFLICT ("${conflictKey}") 
              DO UPDATE SET ${updateSetClause}
            `;
          } else {
            // Use ON CONFLICT DO NOTHING for tables without known unique constraint
            query = `
              INSERT INTO "${table}" (${columnsList}) 
              VALUES (${valuePlaceholders}) 
              ON CONFLICT DO NOTHING
            `;
          }

          // Convert complex types for PostgreSQL
          const finalValues = pgValues.map((val: any, idx: number) => {
            const col = columnNames[idx];
            
            // Handle null values
            if (val === null || val === undefined) {
              return null;
            }
            
            // Handle Date objects
            if (val instanceof Date) {
              return val;
            }
            
            // Handle array fields for menus table
            if (table === 'menus' && (col === 'requiredPermissions' || col === 'requiredRoles')) {
              // Ensure it's an array
              if (Array.isArray(val)) {
                return val; // PostgreSQL will handle array properly
              }
              // If it's a string representation of an array, parse it
              if (typeof val === 'string') {
                try {
                  const parsed = JSON.parse(val);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              }
              return [];
            }
            
            // Handle JSONB fields for website_settings
            if (table === 'website_settings' && (col === 'options' || col === 'validation')) {
              if (val === null || val === undefined) {
                return null;
              }
              // If it's already an object, stringify it
              if (typeof val === 'object') {
                return JSON.stringify(val);
              }
              // If it's a string, try to parse and re-stringify to ensure valid JSON
              if (typeof val === 'string') {
                try {
                  // Parse and re-stringify to ensure valid JSON format
                  const parsed = JSON.parse(val);
                  return JSON.stringify(parsed);
                } catch {
                  // If parse fails, wrap in quotes or return null
                  return val === '' ? null : JSON.stringify(val);
                }
              }
              return val;
            }
            
            // Handle JSONB/JSON fields for menus and other tables
            if (table === 'menus' && (col === 'queryConditions' || col === 'metadata' || col === 'customData')) {
              if (val === null || val === undefined) {
                return null;
              }
              if (typeof val === 'object') {
                return JSON.stringify(val);
              }
              if (typeof val === 'string') {
                try {
                  const parsed = JSON.parse(val);
                  return JSON.stringify(parsed);
                } catch {
                  return null;
                }
              }
              return null;
            }
            
            // Handle JSON/object fields for other tables
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
              return JSON.stringify(val);
            }
            
            return val;
          });

          await prisma.$queryRawUnsafe(query, ...finalValues);
          inserted++;
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          if (skipped === 0) { // Only log first error for debugging
            console.log(`   ❌ First error in ${table}:`);
            console.log(`      ${errorMsg.substring(0, 200)}`);
            
            // If it's a data type error, suggest checking the schema
            if (errorMsg.includes('42804') || errorMsg.includes('type')) {
              console.log(`      💡 This may be a data type mismatch. Checking schema may help.`);
            }
          }
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

    if (inserted > 0 || skipped > 0) {
      console.log(`✅ Table ${table} (raw SQL): ${inserted} inserted, ${skipped} skipped`);
    }
  } catch (error) {
    const errorMsg = `Raw SQL insert failed for table ${table}: ${error}`;
    console.log(`⚠️  ${errorMsg}`);
    stats.warnings.push(errorMsg);
  }
}

/**
 * Clean up existing data with optimized batch deletes
 * Uses dynamic model mapping from schema
 */
async function cleanupBeforeRestore(): Promise<void> {
  console.log('🧹 Cleaning up existing data...');

  // Initialize cache first
  getTableToModelMapping();

  // Get all tables from schema in reverse topological order (children first)
  const restorationOrder = buildRestorationOrder();
  const cleanupOrder = [...restorationOrder].reverse(); // Reverse for cleanup

  let totalDeleted = 0;

  for (const table of cleanupOrder) {
    try {
      const modelName = toCamelCase(table);
      const model = (prisma as any)[modelName];

      if (model && typeof model.deleteMany === 'function') {
        const result = await model.deleteMany({});
        const deleted = result.count || 0;
        totalDeleted += deleted;
        if (deleted > 0) {
          console.log(`   🗑️  ${table.padEnd(35)}: ${deleted} records deleted`);
        }
      }
    } catch (error) {
      // Silently skip tables that don't exist or have errors
      // console.log(`   ⚠️  ${table}: ${error}`);
    }
  }

  console.log(`✅ Cleanup completed: ${totalDeleted.toLocaleString()} records deleted\n`);
}

/**
 * Create missing lessons that are referenced by quizzes
 * This fixes FK constraint violations during restore
 */
async function createMissingLessons(backupFolder: string): Promise<void> {
  try {
    console.log('🔍 Checking for missing lessons referenced by quizzes and lesson_progress...');
    
    const lessonIdsSet = new Set<string>();
    
    // Read quizzes backup file
    const quizzesFile = path.join(BACKUP_ROOT_DIR, backupFolder, 'quizzes.json');
    if (fs.existsSync(quizzesFile)) {
      const quizzes = JSON.parse(fs.readFileSync(quizzesFile, 'utf8'));
      if (Array.isArray(quizzes)) {
        quizzes.forEach((q: any) => {
          if (q.lessonId) lessonIdsSet.add(q.lessonId);
        });
      }
    }
    
    // Read lesson_progress backup file
    const lessonProgressFile = path.join(BACKUP_ROOT_DIR, backupFolder, 'lesson_progress.json');
    if (fs.existsSync(lessonProgressFile)) {
      const lessonProgress = JSON.parse(fs.readFileSync(lessonProgressFile, 'utf8'));
      if (Array.isArray(lessonProgress)) {
        lessonProgress.forEach((lp: any) => {
          if (lp.lessonId) lessonIdsSet.add(lp.lessonId);
        });
      }
    }

    // Extract unique lesson IDs
    const lessonIds = Array.from(lessonIdsSet);
    if (lessonIds.length === 0) {
      console.log('   ⏭️  No lesson references found - skipping\n');
      return;
    }

    console.log(`   📋 Found ${lessonIds.length} unique lesson IDs in quizzes and lesson_progress`);

    // Check which lessons already exist
    const existingLessons = await prisma.lesson.findMany({
      where: { id: { in: lessonIds as string[] } },
      select: { id: true },
    });

    const existingIds = new Set(existingLessons.map(l => l.id));
    const missingIds = lessonIds.filter(id => !existingIds.has(id as string));

    if (missingIds.length === 0) {
      console.log('   ✅ All lessons already exist\n');
      return;
    }

    console.log(`   🔧 Creating ${missingIds.length} missing lessons...`);

    // Get or create a course module to attach lessons to
    let module = await prisma.courseModule.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!module) {
      // Get or create a course
      let course = await prisma.course.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!course) {
        // Get first admin user
        const admin = await prisma.user.findFirst({ 
          where: { roleType: 'ADMIN' } 
        });
        
        if (!admin) {
          console.log('   ⚠️  No admin user found - cannot create course. Skipping lessons.\n');
          return;
        }

        course = await prisma.course.create({
          data: {
            title: '[Restored] Default Course',
            slug: 'restored-default-course-' + Date.now(),
            description: 'Auto-created course for restored quiz data',
            level: 'BEGINNER',
            status: 'DRAFT',
            instructorId: admin.id,
          },
        });
        console.log(`   ✅ Created course: ${course.id}`);
      }

      module = await prisma.courseModule.create({
        data: {
          title: '[Restored] Default Module',
          description: 'Auto-created module for restored quiz data',
          order: 1,
          courseId: course.id,
        },
      });
      console.log(`   ✅ Created module: ${module.id}`);
    }

    // Create missing lessons
    let created = 0;
    for (const lessonId of missingIds) {
      try {
        await prisma.lesson.create({
          data: {
            id: lessonId as string,
            title: `[Restored] Lesson ${(lessonId as string).substring(0, 8)}`,
            description: 'Auto-created lesson to satisfy FK constraints during restore',
            type: 'TEXT',
            content: 'This lesson was auto-created during data restoration.',
            order: created + 1,
            moduleId: module.id,
            isPreview: false,
            isFree: false,
          },
        });
        created++;
      } catch (error: any) {
        console.log(`   ⚠️  Failed to create lesson ${lessonId}: ${error.message}`);
      }
    }

    console.log(`   ✅ Created ${created}/${missingIds.length} missing lessons\n`);
  } catch (error) {
    console.log(`   ⚠️  Error creating missing lessons: ${error}`);
    console.log('   ⏭️  Continuing with restore...\n');
  }
}

/**
 * Convert camelCase to snake_case
 * Examples: User → user, UserSession → user_session, TaskComment → task_comment
 */
function camelToSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')  // Add underscore before uppercase letters
    .toLowerCase()              // Convert to lowercase
    .replace(/^_/, '');         // Remove leading underscore
}

/**
 * Build table-to-model mapping from schema.prisma
 * Returns { 'users': 'user', 'auth_methods': 'authMethod', ... }
 */
function buildTableToModelMapping(): { [tableName: string]: string } {
  try {
    const schemaPath = path.join(__dirname, 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    const mapping: { [tableName: string]: string } = {};
    
    // Extract model blocks with their bodies
    const modelBlockRegex = /^model\s+(\w+)\s*\{([^}]*?)\}/gm;
    let match;
    
    while ((match = modelBlockRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      // Look for @@map directive in the model body
      const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
      const tableName = mapMatch ? mapMatch[1] : camelToSnakeCase(modelName);
      
      // Store mapping: table_name → modelName (for Prisma model access)
      mapping[tableName] = modelName;
    }
    
    return mapping;
  } catch (error) {
    console.error('❌ Error building table-to-model mapping from schema:', error);
    return {};
  }
}

/**
 * Get or create the cached table-to-model mapping
 */
function getTableToModelMapping(): { [tableName: string]: string } {
  if (!tableToModelMappingCache) {
    tableToModelMappingCache = buildTableToModelMapping();
    
    if (Object.keys(tableToModelMappingCache).length === 0) {
      console.warn('⚠️  Could not parse schema.prisma, restore may fail for some tables');
    } else {
      console.log(`✅ Loaded model mapping for ${Object.keys(tableToModelMappingCache).length} tables from schema.prisma`);
    }
  }
  
  return tableToModelMappingCache;
}

/**
 * Convert table name to Prisma model name (camelCase)
 * Examples: 
 *   users → user
 *   auth_methods → authMethod
 *   ext_listhoadon → ext_listhoadon (returns as-is from mapping if exists)
 */
function toCamelCase(tableName: string): string {
  // Get mapping from schema
  const mapping = getTableToModelMapping();
  
  if (mapping[tableName]) {
    // Found in schema - return the model name from @prisma/client
    // But Prisma's ClientOptions use lowercase first letter for model access
    const modelName = mapping[tableName];
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
  }
  
  // Fallback: use hardcoded mappings for edge cases
  const legacyMappings: { [key: string]: string } = {
    'Hoadon': 'hoadon',
    'HoadonChitiet': 'hoadonChitiet',
    'Page': 'page',
    'PageBlock': 'pageBlock',
    'UserMfaSettings': 'userMfaSettings',
    'UserDevice': 'userDevice',
    'SecurityEvent': 'securityEvent',
    'Role': 'role',
    'Permission': 'permission',
    'RolePermission': 'rolePermission',
    'UserRoleAssignment': 'userRoleAssignment',
    'UserPermission': 'userPermission',
    'ResourceAccess': 'resourceAccess',
  };
  
  if (legacyMappings[tableName]) {
    return legacyMappings[tableName];
  }
  
  // Final fallback: convert table name using snake_case reverse
  // users → user, auth_methods → authMethod
  return convertSnakeCaseToCamelCase(tableName);
}

/**
 * Convert snake_case to camelCase
 * Examples: user → user, auth_methods → authMethod, task_comments → taskComments
 */
function convertSnakeCaseToCamelCase(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Build dependency-aware restoration order from schema
 */
function buildRestorationOrder(): string[] {
  try {
    const schemaPath = path.join(__dirname, 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract all model names
    const modelBlockRegex = /^model\s+(\w+)\s*\{([^}]*?)\}/gm;
    const models: { modelName: string; tableName: string; dependencies: string[] }[] = [];
    let match;
    
    while ((match = modelBlockRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      // Get table name from @@map or convert from model name
      const mapMatch = modelBody.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/);
      const tableName = mapMatch ? mapMatch[1] : camelToSnakeCase(modelName);
      
      // Find all @relation references to determine dependencies
      const relationMatches = modelBody.match(/@relation\([^)]*\)/g) || [];
      const dependencies: string[] = [];
      
      for (const relation of relationMatches) {
        // Extract model references from relations
        const refMatch = relation.match(/(?:to:\s*)?(\w+)(?:\s*,|\s*\))/);
        if (refMatch && refMatch[1] !== modelName) {
          dependencies.push(refMatch[1]);
        }
      }
      
      models.push({ modelName, tableName, dependencies });
    }
    
    // Topological sort - models with no dependencies first, then dependents
    const sorted: string[] = [];
    const visited = new Set<string>();
    
    function visit(modelName: string): void {
      if (visited.has(modelName)) return;
      visited.add(modelName);
      
      const model = models.find(m => m.modelName === modelName);
      if (!model) return;
      
      // Visit dependencies first
      for (const dep of model.dependencies) {
        const depModel = models.find(m => m.modelName === dep);
        if (depModel && !visited.has(dep)) {
          visit(dep);
        }
      }
      
      sorted.push(model.tableName);
    }
    
    // Start with models that have no dependencies
    for (const model of models) {
      if (model.dependencies.length === 0) {
        visit(model.modelName);
      }
    }
    
    // Then visit remaining models
    for (const model of models) {
      visit(model.modelName);
    }
    
    console.log(`✅ Built restoration order for ${sorted.length} models from schema`);
    return sorted;
  } catch (error) {
    console.error('❌ Error building restoration order:', error);
    // Fallback to hardcoded order if schema parsing fails
    return [
      // ===== CORE SYSTEM (Level 1 - No dependencies) =====
      '_prisma_migrations', // System table
      'departments', // Independent department structure
      
      // ===== USERS & AUTH (Level 2 - Depends on departments) =====
      'users', 
      'auth_methods', 
      'user_sessions',
      'verification_tokens',
      'user_mfa_settings',
      'user_devices',
      'security_events',
      
      // ===== RBAC (Level 3 - Depends on users) =====
      'roles',
      'permissions',
      'role_permissions',
      'user_role_assignments',
      'user_permissions',
      'resource_accesses',
      
      // ===== SYSTEM CONFIGURATION (Level 3) =====
      'ai_providers', // AI configuration
      'website_settings', // Website configuration
      'call_center_config', // Call center configuration
      'call_center_sync_logs', // Call center logs
      'chat_integrations', // Chat platform integrations
      'chat_quick_replies', // Quick replies
      'chat_bot_rules', // Bot rules
      
      // ===== AUDIT & LOGS (Level 3) =====
      'audit_logs',
      
      // ===== FILE MANAGEMENT (Level 3) =====
      'file_folders',
      'files',
      'file_shares',
      
      // ===== CONTENT MANAGEMENT (Level 3) =====
      'tags',
      'posts',
      'post_tags',
      'comments',
      'likes',
      
      // ===== BLOG SYSTEM (Level 3) =====
      'blog_categories',
      'blog_tags',
      'blog_posts',
      'blog_post_tags',
      'blog_comments',
      'blog_post_shares',
      
      // ===== MENUS (Level 3) =====
      'menus',
      
      // ===== PAGES & PAGE BUILDER (Level 3) =====
      'pages',
      'page_blocks',
      'custom_templates',
      'template_shares',
      
      // ===== PROJECT MANAGEMENT (Level 3) =====
      'projects',
      'project_members',
      'project_chat_messages',
      
      // ===== TASKS (Level 4 - Depends on projects) =====
      'tasks',
      'task_comments',
      'task_media',
      'task_shares',
      'task_activity_logs',
      'notifications',
      
      // ===== AI & CHATBOT (Level 3) =====
      'chatbot_models',
      'training_data',
      'chat_conversations',
      'chat_messages',
      
      // ===== AFFILIATE SYSTEM (Level 3) =====
      'aff_users',
      'aff_campaigns',
      'aff_campaign_affiliates',
      'aff_links',
      'aff_clicks',
      'aff_conversions',
      'aff_payment_requests',
      
      // ===== HR MANAGEMENT (Level 3) =====
      'employee_profiles',
      'employment_history',
      'employee_documents',
      'onboarding_checklists',
      'offboarding_processes',
      
      // ===== E-COMMERCE - CATEGORIES & PRODUCTS (Level 3) =====
      'categories',
      'products',
      'product_images',
      'product_variants',
      'product_reviews',
      'review_helpful',
      
      // ===== E-COMMERCE - SHOPPING (Level 4) =====
      'carts',
      'cart_items',
      'wishlists',
      'wishlist_items',
      
      // ===== E-COMMERCE - ORDERS (Level 4) =====
      'orders',
      'order_items',
      'order_tracking',
      'order_tracking_events',
      'payments',
      
      // ===== E-COMMERCE - INVENTORY (Level 4) =====
      'inventory_logs',
      
      // ===== INVOICE SYSTEM (Level 3) =====
      'Hoadon', // ext_listhoadon mapped to Hoadon
      'HoadonChitiet', // ext_detailhoadon mapped to HoadonChitiet
      'ext_sanphamhoadon',
      
      // ===== CALL CENTER (Level 3) =====
      'call_center_records',
      
      // ===== LMS SYSTEM (Level 3) =====
      'course_categories',
      
      // ===== LMS - COURSES (Level 4) =====
      'courses',
      'course_modules',
      'lessons',
      
      // ===== LMS - ENROLLMENT (Level 5) =====
      'enrollments',
      'lesson_progress',
      
      // ===== LMS - ASSESSMENTS (Level 5) =====
      'quizzes',
      'questions',
      'answers',
      'quiz_attempts',
      
      // ===== LMS - REVIEWS & COMMUNITY (Level 5) =====
      'reviews',
      'certificates',
      'discussions',
      'discussion_replies',
      
      // ===== SUPPORT SYSTEM (Level 3) =====
      'support_conversations',
      'support_messages',
      'support_attachments',
      'support_tickets',
      'support_analytics',
    ];
  }
}

/**
 * Get list of tables to restore in proper dependency order
 */
async function getTablesToRestore(backupFolder: string): Promise<string[]> {
  try {
    const backupPath = path.join(BACKUP_ROOT_DIR, backupFolder);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup folder not found: ${backupPath}`);
      return [];
    }
    
    // Get all backup files
    const allFiles = fs.readdirSync(backupPath)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    // Get schema-based restoration order
    const restorationOrder = buildRestorationOrder();

    // Sort files according to restoration order
    const sortedFiles = restorationOrder.filter(table => allFiles.includes(table));
    
    // Add any remaining files not in the order list
    const remaining = allFiles.filter(f => !sortedFiles.includes(f));
    const finalOrder = [...sortedFiles, ...remaining.sort()];

    console.log(`📋 Found ${finalOrder.length} backup files`);
    console.log(`📊 Restoration order optimized based on schema dependencies\n`);
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
  console.log(`🚀 STARTING OPTIMIZED ${ENV_NAME.toUpperCase()} DATA RESTORE`);
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
      
      // Before restoring quizzes or lesson_progress, ensure lessons exist
      if (table === 'quizzes' || table === 'lesson_progress') {
        await createMissingLessons(backupFolder);
      }
      
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
