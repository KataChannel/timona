import { PrismaClient, ProductUnit, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleProducts() {
  console.log('\n🌱 Seeding Sample Products...\n');

  try {
    // Tìm hoặc tạo category mẫu
    let category = await prisma.category.findFirst({
      where: { slug: 'rau-sach' },
    });

    if (!category) {
      console.log('📁 Creating sample category...');
      category = await prisma.category.create({
        data: {
          name: 'Rau sạch',
          slug: 'rau-sach',
          description: 'Rau sạch hữu cơ',
          isActive: true,
          displayOrder: 1,
        },
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`✅ Using existing category: ${category.name}`);
    }

    // Tạo sản phẩm mẫu
    const sampleProducts = [
      {
        name: 'Cải xanh hữu cơ',
        nameEn: 'Organic Bok Choy',
        slug: 'cai-xanh-huu-co',
        description: 'Cải xanh tươi ngon, trồng theo phương pháp hữu cơ',
        shortDesc: 'Cải xanh hữu cơ Đà Lạt',
        price: 25000,
        originalPrice: 30000,
        stock: 100,
        unit: ProductUnit.KG,
        origin: 'Đà Lạt, Lâm Đồng',
        status: ProductStatus.ACTIVE,
        isFeatured: true,
        isNewArrival: true,
        categoryId: category.id,
      },
      {
        name: 'Cà chua bi',
        nameEn: 'Cherry Tomatoes',
        slug: 'ca-chua-bi',
        description: 'Cà chua bi ngọt, giàu vitamin C',
        shortDesc: 'Cà chua bi Đà Lạt',
        price: 35000,
        originalPrice: 40000,
        stock: 80,
        unit: ProductUnit.KG,
        origin: 'Đà Lạt, Lâm Đồng',
        status: ProductStatus.ACTIVE,
        isBestSeller: true,
        categoryId: category.id,
      },
      {
        name: 'Rau diếp xoăn',
        nameEn: 'Curly Lettuce',
        slug: 'rau-diep-xoan',
        description: 'Rau diếp xoăn tươi, giòn ngọt',
        shortDesc: 'Rau diếp xoăn hữu cơ',
        price: 30000,
        stock: 60,
        unit: ProductUnit.KG,
        origin: 'Đà Lạt, Lâm Đồng',
        status: ProductStatus.ACTIVE,
        isOnSale: true,
        categoryId: category.id,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const productData of sampleProducts) {
      const existing = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skipped++;
      } else {
        await prisma.product.create({
          data: productData,
        });
        console.log(`✨ Created: ${productData.name} (${productData.nameEn})`);
        created++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${sampleProducts.length}`);
    console.log('='.repeat(60) + '\n');

    // Test query lại
    console.log('🔍 Testing product query...');
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        price: true,
        stock: true,
        origin: true,
      },
    });

    console.log(`\n✅ Found ${products.length} products:`);
    products.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.name} (${p.nameEn || 'N/A'})`);
      console.log(`      Price: ${p.price.toLocaleString('vi-VN')}đ | Stock: ${p.stock} | Origin: ${p.origin}`);
    });

    console.log('\n✨ Seeding completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Error seeding products:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleProducts();
