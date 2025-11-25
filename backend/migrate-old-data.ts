/**
 * Migration Script: Import data from old website
 * 
 * This script migrates:
 * - danhmuc.json -> Category model
 * - sanpham.json -> Product model (with variants)
 * 
 * Run: bun run migrate-old-data.ts
 */

import { PrismaClient, ProductUnit, ProductStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Type definitions for old data structure
interface OldCategory {
  id: string;
  idDM: string;
  Title: string;
  Mota: string;
  Slug: string;
  Image: string;
  Type: string;
  Ordering: number;
  Status: number;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string | null;
  idCreate: string | null;
  id_cat: string;
  pid: string;
  Config: string;
  isShowMobile: number;
}

interface OldProduct {
  id: string;
  idDM: string;
  Title: string;
  SKU: string;
  Mota: string;
  Slug: string;
  View: number;
  Image: string;
  Type: string;
  Ordering: number;
  Status: number;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string | null;
  idCreate: string | null;
  Noidung: string;
  Size: string;
  Giachon: string;
  Banchay: number;
  Noibat: number;
  Moi: number;
  ListImage: string;
  MaSP: string;
  Lienhe: string;
  Tags: string;
  Footer: string;
  Bienthe: string; // JSON array of variants
  giagoc: number;
  dvt: string;
  Soluong: number;
  SoluongTT: number;
  Ghichu: string;
}

interface ProductVariantOld {
  MaSP: string;
  gia: number;
  dvt: string;
  GiaCoSo: number;
  khoiluong: number;
}

// Helper function to parse JSON safely
function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    if (!jsonString || jsonString === '{}' || jsonString === '[]') {
      return defaultValue;
    }
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', jsonString);
    return defaultValue;
  }
}

// Helper function to extract image URL from old format
function extractImageUrl(imageJson: string): string | null {
  try {
    const imageData = safeJsonParse<any>(imageJson, {});
    
    // Try different possible paths
    if (imageData.Hinhchinh?.src) {
      return imageData.Hinhchinh.src;
    }
    if (imageData.Main) {
      return imageData.Main;
    }
    if (imageData.src) {
      return imageData.src;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Helper to extract multiple images
function extractImageList(listImageJson: string): string[] {
  try {
    const images = safeJsonParse<any[]>(listImageJson, []);
    return images
      .map(img => img.src || img.url || img.path)
      .filter(url => url);
  } catch {
    return [];
  }
}

// Map old unit to ProductUnit enum
function mapUnit(oldUnit: string): ProductUnit {
  const unitMap: Record<string, ProductUnit> = {
    'Kg': ProductUnit.KG,
    'kg': ProductUnit.KG,
    'KG': ProductUnit.KG,
    'Gam': ProductUnit.G,
    'gam': ProductUnit.G,
    'g': ProductUnit.G,
    'G': ProductUnit.G,
    'Cái': ProductUnit.PIECE,
    'cái': ProductUnit.PIECE,
    'Hộp': ProductUnit.BOX,
    'hộp': ProductUnit.BOX,
    'Túi': ProductUnit.BAG,
    'túi': ProductUnit.BAG,
    'Bó': ProductUnit.BUNDLE,
    'bó': ProductUnit.BUNDLE,
  };
  
  return unitMap[oldUnit] || ProductUnit.PIECE;
}

// Generate slug if missing
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateCategories(categoriesData: OldCategory[]) {
  console.log('\n📁 Starting Category Migration...');
  console.log(`Found ${categoriesData.length} categories`);
  
  // Filter only product categories (Type: "sanpham")
  const productCategories = categoriesData.filter(cat => 
    cat.Type === 'sanpham' && cat.Status === 1
  );
  
  console.log(`Migrating ${productCategories.length} product categories...`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  // First pass: Create all categories without parent
  for (const oldCat of productCategories) {
    try {
      const slug = oldCat.Slug || generateSlug(oldCat.Title);
      
      // Check if already exists
      const existing = await prisma.category.findUnique({
        where: { slug }
      });
      
      if (existing) {
        console.log(`⏭️  Category "${oldCat.Title}" already exists, skipping...`);
        skipped++;
        continue;
      }
      
      const imageUrl = extractImageUrl(oldCat.Image);
      
      await prisma.category.create({
        data: {
          id: oldCat.id, // Preserve original ID for product relations
          name: oldCat.Title,
          slug,
          description: oldCat.Mota || null,
          image: imageUrl,
          displayOrder: oldCat.Ordering || 0,
          isActive: oldCat.Status === 1,
          isFeatured: false,
          createdAt: new Date(oldCat.CreateAt),
          updatedAt: new Date(oldCat.UpdateAt),
        }
      });
      
      created++;
      console.log(`✅ Created category: ${oldCat.Title}`);
    } catch (error) {
      errors++;
      console.error(`❌ Error creating category "${oldCat.Title}":`, error);
    }
  }
  
  console.log(`\n📊 Category Migration Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

async function migrateProducts(productsData: OldProduct[]) {
  console.log('\n📦 Starting Product Migration...');
  console.log(`Found ${productsData.length} products`);
  
  // Filter active products
  const activeProducts = productsData.filter(p => p.Status === 1);
  console.log(`Migrating ${activeProducts.length} active products...`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const oldProduct of activeProducts) {
    try {
      const slug = oldProduct.Slug || generateSlug(oldProduct.Title);
      
      // Check if already exists
      const existing = await prisma.product.findUnique({
        where: { slug }
      });
      
      if (existing) {
        console.log(`⏭️  Product "${oldProduct.Title}" already exists, skipping...`);
        skipped++;
        continue;
      }
      
      // Determine category - use id_cat from product data
      let categoryId = oldProduct.idDM;
      
      // If no category in idDM, try to find from Type or create default
      if (!categoryId) {
        // Try to find category by old id_cat
        const category = await prisma.category.findFirst({
          where: { 
            OR: [
              { id: oldProduct.Type },
              { slug: oldProduct.Type }
            ]
          }
        });
        
        if (category) {
          categoryId = category.id;
        } else {
          // Create or get default category
          const defaultCategory = await prisma.category.upsert({
            where: { slug: 'san-pham-khac' },
            create: {
              name: 'Sản phẩm khác',
              slug: 'san-pham-khac',
              description: 'Danh mục mặc định cho sản phẩm chưa phân loại',
              displayOrder: 999,
              isActive: true,
            },
            update: {}
          });
          categoryId = defaultCategory.id;
        }
      }
      
      // Extract images
      const thumbnail = extractImageUrl(oldProduct.Image);
      const imageList = extractImageList(oldProduct.ListImage);
      
      // Parse variants
      const variants = safeJsonParse<ProductVariantOld[]>(oldProduct.Bienthe, []);
      
      // Calculate pricing
      const price = variants.length > 0 ? variants[0].gia : oldProduct.giagoc || 0;
      const originalPrice = oldProduct.giagoc || price;
      
      // Create product
      const product = await prisma.product.create({
        data: {
          id: oldProduct.id, // Preserve original ID
          name: oldProduct.Title,
          slug,
          description: oldProduct.Noidung || oldProduct.Mota || null,
          shortDesc: oldProduct.Mota || null,
          
          // Pricing
          price: price * 1000, // Convert to VND (from thousand)
          originalPrice: originalPrice * 1000,
          
          // Inventory
          sku: oldProduct.SKU || oldProduct.MaSP || null,
          stock: oldProduct.Soluong || 0,
          stockInWare: oldProduct.SoluongTT || 0,
          
          // Unit
          unit: mapUnit(oldProduct.dvt),
          
          // Category
          categoryId,
          
          // Images
          thumbnail,
          
          // Status
          status: ProductStatus.ACTIVE,
          
          // Display
          isFeatured: oldProduct.Noibat === 1,
          isNewArrival: oldProduct.Moi === 1,
          isBestSeller: oldProduct.Banchay > 0,
          displayOrder: oldProduct.Ordering || 0,
          
          // Product code
          productCode: oldProduct.MaSP || null,
          
          // Stats
          viewCount: oldProduct.View || 0,
          
          // Notes
          notes: oldProduct.Ghichu || null,
          
          // Dates
          createdAt: new Date(oldProduct.CreateAt),
          updatedAt: new Date(oldProduct.UpdateAt),
          publishedAt: new Date(oldProduct.CreateAt),
        }
      });
      
      // Create product images
      if (imageList.length > 0) {
        for (let i = 0; i < imageList.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: imageList[i],
              order: i,
              isPrimary: i === 0,
            }
          });
        }
      }
      
      // Create product variants
      if (variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: `${variant.khoiluong}${variant.dvt}`,
              sku: variant.MaSP,
              price: variant.gia * 1000,
              stock: 0,
              attributes: {
                weight: variant.khoiluong,
                unit: variant.dvt,
                basePrice: variant.GiaCoSo,
              },
              order: i,
              isActive: true,
            }
          });
        }
      }
      
      created++;
      console.log(`✅ Created product: ${oldProduct.Title} (${variants.length} variants)`);
      
    } catch (error) {
      errors++;
      console.error(`❌ Error creating product "${oldProduct.Title}":`, error);
    }
  }
  
  console.log(`\n📊 Product Migration Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

// ============================================================================
// MAIN MIGRATION
// ============================================================================

async function main() {
  console.log('🚀 Starting Data Migration from Old Website...\n');
  console.log('================================================');
  
  const dataDir = path.join(__dirname, 'database-export', '2025-11-05T08-24-56-131Z');
  
  // Check if data files exist
  const categoryFile = path.join(dataDir, 'danhmuc.json');
  const productFile = path.join(dataDir, 'sanpham.json');
  
  if (!fs.existsSync(categoryFile) || !fs.existsSync(productFile)) {
    console.error('❌ Data files not found!');
    console.error(`   Looking in: ${dataDir}`);
    process.exit(1);
  }
  
  // Load data
  console.log('📂 Loading data files...');
  const categoriesData: OldCategory[] = JSON.parse(fs.readFileSync(categoryFile, 'utf-8'));
  const productsData: OldProduct[] = JSON.parse(fs.readFileSync(productFile, 'utf-8'));
  
  console.log(`✅ Loaded ${categoriesData.length} categories`);
  console.log(`✅ Loaded ${productsData.length} products`);
  
  try {
    // Step 1: Migrate Categories
    await migrateCategories(categoriesData);
    
    // Step 2: Migrate Products (with variants)
    await migrateProducts(productsData);
    
    console.log('\n================================================');
    console.log('✅ Migration completed successfully!');
    console.log('================================================\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
