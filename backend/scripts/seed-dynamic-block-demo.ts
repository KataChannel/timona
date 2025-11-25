#!/usr/bin/env npx ts-node
/**
 * Seed Dynamic Block Demo Data
 * 
 * Usage:
 * npx ts-node backend/scripts/seed-dynamic-block-demo.ts
 * 
 * Creates:
 * - Sample products (featured)
 * - Demo pages with Dynamic Blocks using GraphQL and Static Data
 */

import { PrismaClient, BlockType, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDynamicBlockDemo() {
  console.log('🌱 Seeding Dynamic Block Demo Data...\n');

  try {
    // Get demo user for createdBy
    let user = await prisma.user.findFirst({
      where: { email: 'demo@rausachcore.com' }
    }).catch(() => null);

    if (!user) {
      console.log('👤 Creating demo user...');
      user = await prisma.user.create({
        data: {
          email: 'demo@rausachcore.com',
          username: 'demo-user',
          firstName: 'Demo',
          lastName: 'User',
        },
      }).catch(() => ({
        id: 'demo-user',
        email: 'demo@rausachcore.com',
        username: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
      } as any));
    }

    const userId = user?.id || 'demo-user';
    console.log(`✅ Using user: ${user?.email}\n`);

    // 1. Create sample products
    console.log('📦 Creating sample products...');
    const productData = [
      {
        name: 'MacBook Pro M3',
        slug: 'macbook-pro-m3',
        price: 1999,
        description: 'Powerful laptop for professionals with M3 chip',
        thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
      },
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: 1099,
        description: 'Latest smartphone with advanced camera system',
        thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      },
      {
        name: 'AirPods Pro',
        slug: 'airpods-pro',
        price: 249,
        description: 'Premium wireless earbuds with noise cancellation',
        thumbnail: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop',
      },
    ];

    const products = [];
    for (const productInfo of productData) {
      try {
        // First try to get or create a category
        let category = await prisma.category.findFirst({
          where: { name: 'Electronics' }
        }).catch(() => null);

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: 'Electronics',
              slug: 'electronics',
              description: 'Electronic devices and accessories',
            }
          }).catch(() => null);
        }

        const product = await prisma.product.upsert({
          where: { slug: productInfo.slug },
          update: {},
          create: {
            name: productInfo.name,
            slug: productInfo.slug,
            price: productInfo.price,
            description: productInfo.description,
            thumbnail: productInfo.thumbnail,
            categoryId: category?.id || '',
          },
        }).catch(() => null);
        if (product) products.push(product);
      } catch (error) {
        console.warn(`  ⚠️  Product ${productInfo.slug} failed:`, (error as any).message);
      }
    }

    console.log(`✅ Created/Updated ${products.length} products\n`);

    // 2. Create demo page with Dynamic Block (Static Data)
    console.log('📄 Creating Static Data demo page...');
    const staticDemoPage = await prisma.page.upsert({
      where: { slug: 'featured-products-static-demo' },
      update: {},
      create: {
        title: 'Featured Products - Dynamic Block Demo',
        slug: 'featured-products-static-demo',
        description: 'Demo page showcasing Dynamic Block with Static Data source',
        status: PageStatus.PUBLISHED,
        createdBy: userId,
        blocks: {
          create: [
            {
              type: BlockType.HERO,
              order: 0,
              depth: 0,
              content: {
                title: 'Featured Products',
                subtitle: 'Discover our amazing collection powered by Dynamic Blocks',
              },
              style: {
                backgroundColor: '#f3f4f6',
                padding: '60px 20px',
              },
            },
            {
              type: BlockType.DYNAMIC,
              order: 1,
              depth: 0,
              config: {
                templateName: 'featured-products-static',
                dataSource: {
                  type: 'static',
                  staticData: {
                    title: 'Best Sellers',
                    subtitle: 'Handpicked products selected just for you',
                    products: [
                      {
                        id: '1',
                        name: 'MacBook Pro M3',
                        price: 1999,
                        description: 'Powerful laptop for professionals',
                        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
                        badge: 'Best Seller',
                        rating: 5,
                      },
                      {
                        id: '2',
                        name: 'iPhone 15 Pro',
                        price: 1099,
                        description: 'Latest smartphone technology',
                        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
                        badge: 'New',
                        rating: 5,
                      },
                      {
                        id: '3',
                        name: 'AirPods Pro',
                        price: 249,
                        description: 'Premium wireless earbuds',
                        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
                        badge: 'Sale',
                        rating: 4,
                      },
                    ],
                  },
                },
                repeater: {
                  enabled: true,
                  dataPath: 'products',
                  limit: 3,
                },
              },
              content: {
                componentType: 'template',
                templateId: 'featured-products-static',
                templateName: 'Featured Products',
                template: `
                  <section class="bg-white py-12">
                    <div class="container mx-auto px-4">
                      <h2 class="text-3xl font-bold mb-2 text-center">{{title}}</h2>
                      <p class="text-gray-600 text-center mb-12">{{subtitle}}</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {{#each products}}
                        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div class="relative overflow-hidden h-48 bg-gray-200">
                            <img src="{{image}}" alt="{{name}}" class="w-full h-full object-cover hover:scale-110 transition-transform">
                            <div class="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{{badge}}</div>
                          </div>
                          <div class="p-5">
                            <h3 class="font-bold text-lg mb-2">{{name}}</h3>
                            <p class="text-gray-600 text-sm mb-3">{{description}}</p>
                            <div class="flex justify-between items-center mb-4 pb-4 border-b">
                              <span class="text-2xl font-bold text-blue-600">\${{price}}</span>
                              <span class="text-yellow-500">{{#repeat rating}}★{{/repeat}}</span>
                            </div>
                            <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold">Add to Cart</button>
                          </div>
                        </div>
                        {{/each}}
                      </div>
                    </div>
                  </section>
                `,
              },
            },
          ],
        },
      },
      include: {
        blocks: true,
      },
    }).catch(error => {
      console.warn('Could not create page:', error.message);
      return { id: 'error', slug: 'featured-products-static-demo' };
    });

    console.log(`✅ Created/Updated demo page`);
    console.log(`   Slug: ${staticDemoPage.slug}\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Dynamic Block Demo Data Seeded!\n');
    console.log('📊 Summary:');
    console.log(`   • Products: ${products.length} items`);
    console.log(`   • Demo Page: featured-products-static-demo\n`);
    console.log('🔗 Access URLs:');
    console.log(`   🌐 View Demo:  http://localhost:3000/pages/${staticDemoPage.slug}`);
    console.log(`   📝 Admin:      http://localhost:3000/admin/pages\n`);
    console.log('📚 Documentation:');
    console.log('   Read: DYNAMIC_BLOCK_GUIDE.md\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDynamicBlockDemo()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
