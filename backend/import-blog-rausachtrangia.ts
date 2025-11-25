import { PrismaClient, PostStatus, PostVisibility } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Đường dẫn tới thư mục data
const DATA_DIR = path.join(__dirname, 'database-export/2025-11-05T08-24-56-131Z');

interface OldCategory {
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

interface OldPost {
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
  idCreate: string | null;
  Type: string;
  Motangan: string;
  Slug: string;
  Lienhe: string;
  MetaTags: string;
  Tags: string;
  Footer: string;
  Danhmuc: string;
}

// Helper: Clean HTML content
function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  // Remove excessive whitespace
  let cleaned = html.replace(/\s+/g, ' ').trim();
  
  // Remove meta tags and scripts in head
  cleaned = cleaned.replace(/<head>[\s\S]*?<\/head>/gi, '');
  
  // Remove inline scripts
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Keep the content as is for now (can process further if needed)
  return cleaned;
}

// Helper: Parse image JSON
function parseImage(imageJson: string): string | null {
  try {
    const parsed = JSON.parse(imageJson);
    if (parsed.Main) {
      // Return full URL or path
      return `http://rausachtrangia.com/quanly/fileman/Uploads/Images/${parsed.Main}`;
    }
    if (parsed.Hinhchinh && parsed.Hinhchinh.src) {
      return parsed.Hinhchinh.src;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper: Extract keywords from meta tags
function extractKeywords(metaTagsJson: string, motangan: string): string[] {
  const keywords: string[] = [];
  
  try {
    const meta = JSON.parse(metaTagsJson);
    if (meta.keywords) {
      keywords.push(...meta.keywords.split(',').map((k: string) => k.trim()).filter(Boolean));
    }
  } catch {}
  
  // Add from motangan (short tags)
  if (motangan) {
    keywords.push(...motangan.split(',').map((k: string) => k.trim()).filter(Boolean));
  }
  
  return Array.from(new Set(keywords)).slice(0, 20); // Limit to 20 unique keywords
}

// Helper: Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

async function importBlogCategories() {
  console.log('\n📁 Importing Blog Categories for Rausach Tran Gia...\n');
  
  const categoriesFile = path.join(DATA_DIR, 'danhmucbaiviet.json');
  
  if (!fs.existsSync(categoriesFile)) {
    console.error(`❌ File not found: ${categoriesFile}`);
    return new Map<string, string>();
  }
  
  const categoriesData: OldCategory[] = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'));
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  // Create a map for old ID to new ID
  const categoryIdMap = new Map<string, string>();
  
  for (const oldCat of categoriesData) {
    try {
      // Skip empty categories
      if (!oldCat.Title || !oldCat.Slug) {
        console.log(`⚠️  Skipping empty category: ${oldCat.id}`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.blogCategory.findUnique({
        where: { slug: oldCat.Slug },
      });
      
      const categoryData = {
        name: oldCat.Title,
        slug: oldCat.Slug,
        description: oldCat.Mota || null,
        thumbnail: parseImage(oldCat.Image),
        order: oldCat.Ordering || 0,
        isActive: oldCat.Status === 1 || oldCat.Status === 0, // Both 0 and 1 are active
        parentId: oldCat.pid ? categoryIdMap.get(oldCat.pid) || null : null,
      };
      
      if (existing) {
        await prisma.blogCategory.update({
          where: { id: existing.id },
          data: categoryData,
        });
        categoryIdMap.set(oldCat.id, existing.id);
        console.log(`✅ Updated: ${oldCat.Title}`);
        updated++;
      } else {
        const newCat = await prisma.blogCategory.create({
          data: categoryData,
        });
        categoryIdMap.set(oldCat.id, newCat.id);
        console.log(`✨ Created: ${oldCat.Title}`);
        created++;
      }
    } catch (error: any) {
      console.error(`❌ Error with ${oldCat.Title}:`, error.message);
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 CATEGORIES SUMMARY:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${categoriesData.length}`);
  console.log('='.repeat(60));
  
  return categoryIdMap;
}

async function importBlogPosts(categoryIdMap: Map<string, string>) {
  console.log('\n📝 Importing Blog Posts for Rausach Tran Gia...\n');
  
  const postsFile = path.join(DATA_DIR, 'baiviet.json');
  
  if (!fs.existsSync(postsFile)) {
    console.error(`❌ File not found: ${postsFile}`);
    return;
  }
  
  const postsData: OldPost[] = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
  
  // Get or create default author (admin user)
  let defaultAuthor = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: 'admin@rausachtrangia.com' },
        { roleType: 'ADMIN' }
      ]
    },
  });
  
  if (!defaultAuthor) {
    console.log('⚠️  No admin user found. Creating default author for rausachtrangia...');
    defaultAuthor = await prisma.user.create({
      data: {
        email: 'admin@rausachtrangia.com',
        username: 'admin_rausachtrangia',
        password: '$2b$10$YourHashedPasswordHere', // Should be properly hashed
        firstName: 'Admin',
        lastName: 'Rausach Tran Gia',
        roleType: 'ADMIN',
        isActive: true,
        isVerified: true,
      },
    });
    console.log('✅ Created default author for rausachtrangia');
  }
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const oldPost of postsData) {
    try {
      // Skip posts without title or slug
      if (!oldPost.Title || !oldPost.Slug) {
        console.log(`⚠️  Skipping empty post: ${oldPost.id}`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.blogPost.findUnique({
        where: { slug: oldPost.Slug },
      });
      
      // Parse meta tags
      let metaTitle = oldPost.Title;
      let metaDescription = oldPost.Mota || '';
      
      try {
        const meta = JSON.parse(oldPost.MetaTags);
        if (meta.description) metaDescription = meta.description;
        if (meta.title) metaTitle = meta.title;
      } catch {}
      
      const postData = {
        title: oldPost.Title,
        slug: oldPost.Slug,
        excerpt: oldPost.Mota || null,
        content: cleanHtmlContent(oldPost.Noidung),
        authorId: defaultAuthor.id,
        categoryId: categoryIdMap.get(oldPost.idDM) || null,
        featuredImage: parseImage(oldPost.Image),
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        metaKeywords: extractKeywords(oldPost.MetaTags, oldPost.Motangan),
        status: oldPost.Status === 1 ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        visibility: PostVisibility.PUBLIC,
        isFeatured: oldPost.Noibat === 1,
        isPinned: false,
        displayOrder: oldPost.Ordering || 0,
        viewCount: 0,
        readingTime: calculateReadingTime(oldPost.Noidung),
        commentsEnabled: true,
        publishedAt: oldPost.Status === 1 ? new Date(oldPost.CreateAt) : null,
        createdAt: new Date(oldPost.CreateAt),
        updatedAt: new Date(oldPost.UpdateAt),
      };
      
      if (existing) {
        await prisma.blogPost.update({
          where: { id: existing.id },
          data: postData,
        });
        console.log(`✅ Updated: ${oldPost.Title.substring(0, 50)}${oldPost.Title.length > 50 ? '...' : ''}`);
        updated++;
      } else {
        await prisma.blogPost.create({
          data: postData,
        });
        console.log(`✨ Created: ${oldPost.Title.substring(0, 50)}${oldPost.Title.length > 50 ? '...' : ''}`);
        created++;
      }
    } catch (error: any) {
      console.error(`❌ Error with ${oldPost.Title.substring(0, 30)}:`, error.message);
      skipped++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 POSTS SUMMARY:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${postsData.length}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Starting Blog Data Import for RAUSACH TRAN GIA');
  console.log('='.repeat(60));
  console.log('\nData Directory:', DATA_DIR);
  console.log('Database: rausachcore (116.118.49.243:12003)');
  console.log('');
  
  try {
    // Check if files exist
    const categoriesFile = path.join(DATA_DIR, 'danhmucbaiviet.json');
    const postsFile = path.join(DATA_DIR, 'baiviet.json');
    
    if (!fs.existsSync(categoriesFile)) {
      throw new Error(`Categories file not found: ${categoriesFile}`);
    }
    
    if (!fs.existsSync(postsFile)) {
      throw new Error(`Posts file not found: ${postsFile}`);
    }
    
    console.log('✅ Data files found');
    
    // Step 1: Import Categories
    const categoryIdMap = await importBlogCategories();
    
    // Step 2: Import Posts
    await importBlogPosts(categoryIdMap);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ IMPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    // Show stats
    const categoriesCount = await prisma.blogCategory.count();
    const postsCount = await prisma.blogPost.count();
    const publishedCount = await prisma.blogPost.count({
      where: { status: PostStatus.PUBLISHED }
    });
    
    console.log(`\n📊 Final Database Stats for Rausach Tran Gia:`);
    console.log(`   Blog Categories: ${categoriesCount}`);
    console.log(`   Blog Posts: ${postsCount}`);
    console.log(`   Published Posts: ${publishedCount}`);
    console.log(`   Draft Posts: ${postsCount - publishedCount}`);
    console.log('');
    
  } catch (error: any) {
    console.error('\n❌ Import failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
