/**
 * Data Migration: Fix BlockType values in PageBlock table
 * 
 * Issue: Frontend previously sent numeric enum values (0, 1, 2, etc.)
 * which were stored as strings ('0', '1', '2', ...) in database
 * 
 * Solution: Convert numeric string values to proper enum names
 * ('0' -> 'TEXT', '1' -> 'IMAGE', etc.)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Numeric to String mapping
const NUMERIC_TO_STRING_MAP: Record<string, string> = {
  '0': 'TEXT',
  '1': 'IMAGE',
  '2': 'VIDEO',
  '3': 'CAROUSEL',
  '4': 'HERO',
  '5': 'BUTTON',
  '6': 'DIVIDER',
  '7': 'SPACER',
  '8': 'TEAM',
  '9': 'STATS',
  '10': 'CONTACT_INFO',
  '11': 'GALLERY',
  '12': 'CARD',
  '13': 'TESTIMONIAL',
  '14': 'FAQ',
  '15': 'CONTACT_FORM',
  '16': 'COMPLETED_TASKS',
  '17': 'CONTAINER',
  '18': 'SECTION',
  '19': 'GRID',
  '20': 'FLEX_ROW',
  '21': 'FLEX_COLUMN',
  '22': 'COLUMN',
  '23': 'ROW',
  '24': 'DYNAMIC',
  '25': 'PRODUCT_LIST',
  '26': 'PRODUCT_DETAIL',
};

async function migrateBlockTypes() {
  console.log('🔄 Starting BlockType migration...');

  try {
    // Get all blocks with numeric string values
    const blocks = await prisma.pageBlock.findMany({
      where: {
        type: {
          in: Object.keys(NUMERIC_TO_STRING_MAP) as any,
        },
      },
    });

    console.log(`📊 Found ${blocks.length} blocks with numeric type values`);

    if (blocks.length === 0) {
      console.log('✅ No blocks need migration');
      return;
    }

    // Update each block
    let successCount = 0;
    let errorCount = 0;

    for (const block of blocks) {
      try {
        const newType = NUMERIC_TO_STRING_MAP[block.type as string];
        
        if (!newType) {
          console.warn(`⚠️  Unknown type value: ${block.type} (block ID: ${block.id})`);
          errorCount++;
          continue;
        }

        await prisma.pageBlock.update({
          where: { id: block.id },
          data: { type: newType as any },
        });

        console.log(`✅ Updated block ${block.id}: ${block.type} -> ${newType}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update block ${block.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration complete:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log(`\n🎉 All blocks migrated successfully!`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBlockTypes();
