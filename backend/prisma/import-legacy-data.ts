import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LegacyBaiViet {
  id: string;
  idDM: string;
  Title: string;
  Mota: string;
  Noidung: string;
  Image: string;
  Noibat: number;
  Ordering: number;
  Status: number;
  CreateAt: string;
  UpdateAt: string;
  DeleteAt: string | null;
  Type: string;
  Motangan: string;
  Slug: string;
  MetaTags: string;
  Tags: string;
}

interface LegacySanPham {
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
  Noidung: string;
  Size: string;
  Giachon: string;
  Banchay: number;
  Noibat: number;
  Moi: number;
  ListImage: string;
  MaSP: string;
  Tags: string;
  Bienthe: string;
  giagoc: number;
  dvt: string;
  Soluong: number;
  SoluongTT: number;
  Ghichu: string;
}

interface LegacyDanhMuc {
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
  id_cat?: string;
  pid: string;
  Config: string;
  isShowMobile: number;
}

interface LegacyDanhMucBaiViet {
  id: string;
  pid: string;
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
}

const BACKUP_DIR = './database-export/2025-11-05T08-24-56-131Z';

/**
 * Parse JSON string safely
 */
function parseJsonSafe(str: string, defaultValue: any = {}): any {
  if (!str || str === '{}' || str === '[]') return defaultValue;
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn(`Cannot parse JSON: ${str.substring(0, 100)}...`);
    return defaultValue;
  }
}

/**
 * Extract image URL from legacy format
 */
function extractImageUrl(imageJson: string): string | null {
  const parsed = parseJsonSafe(imageJson);
  if (parsed.Main) {
    // Check if Main is already a full URL
    if (parsed.Main.startsWith('http://') || parsed.Main.startsWith('https://')) {
      const filename = parsed.Main.split('/').pop() || 'image';
      return `https://placehold.co/600x400?text=${encodeURIComponent(filename)}`;
    }
    // Otherwise treat as filename
    return `https://placehold.co/600x400?text=${encodeURIComponent(parsed.Main)}`;
  }
  return null;
}

/**
 * Extract images from legacy format
 */
function extractImages(imageJson: string, listImageJson: string): string[] {
  const images: string[] = [];
  
  // Main image
  const mainImage = extractImageUrl(imageJson);
  if (mainImage) images.push(mainImage);
  
  // Additional images
  const listImages = parseJsonSafe(listImageJson, []);
  if (Array.isArray(listImages)) {
    listImages.forEach((img: any) => {
      if (img.url) {
        const filename = img.url.split('/').pop() || 'image';
        images.push(`https://placehold.co/600x400?text=${encodeURIComponent(filename)}`);
      }
    });
  }
  
  return images;
}

/**
 * Clean HTML content
 */
function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  // Remove excessive meta tags and headers
  let cleaned = html.replace(/<head>[\s\S]*?<\/head>/gi, '');
  cleaned = cleaned.replace(/<html>|<\/html>|<body>|<\/body>/gi, '');
  
  // Replace old image URLs with placeholder
  cleaned = cleaned.replace(/https?:\/\/rausachtrangia\.com\/quanly\/fileman\/Uploads\/[^\s"')]+/g, (match) => {
    const filename = match.split('/').pop() || 'image';
    return `https://placehold.co/600x400?text=${encodeURIComponent(filename)}`;
  });
  
  return cleaned.trim();
}

/**
 * Import blog categories (danh mục bài viết)
 */
async function importDanhMucBaiViet(): Promise<void> {
  console.log('\n📂 Importing Danh Mục Bài Viết (Blog Categories)...\n');
  
  const filePath = path.join(BACKUP_DIR, 'danhmucbaiviet.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File danhmucbaiviet.json not found');
    return;
  }
  
  const data: LegacyDanhMucBaiViet[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📊 Found ${data.length} blog categories to import`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const item of data) {
    try {
      // Skip if no title
      if (!item.Title || item.Title.trim() === '') {
        skipped++;
        continue;
      }
      
      // Check if already exists
      const existing = await prisma.blogCategory.findFirst({
        where: { 
          OR: [
            { slug: item.Slug },
            { name: item.Title }
          ]
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${item.Title}" (already exists)`);
        skipped++;
        continue;
      }
      
      // Extract image if available (using extractImageUrl for consistency)
      let image = extractImageUrl(item.Image);
      
      // Create blog category
      await prisma.blogCategory.create({
        data: {
          name: item.Title,
          slug: item.Slug || item.Title.toLowerCase().replace(/\s+/g, '-'),
          description: item.Mota || '',
          thumbnail: image,
          isActive: item.Status === 1 || item.Status === 0, // Both 0 and 1 seem active in legacy
          order: item.Ordering || 0,
          createdAt: new Date(item.CreateAt),
          updatedAt: new Date(item.UpdateAt),
        }
      });
      
      imported++;
      console.log(`✅ Imported: "${item.Title}"`);
      
    } catch (error: any) {
      errors++;
      console.error(`❌ Error importing "${item.Title}": ${error.message}`);
    }
  }
  
  console.log(`\n📊 Danh Mục Bài Viết Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

/**
 * Import product categories (danh mục sản phẩm)
 */
async function importDanhMucSanPham(): Promise<void> {
  console.log('\n📂 Importing Danh Mục Sản Phẩm (Product Categories)...\n');
  
  const filePath = path.join(BACKUP_DIR, 'danhmuc.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File danhmuc.json not found');
    return;
  }
  
  const data: LegacyDanhMuc[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Filter only product categories (Type === 'sanpham')
  const productCategories = data.filter(item => item.Type === 'sanpham');
  console.log(`📊 Found ${productCategories.length} product categories to import`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const item of productCategories) {
    try {
      // Skip if no title
      if (!item.Title || item.Title.trim() === '') {
        skipped++;
        continue;
      }
      
      // Check if already exists
      const existing = await prisma.category.findFirst({
        where: { 
          OR: [
            { slug: item.Slug },
            { name: item.Title }
          ]
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${item.Title}" (already exists)`);
        skipped++;
        continue;
      }
      
      // Extract image if available (using extractImageUrl for consistency)
      let image = extractImageUrl(item.Image);
      
      // Create product category
      await prisma.category.create({
        data: {
          name: item.Title,
          slug: item.Slug || item.Title.toLowerCase().replace(/\s+/g, '-'),
          description: item.Mota || '',
          image: image,
          isActive: item.Status === 1,
          displayOrder: item.Ordering || 0,
          createdAt: new Date(item.CreateAt),
          updatedAt: new Date(item.UpdateAt),
        }
      });
      
      imported++;
      console.log(`✅ Imported: "${item.Title}"`);
      
    } catch (error: any) {
      errors++;
      console.error(`❌ Error importing "${item.Title}": ${error.message}`);
    }
  }
  
  console.log(`\n📊 Danh Mục Sản Phẩm Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

/**
 * Import blog posts (bài viết)
 */
async function importBaiViet(): Promise<void> {
  console.log('\n📝 Importing Bài Viết (Blog Posts)...\n');
  
  const filePath = path.join(BACKUP_DIR, 'baiviet.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File baiviet.json not found');
    return;
  }
  
  const data: LegacyBaiViet[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📊 Found ${data.length} blog posts to import`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  // Get or create default blog category
  let defaultCategory = await prisma.blogCategory.findFirst({
    where: { slug: 'tin-tuc' }
  });
  
  if (!defaultCategory) {
    defaultCategory = await prisma.blogCategory.create({
      data: {
        name: 'Tin Tức',
        slug: 'tin-tuc',
        description: 'Tin tức và bài viết',
        isActive: true
      }
    });
  }
  
  // Get admin user for author
  const adminUser = await prisma.user.findFirst({
    where: { roleType: 'ADMIN' }
  });
  
  if (!adminUser) {
    console.log('❌ No admin user found. Cannot import blog posts.');
    return;
  }
  
  for (const item of data) {
    try {
      // Check if already exists
      const existing = await prisma.blogPost.findFirst({
        where: { 
          slug: item.Slug
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${item.Title}" (already exists)`);
        skipped++;
        continue;
      }
      
      // Extract type info
      const typeInfo = parseJsonSafe(item.Type);
      const categoryName = typeInfo.Title || 'Tin Tức';
      
      // Find or create category
      let category = await prisma.blogCategory.findFirst({
        where: { name: categoryName }
      });
      
      if (!category) {
        category = await prisma.blogCategory.create({
          data: {
            name: categoryName,
            slug: typeInfo.Slug || categoryName.toLowerCase().replace(/\s+/g, '-'),
            description: `Danh mục ${categoryName}`,
            isActive: true,
            order: 0
          }
        });
      }
      
      // Extract featured image
      const featuredImage = extractImageUrl(item.Image);
      
      // Clean content
      const content = cleanHtmlContent(item.Noidung);
      
      // Create blog post
      await prisma.blogPost.create({
        data: {
          title: item.Title,
          slug: item.Slug,
          excerpt: item.Mota || item.Motangan || '',
          content: content,
          featuredImage: featuredImage,
          status: item.Status === 1 ? 'PUBLISHED' : 'DRAFT',
          isFeatured: item.Noibat === 1,
          viewCount: 0,
          publishedAt: item.Status === 1 ? new Date(item.CreateAt) : null,
          createdAt: new Date(item.CreateAt),
          updatedAt: new Date(item.UpdateAt),
          authorId: adminUser.id,
          categoryId: category.id,
          metaTitle: item.Title,
          metaDescription: item.Motangan || item.Mota || '',
          metaKeywords: item.Motangan ? [item.Motangan] : [],
        }
      });
      
      imported++;
      console.log(`✅ Imported: "${item.Title}"`);
      
    } catch (error: any) {
      errors++;
      console.error(`❌ Error importing "${item.Title}": ${error.message}`);
    }
  }
  
  console.log(`\n📊 Bài Viết Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

/**
 * Import products (sản phẩm)
 */
async function importSanPham(): Promise<void> {
  console.log('\n🛒 Importing Sản Phẩm (Products)...\n');
  
  const filePath = path.join(BACKUP_DIR, 'sanpham.json');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File sanpham.json not found');
    return;
  }
  
  const data: LegacySanPham[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📊 Found ${data.length} products to import`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  // Get or create default category
  let defaultCategory = await prisma.category.findFirst({
    where: { slug: 'san-pham' }
  });
  
  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({
      data: {
        name: 'Sản Phẩm',
        slug: 'san-pham',
        description: 'Sản phẩm rau sạch',
        isActive: true
      }
    });
  }
  
  for (const item of data) {
    try {
      // Skip if no title or invalid data
      if (!item.Title || item.Title.trim() === '') {
        skipped++;
        continue;
      }
      
      // Check if already exists
      const existing = await prisma.product.findFirst({
        where: { 
          OR: [
            { slug: item.Slug },
            { sku: item.MaSP }
          ]
        }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${item.Title}" (already exists)`);
        skipped++;
        continue;
      }
      
      // Extract images
      const images = extractImages(item.Image, item.ListImage);
      const featuredImage = images.length > 0 ? images[0] : null;
      
      // Parse variants (biến thể)
      const variants = parseJsonSafe(item.Bienthe, []);
      const hasVariants = Array.isArray(variants) && variants.length > 0;
      
      // Get price from first variant or giagoc
      let price = item.giagoc || 0;
      let compareAtPrice = null;
      
      if (hasVariants && variants[0]) {
        price = variants[0].gia || variants[0].GiaCoSo || price;
        if (variants[0].GiaCoSo && variants[0].gia > variants[0].GiaCoSo) {
          compareAtPrice = variants[0].gia;
          price = variants[0].GiaCoSo;
        }
      }
      
      // Clean content
      const description = cleanHtmlContent(item.Noidung);
      
      // Map unit to ProductUnit enum
      let productUnit: 'KG' | 'G' | 'BUNDLE' | 'PIECE' | 'BAG' | 'BOX' = 'KG';
      const dvt = item.dvt?.toUpperCase();
      if (dvt === 'KG' || dvt === 'KI-LÔ-GRAM') productUnit = 'KG';
      else if (dvt === 'GRAM' || dvt === 'G') productUnit = 'G';
      else if (dvt === 'BÓ' || dvt === 'BUNDLE') productUnit = 'BUNDLE';
      else if (dvt === 'PIECE' || dvt === 'CÁI' || dvt === 'CHIẾC' || dvt === 'CỦ' || dvt === 'QUẢ') productUnit = 'PIECE';
      else if (dvt === 'BOX' || dvt === 'HỘP') productUnit = 'BOX';
      else if (dvt === 'BAG' || dvt === 'GÓI' || dvt === 'BAO' || dvt === 'TÚI') productUnit = 'BAG';
      else productUnit = 'KG'; // default
      
      // Create product
      const product = await prisma.product.create({
        data: {
          name: item.Title,
          slug: item.Slug || item.Title.toLowerCase().replace(/\s+/g, '-'),
          sku: item.MaSP || undefined,
          description: description,
          shortDesc: item.Mota || '',
          price: price,
          originalPrice: compareAtPrice,
          costPrice: null,
          thumbnail: featuredImage,
          categoryId: defaultCategory.id,
          status: item.Status === 1 ? 'ACTIVE' : 'DRAFT',
          isFeatured: item.Noibat === 1,
          isNewArrival: item.Moi === 1,
          stock: item.Soluong || 0,
          minStock: 5,
          viewCount: item.View || 0,
          soldCount: item.Banchay || 0,
          unit: productUnit,
          metaTitle: item.Title,
          metaDescription: item.Mota || '',
          metaKeywords: item.Tags || '',
          notes: item.Ghichu || '',
        }
      });
      
      // Create images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: images[i],
                alt: item.Title,
                title: item.Title,
                isPrimary: i === 0,
                order: i
              }
            });
          } catch (imageError: any) {
            console.warn(`   ⚠️  Could not create image for "${item.Title}": ${imageError.message}`);
          }
        }
      }
      
      // Create variants if exists
      if (hasVariants && variants.length > 1) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          try {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                sku: variant.MaSP || `${item.MaSP}-${i}`,
                name: `${item.Title} - ${variant.khoiluong}${variant.dvt}`,
                price: variant.gia || variant.GiaCoSo || 0,
                stock: 0,
                isActive: true,
                order: i,
                attributes: {
                  weight: variant.khoiluong,
                  unit: variant.dvt,
                  originalPrice: variant.gia,
                  salePrice: variant.GiaCoSo
                }
              }
            });
          } catch (variantError: any) {
            console.warn(`   ⚠️  Could not create variant for "${item.Title}": ${variantError.message}`);
          }
        }
      }
      
      imported++;
      console.log(`✅ Imported: "${item.Title}" - ${price.toLocaleString()}đ`);
      
    } catch (error: any) {
      errors++;
      console.error(`❌ Error importing "${item.Title}": ${error.message}`);
    }
  }
  
  console.log(`\n📊 Sản Phẩm Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log('🚀 STARTING LEGACY DATA IMPORT');
  console.log(`⏰ Start time: ${new Date().toLocaleString()}`);
  console.log(`📂 Backup directory: ${BACKUP_DIR}\n`);
  
  try {
    // Step 1: Import categories first (required by posts and products)
    await importDanhMucBaiViet();
    await importDanhMucSanPham();
    
    // Step 2: Import blog posts
    await importBaiViet();
    
    // Step 3: Import products
    await importSanPham();
    
    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Critical error:', error);
    process.exit(1);
  }
}

// Run the import
main()
  .catch((err) => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
