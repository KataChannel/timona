#!/usr/bin/env node

/**
 * Update ten2 (Normalized Product Names) Script
 * 
 * Uses Product Fuzzy Matching System with pg_trgm to normalize product names
 * Updates the ten2 field in ext_sanphamhoadon table
 * 
 * Features:
 * - Fuzzy matching using PostgreSQL pg_trgm
 * - Auto-find canonical names from similar products
 * - DVT (unit) matching support
 * - Price tolerance matching support
 * - Batch processing for performance
 * - Progress tracking
 * - Dry-run mode for preview
 * 
 * Usage:
 *   node updateten2.js                       # Update all products (name only)
 *   node updateten2.js --dry-run             # Preview changes
 *   node updateten2.js --limit=100           # Update first 100
 *   node updateten2.js --threshold=0.7       # Use stricter matching
 *   node updateten2.js --force               # Re-normalize all (even with ten2)
 *   node updateten2.js --match-dvt           # Enable DVT matching
 *   node updateten2.js --price-tolerance=15  # Enable price matching (15% tolerance)
 * 
 * Advanced Examples:
 *   # Match by name + DVT
 *   node updateten2.js --match-dvt --dry-run --limit=10
 *   
 *   # Match by name + DVT + price (10% tolerance)
 *   node updateten2.js --match-dvt --price-tolerance=10
 *   
 *   # Strict matching with all criteria
 *   node updateten2.js --threshold=0.7 --match-dvt --price-tolerance=5
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// ============================================
// Command Line Arguments
// ============================================

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceUpdate = args.includes('--force');
const matchDvt = args.includes('--match-dvt');

let limit = null;
let threshold = 0.6; // Default threshold (balanced)
let priceTolerance = null; // null = disabled, number = % tolerance

for (const arg of args) {
  if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10);
  }
  if (arg.startsWith('--threshold=')) {
    threshold = parseFloat(arg.split('=')[1]);
  }
  if (arg.startsWith('--price-tolerance=')) {
    priceTolerance = parseFloat(arg.split('=')[1]);
  }
}

// Validate threshold
if (threshold < 0 || threshold > 1) {
  console.error('❌ Error: threshold must be between 0.0 and 1.0');
  process.exit(1);
}

// Validate price tolerance
if (priceTolerance !== null && (priceTolerance < 0 || priceTolerance > 100)) {
  console.error('❌ Error: price-tolerance must be between 0 and 100 (percentage)');
  process.exit(1);
}

// ============================================
// Statistics
// ============================================

const stats = {
  total: 0,
  processed: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  reused: 0, // Reused canonical names
  created: 0, // Created new normalized names
  errorDetails: [],
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create normalized name from raw name
 * Same logic as ProductNormalizationService
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
 * Returns most common ten2 among similar products
 */
async function findCanonicalName(productName, similarityThreshold) {
  try {
    const result = await prisma.$queryRaw`
      SELECT find_canonical_name(${productName}, ${similarityThreshold}::real)
    `;

    return result[0]?.find_canonical_name || null;
  } catch (error) {
    // If function doesn't exist or error, return null
    console.error(`⚠️  Warning: find_canonical_name() error:`, error.message);
    return null;
  }
}

/**
 * Find canonical name with advanced matching (DVT + Price)
 */
async function findCanonicalNameAdvanced(
  productName, 
  productDvt, 
  productPrice, 
  priceTol, 
  similarityThreshold
) {
  try {
    // Parse price to proper number
    const priceNum = productPrice ? parseFloat(productPrice) : null;
    const dvtParam = productDvt || null;
    const priceToleranceParam = priceTol !== null ? priceTol : 10;

    // Call function with proper parameter handling
    const result = await prisma.$queryRawUnsafe(`
      SELECT canonical_name FROM find_canonical_name_advanced(
        $1::text,
        $2::text,
        $3::decimal,
        $4::decimal,
        $5::real
      )
    `, productName, dvtParam, priceNum, priceToleranceParam, similarityThreshold);

    return result[0]?.canonical_name || null;
  } catch (error) {
    // If function doesn't exist or error, fallback to basic
    console.error(`⚠️  Warning: find_canonical_name_advanced() error:`, error.message);
    return null;
  }
}

/**
 * Normalize product name using fuzzy matching
 * 
 * Logic:
 * 1. Try to find canonical name from similar products (reuse)
 * 2. If not found, create new normalized name
 */
async function normalizeProductName(
  productName, 
  productDvt, 
  productPrice, 
  similarityThreshold
) {
  if (!productName || productName.trim() === '') {
    return '';
  }

  // Use advanced matching if DVT or price tolerance enabled
  if (matchDvt || priceTolerance !== null) {
    const canonical = await findCanonicalNameAdvanced(
      productName,
      productDvt,
      productPrice,
      priceTolerance,
      similarityThreshold
    );
    
    if (canonical) {
      stats.reused++;
      return canonical;
    }
  } else {
    // Use basic matching (name only)
    const canonical = await findCanonicalName(productName, similarityThreshold);
    if (canonical) {
      stats.reused++;
      return canonical;
    }
  }

  // Step 2: Create new normalized name
  stats.created++;
  return createNormalizedName(productName);
}

/**
 * Update ten2 for a single product
 */
async function updateProductTen2(product, similarityThreshold, dryRun) {
  try {
    if (!product.ten) {
      stats.skipped++;
      return { skipped: 'No name (ten)' };
    }

    // Check if already normalized (unless force mode)
    if (product.ten2 && !forceUpdate) {
      stats.skipped++;
      return { skipped: 'Already has ten2' };
    }

    // Normalize the product name (with DVT and price if enabled)
    const normalizedName = await normalizeProductName(
      product.ten,
      product.dvt,
      product.dgia,
      similarityThreshold
    );

    // Check if it changed
    if (normalizedName === product.ten2) {
      stats.skipped++;
      return { skipped: 'No change needed' };
    }

    // Update if not dry-run
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
      dvt: product.dvt,
      dgia: product.dgia,
      ten2_old: product.ten2,
      ten2_new: normalizedName,
      reused: stats.reused > 0,
    };
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

// ============================================
// Main Function
// ============================================

async function main() {
  console.log('\n🚀 Update ten2 (Product Normalization) Script');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (preview only)' : '✍️  LIVE UPDATE'}`);
  console.log(`Threshold: ${threshold} (similarity matching)`);
  console.log(`Force: ${forceUpdate ? 'Yes (re-normalize all)' : 'No (skip if ten2 exists)'}`);
  console.log(`DVT Matching: ${matchDvt ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Price Matching: ${priceTolerance !== null ? `✅ Enabled (±${priceTolerance}%)` : '❌ Disabled'}`);
  if (limit) console.log(`Limit: ${limit} products`);
  console.log('');

  // ============================================
  // Step 1: Count products to process
  // ============================================

  const whereClause = forceUpdate
    ? { ten: { not: null } } // All products with name
    : {
        ten: { not: null },
        ten2: null, // Only products without ten2
      };

  const totalCount = await prisma.ext_sanphamhoadon.count({
    where: whereClause,
  });

  stats.total = totalCount;

  console.log(`📊 Found ${totalCount} products to process\n`);

  if (totalCount === 0) {
    console.log('✅ No products need normalization');
    console.log('   Tip: Use --force to re-normalize all products\n');
    return;
  }

  // ============================================
  // Step 2: Fetch products
  // ============================================

  const products = await prisma.ext_sanphamhoadon.findMany({
    where: whereClause,
    select: {
      id: true,
      ten: true,
      ten2: true,
      ma: true,
      dvt: true,
      dgia: true,
    },
    take: limit || undefined,
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Processing ${products.length} products...\n`);

  // ============================================
  // Step 3: Process in batches
  // ============================================

  const BATCH_SIZE = 50;
  const startTime = Date.now();

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    for (const product of batch) {
      stats.processed++;

      const result = await updateProductTen2(product, threshold, isDryRun);

      // Show updates (not skips)
      if (result.updated) {
        const prefix = isDryRun ? '[DRY]' : '✅';
        const reuseFlag = result.reused ? '♻️' : '🆕';
        
        let displayText = `${prefix} ${reuseFlag} [${stats.processed}/${products.length}] "${result.ten}" → "${result.ten2_new}"`;
        
        // Show DVT and price if enabled
        if (matchDvt && result.dvt) {
          displayText += ` [${result.dvt}]`;
        }
        if (priceTolerance !== null && result.dgia) {
          const price = parseFloat(result.dgia);
          if (!isNaN(price)) {
            displayText += ` [$${price.toLocaleString()}]`;
          }
        }
        
        console.log(displayText);
        
        if (result.ten2_old) {
          console.log(`      (was: "${result.ten2_old}")`);
        }
      }

      // Show errors
      if (result.error) {
        console.log(
          `❌ [${stats.processed}/${products.length}] Error: ${result.error}`
        );
      }

      // Progress update every 100 items
      if (stats.processed % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (stats.processed / (Date.now() - startTime) * 1000).toFixed(1);
        const percentage = ((stats.processed / products.length) * 100).toFixed(1);
        
        console.log(`\n📊 Progress: ${stats.processed}/${products.length} (${percentage}%) | ${elapsed}s | ${rate}/s`);
        console.log(`   ✅ Updated: ${stats.updated} | ♻️  Reused: ${stats.reused} | 🆕 Created: ${stats.created}\n`);
      }
    }
  }

  // ============================================
  // Step 4: Final Statistics
  // ============================================

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgRate = (stats.processed / (Date.now() - startTime) * 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL STATISTICS');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Total products found: ${stats.total}`);
  console.log(`Processed: ${stats.processed}`);
  console.log(`✅ Updated: ${stats.updated}`);
  console.log(`   ♻️  Reused canonical names: ${stats.reused}`);
  console.log(`   🆕 Created new names: ${stats.created}`);
  console.log(`⏩ Skipped: ${stats.skipped}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('');
  console.log(`⏱️  Time: ${totalTime}s | Rate: ${avgRate}/s`);

  // Show error details
  if (stats.errors > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ ERROR DETAILS');
    console.log('='.repeat(70));
    stats.errorDetails.forEach((err, idx) => {
      console.log(`\n${idx + 1}. Product ${err.id}`);
      console.log(`   Name: ${err.ten}`);
      console.log(`   Error: ${err.error}`);
    });
  }

  // Show recommendations
  console.log('\n' + '='.repeat(70));
  if (isDryRun) {
    console.log('🔍 DRY RUN COMPLETED - No changes were made');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the normalized names above');
    console.log('  2. Adjust --threshold if needed (current: ' + threshold + ')');
    console.log('  3. Run without --dry-run to apply changes');
    console.log('');
    console.log('Example:');
    console.log(`  node updateten2.js --threshold=${threshold}`);
  } else {
    console.log('✅ UPDATE COMPLETED');
    console.log('');
    console.log('Verify results:');
    console.log('  SELECT ten2, COUNT(*) FROM ext_sanphamhoadon');
    console.log('  WHERE ten2 IS NOT NULL');
    console.log('  GROUP BY ten2 ORDER BY COUNT(*) DESC LIMIT 20;');
  }
  console.log('='.repeat(70));
  console.log('');
}

// ============================================
// Run Script
// ============================================

main()
  .catch((error) => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
