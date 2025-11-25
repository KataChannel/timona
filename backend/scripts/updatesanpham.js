/**
 * Update or Create SanPhamHoaDon from DetailHoaDon
 * 
 * This script syncs product information from ext_detailhoadon to ext_sanphamhoadon
 * Creates or updates products based on: ten (name), dvtinh (unit), dgia (price)
 * 
 * Usage:
 *   node backend/scripts/updatesanpham.js
 *   node backend/scripts/updatesanpham.js --dry-run
 *   node backend/scripts/updatesanpham.js --limit=100
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

// Statistics
const stats = {
  totalDetails: 0,
  processed: 0,
  created: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  errorDetails: []
};

/**
 * Generate product code from name
 * @param {string} name - Product name
 * @returns {string} Product code
 */
function generateProductCode(name) {
  if (!name) return null;
  
  // Remove Vietnamese accents and special characters
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim();
  
  // Take first letters of each word (max 10 chars)
  const words = cleaned.split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 10);
  }
  
  const code = words
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 10);
  
  return code || null;
}

/**
 * Create normalized name from raw name
 * Same logic as ProductNormalizationService
 * @param {string} rawName - Raw product name
 * @returns {string} Normalized name
 */
function createNormalizedName(rawName) {
  if (!rawName) return '';
  
  return rawName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces → single space
    .replace(/[^\w\sÀ-ỹ]/g, '') // Remove special chars, keep Vietnamese
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Find canonical name using pg_trgm similarity
 * @param {string} productName - Product name to search
 * @param {number} threshold - Similarity threshold (default 0.6)
 * @returns {Promise<string|null>} Canonical name or null
 */
async function findCanonicalName(productName, threshold = 0.6) {
  try {
    const result = await prisma.$queryRaw`
      SELECT find_canonical_name(${productName}, ${threshold}::real)
    `;
    
    return result[0]?.find_canonical_name || null;
  } catch (error) {
    // If function doesn't exist or error, return null
    return null;
  }
}

/**
 * Normalize product name using fuzzy matching
 * @param {string} productName - Raw product name
 * @returns {Promise<string>} Normalized name (ten2)
 */
async function normalizeProductName(productName) {
  if (!productName || productName.trim() === '') {
    return '';
  }

  // Try to find canonical name from similar products
  const canonical = await findCanonicalName(productName, 0.6);
  if (canonical) {
    return canonical;
  }

  // If not found, create new normalized name
  return createNormalizedName(productName);
}

/**
 * Create or update sanphamhoadon from detailhoadon
 * @param {object} detail - DetailHoaDon record
 * @returns {Promise<object>} Result of operation
 */
async function upsertSanPhamHoaDon(detail) {
  try {
    // Validate required fields
    if (!detail.id) {
      return { 
        success: false, 
        action: 'skipped', 
        reason: 'Missing detail ID' 
      };
    }

    if (!detail.ten || detail.ten.trim() === '') {
      return { 
        success: false, 
        action: 'skipped', 
        reason: 'Missing product name (ten)' 
      };
    }

    // Check if product already exists for this detail
    const existingProduct = await prisma.ext_sanphamhoadon.findFirst({
      where: { iddetailhoadon: detail.id }
    });

    // Auto-normalize product name using fuzzy matching
    const normalizedName = await normalizeProductName(detail.ten);

    const productData = {
      iddetailhoadon: detail.id,
      ten: detail.ten?.trim() || null,
      ten2: normalizedName || null, // Auto-populated with normalized name
      ma: generateProductCode(detail.ten),
      dvt: detail.dvtinh?.trim() || null,
      dgia: detail.dgia || null,
    };

    if (isDryRun) {
      if (existingProduct) {
        return {
          success: true,
          action: 'would-update',
          detailId: detail.id,
          productId: existingProduct.id,
          data: productData
        };
      } else {
        return {
          success: true,
          action: 'would-create',
          detailId: detail.id,
          data: productData
        };
      }
    }

    if (existingProduct) {
      // Update existing product
      const updated = await prisma.ext_sanphamhoadon.update({
        where: { id: existingProduct.id },
        data: productData
      });

      return {
        success: true,
        action: 'updated',
        detailId: detail.id,
        productId: updated.id,
        changes: {
          ten: existingProduct.ten !== updated.ten,
          dvt: existingProduct.dvt !== updated.dvt,
          dgia: existingProduct.dgia?.toString() !== updated.dgia?.toString()
        }
      };
    } else {
      // Create new product
      const created = await prisma.ext_sanphamhoadon.create({
        data: productData
      });

      return {
        success: true,
        action: 'created',
        detailId: detail.id,
        productId: created.id
      };
    }

  } catch (error) {
    console.error(`❌ Error processing detail ${detail.id}:`, error.message);
    return {
      success: false,
      action: 'error',
      detailId: detail.id,
      error: error.message
    };
  }
}

/**
 * Process all details in batches
 */
async function processAllDetails() {
  try {
    console.log('🚀 Starting SanPhamHoaDon sync process...\n');

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    // Count total details
    const totalCount = await prisma.ext_detailhoadon.count();
    stats.totalDetails = totalCount;

    console.log(`📊 Found ${totalCount} detail records`);
    if (limit) {
      console.log(`⚙️  Processing limit: ${limit} records\n`);
    } else {
      console.log('');
    }

    // Fetch details in batches
    const BATCH_SIZE = 100;
    const totalToProcess = limit || totalCount;
    let processed = 0;

    while (processed < totalToProcess) {
      const batchSize = Math.min(BATCH_SIZE, totalToProcess - processed);
      
      const details = await prisma.ext_detailhoadon.findMany({
        take: batchSize,
        skip: processed,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          ten: true,
          dvtinh: true,
          dgia: true
        }
      });

      if (details.length === 0) break;

      // Process each detail
      for (const detail of details) {
        const result = await upsertSanPhamHoaDon(detail);
        
        stats.processed++;
        
        if (result.success) {
          if (result.action === 'created' || result.action === 'would-create') {
            stats.created++;
            console.log(`✅ [${stats.processed}/${totalToProcess}] Created: ${detail.ten?.substring(0, 50)}`);
          } else if (result.action === 'updated' || result.action === 'would-update') {
            stats.updated++;
            const hasChanges = result.changes && Object.values(result.changes).some(changed => changed);
            if (hasChanges) {
              console.log(`🔄 [${stats.processed}/${totalToProcess}] Updated: ${detail.ten?.substring(0, 50)}`);
            } else {
              console.log(`⏭️  [${stats.processed}/${totalToProcess}] No changes: ${detail.ten?.substring(0, 50)}`);
            }
          }
        } else {
          if (result.action === 'skipped') {
            stats.skipped++;
            console.log(`⏩ [${stats.processed}/${totalToProcess}] Skipped: ${result.reason}`);
          } else if (result.action === 'error') {
            stats.errors++;
            stats.errorDetails.push({
              detailId: result.detailId,
              error: result.error
            });
            console.log(`❌ [${stats.processed}/${totalToProcess}] Error: ${result.error}`);
          }
        }
      }

      processed += details.length;

      // Show progress
      if (processed % (BATCH_SIZE * 5) === 0) {
        const percentage = ((processed / totalToProcess) * 100).toFixed(1);
        console.log(`\n📈 Progress: ${processed}/${totalToProcess} (${percentage}%)\n`);
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

/**
 * Print final statistics
 */
function printStatistics() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC STATISTICS');
  console.log('='.repeat(60));
  console.log(`Total details in database: ${stats.totalDetails}`);
  console.log(`Processed:                 ${stats.processed}`);
  console.log(`Created:                   ${stats.created}`);
  console.log(`Updated:                   ${stats.updated}`);
  console.log(`Skipped:                   ${stats.skipped}`);
  console.log(`Errors:                    ${stats.errors}`);
  console.log('='.repeat(60));

  if (stats.errors > 0) {
    console.log('\n⚠️  ERRORS:');
    stats.errorDetails.slice(0, 10).forEach((error, idx) => {
      console.log(`  ${idx + 1}. Detail ID: ${error.detailId} - ${error.error}`);
    });
    if (stats.errorDetails.length > 10) {
      console.log(`  ... and ${stats.errorDetails.length - 10} more errors`);
    }
  }

  if (isDryRun) {
    console.log('\n🔍 DRY RUN COMPLETED - No changes were made');
  } else {
    console.log(`\n✅ SYNC COMPLETED - ${stats.created} created, ${stats.updated} updated`);
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    await processAllDetails();
    printStatistics();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total time: ${duration}s\n`);

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();