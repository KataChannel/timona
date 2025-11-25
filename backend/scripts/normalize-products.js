#!/usr/bin/env node

/**
 * Product Normalization Script
 * 
 * Chuẩn hóa tên sản phẩm trong ext_sanphamhoadon
 * Sử dụng pg_trgm để group các sản phẩm tương tự
 * 
 * Usage:
 *   node normalize-products.js [options]
 * 
 * Options:
 *   --dry-run           Preview changes without updating database
 *   --limit=N           Process only N products
 *   --threshold=0.6     Similarity threshold (0.0-1.0)
 *   --force             Force re-normalize even if ten2 exists
 * 
 * Examples:
 *   node normalize-products.js --dry-run
 *   node normalize-products.js --limit=100 --threshold=0.7
 *   node normalize-products.js --force
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceNormalize = args.includes('--force');

let limit = null;
let threshold = 0.6;

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10);
  }
  if (arg.startsWith('--threshold=')) {
    threshold = parseFloat(arg.split('=')[1]);
  }
}

// Validate threshold
if (threshold < 0 || threshold > 1) {
  console.error('❌ Error: threshold must be between 0.0 and 1.0');
  process.exit(1);
}

// Statistics
const stats = {
  total: 0,
  processed: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  errorDetails: [],
};

/**
 * Create normalized name from raw name
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
 */
async function findCanonicalName(productName, similarityThreshold) {
  try {
    const result = await prisma.$queryRaw`
      SELECT find_canonical_name(${productName}, ${similarityThreshold}::real)
    `;
    
    return result[0]?.find_canonical_name || null;
  } catch (error) {
    console.error('Error finding canonical name:', error.message);
    return null;
  }
}

/**
 * Normalize a single product
 */
async function normalizeProduct(product, similarityThreshold, dryRun) {
  try {
    if (!product.ten) {
      stats.skipped++;
      return { skipped: 'No name' };
    }

    // Check if already normalized (unless force)
    if (product.ten2 && !forceNormalize) {
      stats.skipped++;
      return { skipped: 'Already normalized' };
    }

    // Step 1: Find canonical name from similar products
    let normalizedName = await findCanonicalName(product.ten, similarityThreshold);

    // Step 2: If not found, create new normalized name
    if (!normalizedName) {
      normalizedName = createNormalizedName(product.ten);
    }

    // Step 3: Update if changed
    if (normalizedName !== product.ten2) {
      if (!dryRun) {
        await prisma.ext_sanphamhoadon.update({
          where: { id: product.id },
          data: { ten2: normalizedName },
        });
      }

      stats.updated++;
      return {
        updated: true,
        ten: product.ten,
        ten2_old: product.ten2,
        ten2_new: normalizedName,
      };
    } else {
      stats.skipped++;
      return { skipped: 'No change needed' };
    }
  } catch (error) {
    stats.errors++;
    stats.errorDetails.push({
      id: product.id,
      ten: product.ten,
      error: error.message,
    });
    return { error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🚀 Product Normalization Script');
  console.log('================================\n');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no changes)' : '✍️  LIVE UPDATE'}`);
  console.log(`Threshold: ${threshold}`);
  console.log(`Force: ${forceNormalize ? 'Yes' : 'No'}`);
  if (limit) console.log(`Limit: ${limit} products`);
  console.log('');

  // Step 1: Get products to normalize
  const whereClause = forceNormalize
    ? { ten: { not: null } }
    : {
        ten: { not: null },
        ten2: null,
      };

  const totalCount = await prisma.ext_sanphamhoadon.count({
    where: whereClause,
  });

  stats.total = totalCount;

  console.log(`📊 Found ${totalCount} products to process\n`);

  if (totalCount === 0) {
    console.log('✅ No products need normalization');
    return;
  }

  // Step 2: Fetch products
  const products = await prisma.ext_sanphamhoadon.findMany({
    where: whereClause,
    select: {
      id: true,
      ten: true,
      ten2: true,
      ma: true,
    },
    take: limit || undefined,
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Processing ${products.length} products...\n`);

  // Step 3: Process each product
  const BATCH_SIZE = 50;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    for (const product of batch) {
      stats.processed++;

      const result = await normalizeProduct(product, threshold, isDryRun);

      // Show progress
      if (result.updated) {
        const prefix = isDryRun ? '[DRY]' : '✅';
        console.log(
          `${prefix} [${stats.processed}/${products.length}] "${result.ten}" → "${result.ten2_new}"`,
        );
        if (result.ten2_old) {
          console.log(`      (was: "${result.ten2_old}")`);
        }
      }

      // Show progress every 100 items
      if (stats.processed % 100 === 0) {
        const percentage = ((stats.processed / products.length) * 100).toFixed(1);
        console.log(`\n📊 Progress: ${stats.processed}/${products.length} (${percentage}%)\n`);
      }
    }
  }

  // Step 4: Show statistics
  console.log('\n================================');
  console.log('📊 NORMALIZATION STATISTICS');
  console.log('================================\n');
  console.log(`Total products found: ${stats.total}`);
  console.log(`Processed: ${stats.processed}`);
  console.log(`✅ Updated: ${stats.updated}`);
  console.log(`⏩ Skipped: ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);

  if (stats.errors > 0) {
    console.log('\n❌ Error Details:');
    stats.errorDetails.forEach((err, idx) => {
      console.log(`  ${idx + 1}. Product ${err.id} (${err.ten}): ${err.error}`);
    });
  }

  if (isDryRun) {
    console.log('\n🔍 This was a DRY RUN - no changes were made');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ NORMALIZATION COMPLETED');
  }

  console.log('');
}

// Run script
main()
  .catch((error) => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
