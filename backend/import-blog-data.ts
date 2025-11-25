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
  console.log('\n📁 Importing Blog Categories...\n');
  
  const categoriesFile = path.join(DATA_DIR, 'danhmucbaiviet.json');
  const categoriesData: OldCategory[] = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'));
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  // Create a map for old ID to new ID
  const categoryIdMap = new Map<string, string>();
  
  for (const oldCat of categoriesData) {
    try {
      const existing = await prisma.blogCategory.findUnique({
        where: { slug: oldCat.Slug },
      });
      
      const categoryData = {
        name: oldCat.Title,
        slug: oldCat.Slug,
        description: oldCat.Mota || null,
        thumbnail: parseImage(oldCat.Image),
        order: oldCat.Ordering,
        isActive: oldCat.Status === 1,
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
  console.log('\n📝 Importing Blog Posts...\n');
  
  const postsFile = path.join(DATA_DIR, 'baiviet.json');
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
    console.log('⚠️  No admin user found. Creating default author...');
    defaultAuthor = await prisma.user.create({
      data: {
        email: 'admin@rausachtrangia.com',
        username: 'admin_rausach',
        password: '$2b$10$defaulthash', // Placeholder
        firstName: 'Admin',
        lastName: 'Rausach',
        roleType: 'ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Created default author');
  }
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const oldPost of postsData) {
    try {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: oldPost.Slug },
      });
      
      // Parse meta tags
      let metaTitle = oldPost.Title;
      let metaDescription = oldPost.Mota || '';
      
      try {
        const meta = JSON.parse(oldPost.MetaTags);
        if (meta.description) metaDescription = meta.description;
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
        displayOrder: oldPost.Ordering,
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
        console.log(`✅ Updated: ${oldPost.Title.substring(0, 50)}...`);
        updated++;
      } else {
        await prisma.blogPost.create({
          data: postData,
        });
        console.log(`✨ Created: ${oldPost.Title.substring(0, 50)}...`);
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
  console.log('\n🚀 Starting Blog Data Import...\n');
  console.log('Data Directory:', DATA_DIR);
  
  try {
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
    
    console.log(`\n📊 Final Database Stats:`);
    console.log(`   Blog Categories: ${categoriesCount}`);
    console.log(`   Blog Posts: ${postsCount}`);
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
