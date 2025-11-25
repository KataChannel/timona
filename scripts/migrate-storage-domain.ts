#!/usr/bin/env bun
/**
 * Migration Script: Update MinIO URLs to storage.rausachtrangia.com
 * 
 * This script updates all MinIO URLs in the database from:
 * - http://116.118.49.243:12007/...
 * To:
 * - https://storage.rausachtrangia.com/...
 * 
 * Usage: bun run scripts/migrate-storage-domain.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Old and new URLs
const OLD_URLS = [
  'http://116.118.49.243:12007',
  'https://116.118.49.243:12007',
];
const NEW_URL = 'https://storage.rausachtrangia.com';

async function migrateStorageUrls() {
  console.log('🔄 Starting migration: Update MinIO URLs to storage domain...\n');

  try {
    let totalUpdated = 0;

    // 1. Migrate Blog Posts
    console.log('📝 Migrating Blog Posts...');
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        images: true,
      },
    });

    let postUpdated = 0;
    for (const post of posts) {
      let needsUpdate = false;
      const updates: any = {};

      // Content
      if (post.content) {
        let newContent = post.content;
        for (const oldUrl of OLD_URLS) {
          if (newContent.includes(oldUrl)) {
            newContent = newContent.replace(new RegExp(oldUrl, 'g'), NEW_URL);
            needsUpdate = true;
          }
        }
        if (needsUpdate) updates.content = newContent;
      }

      // Excerpt
      if (post.excerpt) {
        let newExcerpt = post.excerpt;
        for (const oldUrl of OLD_URLS) {
          if (newExcerpt.includes(oldUrl)) {
            newExcerpt = newExcerpt.replace(new RegExp(oldUrl, 'g'), NEW_URL);
            needsUpdate = true;
          }
        }
        if (needsUpdate) updates.excerpt = newExcerpt;
      }

      // Featured Image
      if (post.featuredImage) {
        for (const oldUrl of OLD_URLS) {
          if (post.featuredImage.startsWith(oldUrl)) {
            updates.featuredImage = post.featuredImage.replace(oldUrl, NEW_URL);
            needsUpdate = true;
            break;
          }
        }
      }

      // Images array
      if (post.images && post.images.length > 0) {
        const newImages = post.images.map((img: string) => {
          for (const oldUrl of OLD_URLS) {
            if (img.startsWith(oldUrl)) {
              return img.replace(oldUrl, NEW_URL);
            }
          }
          return img;
        });
        if (JSON.stringify(newImages) !== JSON.stringify(post.images)) {
          updates.images = newImages;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: updates,
        });
        postUpdated++;
        console.log(`  ✅ Updated blog: "${post.title}"`);
      }
    }
    console.log(`  📊 Blog posts updated: ${postUpdated}/${posts.length}\n`);
    totalUpdated += postUpdated;

    // 2. Migrate Products (if exists)
    try {
      const products = await (prisma as any).product?.findMany({
        select: {
          id: true,
          name: true,
          images: true,
          thumbnailUrl: true,
          description: true,
        },
      });

      if (products) {
        console.log('🛍️  Migrating Products...');
        let productUpdated = 0;

        for (const product of products) {
          let needsUpdate = false;
          const updates: any = {};

          // Images array
          if (product.images && product.images.length > 0) {
            const newImages = product.images.map((img: string) => {
              for (const oldUrl of OLD_URLS) {
                if (img.startsWith(oldUrl)) {
                  return img.replace(oldUrl, NEW_URL);
                }
              }
              return img;
            });
            if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
              updates.images = newImages;
              needsUpdate = true;
            }
          }

          // Thumbnail
          if (product.thumbnailUrl) {
            for (const oldUrl of OLD_URLS) {
              if (product.thumbnailUrl.startsWith(oldUrl)) {
                updates.thumbnailUrl = product.thumbnailUrl.replace(oldUrl, NEW_URL);
                needsUpdate = true;
                break;
              }
            }
          }

          // Description
          if (product.description) {
            let newDescription = product.description;
            for (const oldUrl of OLD_URLS) {
              if (newDescription.includes(oldUrl)) {
                newDescription = newDescription.replace(new RegExp(oldUrl, 'g'), NEW_URL);
                needsUpdate = true;
              }
            }
            if (needsUpdate) updates.description = newDescription;
          }

          if (needsUpdate) {
            await (prisma as any).product.update({
              where: { id: product.id },
              data: updates,
            });
            productUpdated++;
            console.log(`  ✅ Updated product: "${product.name}"`);
          }
        }
        console.log(`  📊 Products updated: ${productUpdated}/${products.length}\n`);
        totalUpdated += productUpdated;
      }
    } catch (error) {
      console.log('  ⏭️  Skipping products (table may not exist)\n');
    }

    // 3. Migrate Users (avatars)
    console.log('👤 Migrating User Avatars...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
      },
      where: {
        avatar: {
          not: null,
        },
      },
    });

    let userUpdated = 0;
    for (const user of users) {
      if (user.avatar) {
        let needsUpdate = false;
        let newAvatar = user.avatar;

        for (const oldUrl of OLD_URLS) {
          if (newAvatar.startsWith(oldUrl)) {
            newAvatar = newAvatar.replace(oldUrl, NEW_URL);
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatar: newAvatar },
          });
          userUpdated++;
          console.log(`  ✅ Updated user: "${user.username}"`);
        }
      }
    }
    console.log(`  📊 Users updated: ${userUpdated}/${users.length}\n`);
    totalUpdated += userUpdated;

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`   Blog posts checked: ${posts.length}`);
    console.log(`   Users checked: ${users.length}`);
    console.log(`   Total updated: ${totalUpdated}`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration completed successfully!');
    console.log(`\n📋 URLs updated from:`);
    OLD_URLS.forEach(url => console.log(`   ❌ ${url}`));
    console.log(`📋 To:`);
    console.log(`   ✅ ${NEW_URL}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateStorageUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
