import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createProductDetailTemplate() {
  try {
    console.log('🚀 Creating Product Detail Page Template...\n');

      // Find or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { roleType: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123', // You should hash this in production
        roleType: 'ADMIN',
      },
    });
  }

  console.log(`👤 Using user: ${adminUser.email} (${adminUser.id})\n`);    // Create the page
    const page = await prisma.page.create({
      data: {
        title: 'Chi Tiết Sản Phẩm - Template',
        slug: 'product-detail-template',
        content: 'Template trang chi tiết sản phẩm động',
        status: 'PUBLISHED',
        isHomepage: false,
        isDynamic: true,
        dynamicConfig: {
          dataSource: 'product',
          slugPattern: '/san-pham/:slug',
          slugField: 'slug',
          dataBindings: [
            {
              blockId: 'product-name',
              sourceField: 'name',
              targetProperty: 'content.text',
            },
            {
              blockId: 'product-price',
              sourceField: 'price',
              targetProperty: 'content.text',
              transform: 'currency',
            },
            {
              blockId: 'product-description',
              sourceField: 'description',
              targetProperty: 'content.html',
            },
            {
              blockId: 'product-image',
              sourceField: 'images[0].url',
              targetProperty: 'content.src',
            },
          ],
        },
        seoTitle: 'Chi tiết sản phẩm - {{name}}',
        seoDescription: '{{shortDesc}}',
        seoKeywords: ['sản phẩm', 'rau sạch'],
        createdBy: adminUser.id,
        blocks: {
          create: [
            // Main Container
            {
              type: 'CONTAINER',
              order: 0,
              content: {},
              style: {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem',
              },
              config: {},
            },
            // Breadcrumb
            {
              type: 'TEXT',
              order: 1,
              content: {
                text: 'Trang chủ / Sản phẩm / {{name}}',
                tag: 'nav',
              },
              style: {
                fontSize: '14px',
                color: '#666',
                marginBottom: '1rem',
              },
              config: {
                id: 'breadcrumb',
              },
            },
            // Product Grid
            {
              type: 'GRID',
              order: 2,
              content: {},
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem',
                marginBottom: '2rem',
              },
              config: {
                columns: 2,
                responsive: true,
              },
            },
            // Product Image
            {
              type: 'IMAGE',
              order: 3,
              parentId: null,
              content: {
                src: '/placeholder-product.jpg',
                alt: 'Hình ảnh sản phẩm',
              },
              style: {
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              config: {
                id: 'product-image',
              },
            },
            // Product Info Container
            {
              type: 'CONTAINER',
              order: 4,
              content: {},
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              },
              config: {},
            },
            // Product Name
            {
              type: 'TEXT',
              order: 5,
              content: {
                text: '<h1>Tên Sản Phẩm</h1>',
              },
              style: {
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '0.5rem',
              },
              config: {
                id: 'product-name',
              },
            },
            // Product Price
            {
              type: 'TEXT',
              order: 6,
              content: {
                text: '0 đ',
                tag: 'div',
              },
              style: {
                fontSize: '1.75rem',
                fontWeight: 'bold',
                color: '#e74c3c',
                marginBottom: '1rem',
              },
              config: {
                id: 'product-price',
              },
            },
            // Product Short Description
            {
              type: 'TEXT',
              order: 7,
              content: {
                text: 'Mô tả ngắn sản phẩm',
                tag: 'p',
              },
              style: {
                fontSize: '1rem',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '1rem',
              },
              config: {
                id: 'product-short-desc',
              },
            },
            // Stock Status
            {
              type: 'TEXT',
              order: 8,
              content: {
                text: '✓ Còn hàng',
                tag: 'div',
              },
              style: {
                fontSize: '14px',
                color: '#27ae60',
                fontWeight: '500',
                marginBottom: '1.5rem',
              },
              config: {
                id: 'product-stock',
              },
            },
            // Add to Cart Button
            {
              type: 'BUTTON',
              order: 9,
              content: {
                text: 'Thêm vào giỏ hàng',
                link: '#',
              },
              style: {
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              },
              config: {
                variant: 'primary',
              },
            },
            // Divider
            {
              type: 'DIVIDER',
              order: 10,
              content: {},
              style: {
                margin: '2rem 0',
                borderColor: '#e0e0e0',
              },
              config: {},
            },
            // Description Section Title
            {
              type: 'TEXT',
              order: 11,
              content: {
                text: '<h2>Mô tả chi tiết</h2>',
              },
              style: {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              },
              config: {},
            },
            // Product Full Description
            {
              type: 'TEXT',
              order: 12,
              content: {
                text: '<p>Mô tả chi tiết sản phẩm sẽ được hiển thị ở đây.</p>',
              },
              style: {
                fontSize: '1rem',
                lineHeight: '1.8',
                color: '#333',
              },
              config: {
                id: 'product-description',
              },
            },
          ],
        },
      },
      include: {
        blocks: true,
      },
    });

    console.log('✅ Page created successfully!');
    console.log('\n📌 Page Details:');
    console.log(`   - ID: ${page.id}`);
    console.log(`   - Title: ${page.title}`);
    console.log(`   - Slug: ${page.slug}`);
    console.log(`   - Status: ${page.status}`);
    console.log(`   - Blocks: ${page.blocks.length}`);
    console.log(`   - Dynamic: ${page.isDynamic}`);

    if (page.isDynamic && page.dynamicConfig) {
      const config = page.dynamicConfig as any;
      console.log('\n📝 Dynamic Configuration:');
      console.log(`   - Data Source: ${config.dataSource}`);
      console.log(`   - Slug Pattern: ${config.slugPattern}`);
      console.log(`   - Data Bindings: ${config.dataBindings?.length || 0}`);
    }

    console.log('\n🎯 Next Steps:');
    console.log('   1. Truy cập PageBuilder: http://localhost:12000/admin/pagebuilder');
    console.log(`   2. Tìm page: "${page.title}"`);
    console.log('   3. Click để chỉnh sửa layout và blocks');
    console.log('   4. Test với sản phẩm: http://localhost:12000/san-pham/rau-muong');

  } catch (error) {
    console.error('❌ Error creating page:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createProductDetailTemplate();
