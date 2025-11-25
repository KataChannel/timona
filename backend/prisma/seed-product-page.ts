import { PrismaClient, PageStatus, BlockType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductDetailPage() {
  console.log('🌱 Seeding Product Detail Page in PageBuilder...');

  try {
    // 1. Get or create a default category
    const category = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
      },
    });

    // 2. Create sample products
    const product1 = await prisma.product.upsert({
      where: { slug: 'macbook-pro-m3' },
      update: {},
      create: {
        name: 'MacBook Pro M3',
        slug: 'macbook-pro-m3',
        description: 'Powerful laptop for professionals with latest M3 chip',
        shortDesc: 'M3 powered laptop with stunning display',
        price: 1999,
        originalPrice: 2399,
        sku: 'MBP-M3-2024',
        weight: 3.5,
        barcode: '1234567890001',
        categoryId: category.id,
        isFeatured: true,
        publishedAt: new Date(),
      },
    });

    const product2 = await prisma.product.upsert({
      where: { slug: 'iphone-15-pro' },
      update: {},
      create: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest flagship smartphone with advanced features',
        shortDesc: 'Premium smartphone with advanced camera system',
        price: 1099,
        originalPrice: 1199,
        sku: 'IP15P-2024',
        weight: 0.201,
        barcode: '1234567890002',
        categoryId: category.id,
        isBestSeller: true,
        publishedAt: new Date(),
      },
    });

    const product3 = await prisma.product.upsert({
      where: { slug: 'airpods-pro' },
      update: {},
      create: {
        name: 'AirPods Pro',
        slug: 'airpods-pro',
        description: 'Premium wireless earbuds with active noise cancellation',
        shortDesc: 'Wireless earbuds with advanced noise cancellation',
        price: 249,
        originalPrice: 299,
        sku: 'APP-2024',
        weight: 0.048,
        barcode: '1234567890003',
        categoryId: category.id,
        isNewArrival: true,
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Created 3 products`);

    // 3. Add product images
    await Promise.all([
      prisma.productImage.create({
        data: {
          productId: product1.id,
          url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&h=800&fit=crop',
          alt: 'MacBook Pro M3',
          isPrimary: true,
          order: 1,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: product2.id,
          url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&h=800&fit=crop',
          alt: 'iPhone 15 Pro',
          isPrimary: true,
          order: 1,
        },
      }),
      prisma.productImage.create({
        data: {
          productId: product3.id,
          url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1000&h=800&fit=crop',
          alt: 'AirPods Pro',
          isPrimary: true,
          order: 1,
        },
      }),
    ]);

    console.log(`✅ Created product images`);

    // 4. Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { roleType: 'ADMIN' },
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Please run main seed first.');
    }

    // 5. Create product detail page
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'product-detail' },
    });

    if (existingPage) {
      await prisma.pageBlock.deleteMany({
        where: { pageId: existingPage.id },
      });
      await prisma.page.delete({
        where: { id: existingPage.id },
      });
    }

    const page = await prisma.page.create({
      data: {
        title: 'Product Detail',
        slug: 'product-detail',
        status: PageStatus.PUBLISHED,
        seoTitle: 'Product - {{productName}}',
        seoDescription: '{{productDescription}} - Price: ${{productPrice}}',
        seoKeywords: JSON.stringify(['product', 'shop']),
        createdBy: adminUser.id,
      },
    });

    console.log(`✅ Created page: ${page.title}`);

    // 6. Create hero block with dynamic data
    const heroBlock = await prisma.pageBlock.create({
      data: {
        pageId: page.id,
        type: BlockType.HERO,
        order: 1,
        isVisible: true,
        content: {
          componentType: 'template',
          templateId: 'product-hero',
          template: `
<div class="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
  <div class="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
    <div class="flex items-center justify-center">
      <img src="{{productImage}}" alt="{{productName}}" class="w-full h-auto rounded-lg shadow-xl" />
    </div>
    <div>
      <h1 class="text-5xl font-bold mb-4 text-gray-900">{{productName}}</h1>
      <p class="text-xl text-gray-600 mb-6">{{productDescription}}</p>
      <div class="flex items-baseline gap-4 mb-8">
        <span class="text-4xl font-bold text-blue-600">\${{productPrice}}</span>
        {{#if productOriginalPrice}}
        <span class="text-xl text-gray-400 line-through">\${{productOriginalPrice}}</span>
        {{/if}}
      </div>
      <div class="flex gap-4">
        <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Add to Cart
        </button>
        <button class="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          Wishlist
        </button>
      </div>
    </div>
  </div>
</div>
          `,
        },
        config: {
          dataSource: {
            type: 'graphql',
            endpoint: '/graphql',
            query: `
query GetProduct($slug: String!) {
  getProductBySlug(slug: $slug) {
    id
    name
    slug
    description
    price
    originalPrice
    sku
    weight
    images {
      id
      url
      alt
      isPrimary
    }
  }
}
            `,
            variables: {
              slug: null,
            },
          },
          variableMappings: {
            productName: 'name',
            productDescription: 'description',
            productPrice: 'price',
            productOriginalPrice: 'originalPrice',
            productImage: 'images[0].url',
            productSku: 'sku',
            productWeight: 'weight',
          },
        },
      },
    });

    console.log(`✅ Created hero block with dynamic data`);

    // 7. Create details block
    const detailsBlock = await prisma.pageBlock.create({
      data: {
        pageId: page.id,
        type: BlockType.TEXT,
        order: 2,
        isVisible: true,
        content: {
          componentType: 'template',
          templateId: 'product-details',
          template: `
<div class="max-w-6xl mx-auto px-4 py-16">
  <div class="grid md:grid-cols-3 gap-8">
    <div class="bg-blue-50 p-6 rounded-lg">
      <h3 class="font-bold text-lg mb-2">SKU</h3>
      <p class="text-gray-700">{{productSku}}</p>
    </div>
    <div class="bg-blue-50 p-6 rounded-lg">
      <h3 class="font-bold text-lg mb-2">Weight</h3>
      <p class="text-gray-700">{{productWeight}} lbs</p>
    </div>
    <div class="bg-blue-50 p-6 rounded-lg">
      <h3 class="font-bold text-lg mb-2">Availability</h3>
      <p class="text-green-600 font-semibold">In Stock</p>
    </div>
  </div>
</div>
          `,
        },
        config: {
          dataSource: {
            type: 'graphql',
            endpoint: '/graphql',
            query: `
query GetProduct($slug: String!) {
  getProductBySlug(slug: $slug) {
    sku
    weight
  }
}
            `,
            variables: {
              slug: null,
            },
          },
          variableMappings: {
            productSku: 'sku',
            productWeight: 'weight',
          },
        },
      },
    });

    console.log(`✅ Created details block`);

    // 8. Create related products block
    const relatedBlock = await prisma.pageBlock.create({
      data: {
        pageId: page.id,
        type: BlockType.GRID,
        order: 3,
        isVisible: true,
        content: {
          componentType: 'template',
          templateId: 'related-products',
          template: `
<div class="max-w-6xl mx-auto px-4 py-16 bg-gray-50">
  <h2 class="text-3xl font-bold mb-12">Related Products</h2>
  <div class="grid md:grid-cols-3 gap-6">
    {{#each relatedProducts}}
    <div class="bg-white rounded-lg overflow-hidden shadow hover:shadow-xl transition">
      <img src="{{image}}" alt="{{name}}" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">{{name}}</h3>
        <p class="text-gray-600 text-sm mb-4">{{description}}</p>
        <div class="flex justify-between items-center">
          <span class="font-bold text-blue-600 text-lg">\${{price}}</span>
          <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            View
          </button>
        </div>
      </div>
    </div>
    {{/each}}
  </div>
</div>
          `,
        },
        config: {
          dataSource: {
            type: 'graphql',
            endpoint: '/graphql',
            query: `
query GetAllProducts {
  getProducts(limit: 3) {
    items {
      id
      name
      slug
      description
      price
      images {
        url
        isPrimary
      }
    }
  }
}
            `,
            variables: {},
          },
          variableMappings: {
            relatedProducts: 'items',
          },
        },
      },
    });

    console.log(`✅ Created related products block`);

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Product Detail Page Seed Complete! ✅                  ║
╚════════════════════════════════════════════════════════════════╝

📄 Page Created in PageBuilder:
  - Title: Product Detail
  - Slug: /product-detail
  - URL Pattern: /product-detail/[slug]

📦 Sample Products Created:
  ✓ MacBook Pro M3 ($1,999)
  ✓ iPhone 15 Pro ($1,099)
  ✓ AirPods Pro ($249)

🧱 Page Blocks:
  1. Hero Section - Product info with image & price
  2. Details Section - SKU, Weight, Availability
  3. Related Products - Recommended items

🔧 Features:
  ✓ Dynamic slug from URL parameter
  ✓ GraphQL data fetching
  ✓ Template variable mapping
  ✓ Responsive design
  ✓ Product images & details

🚀 Test URLs:
  - http://localhost:3000/product-detail/macbook-pro-m3
  - http://localhost:3000/product-detail/iphone-15-pro
  - http://localhost:3000/product-detail/airpods-pro

📝 To customize in PageBuilder:
  1. Go to Page Builder
  2. Find "Product Detail" page
  3. Click Edit on any block
  4. Modify template or GraphQL query
  5. Changes saved automatically

    `);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seedProductDetailPage()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
