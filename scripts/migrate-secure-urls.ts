#!/usr/bin/env bun
/**
 * Migration Script: Convert HTTP image URLs to HTTPS in blog posts
 * 
 * This script fixes mixed content issues by converting all HTTP image URLs
 * to HTTPS in existing blog post content.
 * 
 * Usage: bun run scripts/migrate-secure-urls.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBlogPostUrls() {
  console.log('🔍 Starting migration: Convert HTTP URLs to HTTPS in blog posts...\n');

  try {
    // Get all blog posts
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImage: true,
      },
    });

    console.log(`📊 Found ${posts.length} blog posts to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      let needsUpdate = false;
      const updates: any = {};

      // Check and convert content
      if (post.content && post.content.includes('http://')) {
        updates.content = post.content.replace(
          /(<img[^>]+src=["'])http:\/\//gi,
          '$1https://'
        );
        needsUpdate = true;
      }

      // Check and convert excerpt
      if (post.excerpt && post.excerpt.includes('http://')) {
        updates.excerpt = post.excerpt.replace(
          /(<img[^>]+src=["'])http:\/\//gi,
          '$1https://'
        );
        needsUpdate = true;
      }

      // Check and convert featured image
      if (post.featuredImage && post.featuredImage.startsWith('http://')) {
        updates.featuredImage = post.featuredImage.replace('http://', 'https://');
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: updates,
        });
        updatedCount++;
        console.log(`✅ Updated: "${post.title}" (ID: ${post.id})`);
      } else {
        skippedCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total posts checked: ${posts.length}`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped (no changes needed): ${skippedCount}`);
    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateBlogPostUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
