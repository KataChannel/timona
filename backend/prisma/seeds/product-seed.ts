import { PrismaClient, ProductStatus, ProductUnit } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductsAndCategories() {
  console.log('Seeding products and categories...');

  // Create main categories
  const rauXanh = await prisma.category.create({
    data: {
      name: 'Rau xanh',
      slug: 'rau-xanh',
      description: 'Các loại rau xanh tươi ngon, giàu dinh dưỡng',
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
      metaTitle: 'Rau xanh tươi ngon - An toàn vệ sinh thực phẩm',
      metaDescription: 'Rau xanh tươi mỗi ngày, nguồn gốc rõ ràng',
    },
  });

  const rauCu = await prisma.category.create({
    data: {
      name: 'Rau củ',
      slug: 'rau-cu',
      description: 'Củ quả tươi ngon từ các vùng miền',
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
      metaTitle: 'Rau củ tươi ngon - Chất lượng cao',
      metaDescription: 'Rau củ tươi từ Đà Lạt, Lâm Đồng',
    },
  });

  const rauGiaVi = await prisma.category.create({
    data: {
      name: 'Rau gia vị',
      slug: 'rau-gia-vi',
      description: 'Gia vị thơm ngon cho món ăn Việt',
      isActive: true,
      isFeatured: true,
      displayOrder: 3,
      metaTitle: 'Rau gia vị tươi - Hương vị đậm đà',
      metaDescription: 'Rau gia vị tươi mỗi ngày',
    },
  });

  const rauHoDau = await prisma.category.create({
    data: {
      name: 'Rau họ đậu',
      slug: 'rau-ho-dau',
      description: 'Các loại rau họ đậu giàu protein thực vật',
      isActive: true,
      displayOrder: 4,
      metaTitle: 'Rau họ đậu - Protein thực vật',
      metaDescription: 'Đậu các loại tươi ngon',
    },
  });

  // Products for Rau xanh
  const rauXanhProducts = [
    {
      name: 'Rau muống',
      slug: 'rau-muong',
      description: 'Rau muống tươi, giòn ngọt, giàu vitamin và khoáng chất. Thích hợp xào tỏi, luộc chấm mắm.',
      shortDesc: 'Rau muống tươi giòn ngọt',
      price: 15000,
      originalPrice: 18000,
      costPrice: 10000,
      sku: 'RM-001',
      stock: 100,
      minStock: 10,
      unit: ProductUnit.BUNDLE,
      weight: 0.3,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauXanh.id,
      isFeatured: true,
      isBestSeller: true,
      isOnSale: true,
      displayOrder: 1,
      attributes: {
        organic: true,
        pesticide_free: true,
        freshness: 'Hái trong ngày',
      },
      metaTitle: 'Rau muống Đà Lạt tươi ngon',
      metaKeywords: 'rau muống, rau xanh, đà lạt',
    },
    {
      name: 'Cải xanh',
      slug: 'cai-xanh',
      description: 'Cải xanh tươi mát, ngọt nước. Giàu canxi và vitamin K. Thích hợp nấu canh, xào.',
      shortDesc: 'Cải xanh tươi mát ngọt nước',
      price: 12000,
      originalPrice: 15000,
      costPrice: 8000,
      sku: 'CX-001',
      stock: 150,
      minStock: 15,
      unit: ProductUnit.BUNDLE,
      weight: 0.4,
      origin: 'Lâm Đồng',
      status: ProductStatus.ACTIVE,
      categoryId: rauXanh.id,
      isFeatured: true,
      isOnSale: true,
      displayOrder: 2,
      attributes: {
        organic: false,
        vgap: true,
      },
      metaTitle: 'Cải xanh Lâm Đồng',
      metaKeywords: 'cải xanh, rau xanh, lâm đồng',
    },
    {
      name: 'Rau dền đỏ',
      slug: 'rau-den-do',
      description: 'Rau dền đỏ giàu sắt, tốt cho người thiếu máu. Nấu canh cua rất ngon.',
      shortDesc: 'Rau dền đỏ giàu sắt',
      price: 10000,
      costPrice: 6000,
      sku: 'RD-001',
      stock: 80,
      minStock: 10,
      unit: ProductUnit.BUNDLE,
      weight: 0.3,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauXanh.id,
      displayOrder: 3,
      metaTitle: 'Rau dền đỏ tươi',
      metaKeywords: 'rau dền, rau đỏ',
    },
    {
      name: 'Cải ngọt',
      slug: 'cai-ngot',
      description: 'Cải ngọt giòn, ngọt tự nhiên, thích hợp xào hoặc ăn lẩu.',
      shortDesc: 'Cải ngọt giòn ngọt',
      price: 14000,
      costPrice: 9000,
      sku: 'CN-001',
      stock: 120,
      minStock: 12,
      unit: ProductUnit.BUNDLE,
      weight: 0.35,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauXanh.id,
      isNewArrival: true,
      displayOrder: 4,
    },
  ];

  // Products for Rau củ
  const rauCuProducts = [
    {
      name: 'Cà rốt Đà Lạt',
      slug: 'ca-rot-da-lat',
      description: 'Cà rốt Đà Lạt ngọt giòn, giàu vitamin A và beta-carotene. Tốt cho mắt và làn da.',
      shortDesc: 'Cà rốt Đà Lạt ngọt giòn',
      price: 25000,
      originalPrice: 30000,
      costPrice: 18000,
      sku: 'CR-001',
      stock: 200,
      minStock: 20,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauCu.id,
      isFeatured: true,
      isBestSeller: true,
      isOnSale: true,
      displayOrder: 1,
      attributes: {
        size: 'Trung bình',
        organic: true,
      },
      metaTitle: 'Cà rốt Đà Lạt ngọt giòn',
      metaKeywords: 'cà rốt, đà lạt, rau củ',
    },
    {
      name: 'Khoai tây Đà Lạt',
      slug: 'khoai-tay-da-lat',
      description: 'Khoai tây Đà Lạt vàng ươm, bở ngọt. Thích hợp chiên, kho, nấu canh.',
      shortDesc: 'Khoai tây Đà Lạt bở ngọt',
      price: 28000,
      costPrice: 20000,
      sku: 'KT-001',
      stock: 300,
      minStock: 30,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauCu.id,
      isFeatured: true,
      isBestSeller: true,
      displayOrder: 2,
      metaTitle: 'Khoai tây Đà Lạt chất lượng',
      metaKeywords: 'khoai tây, đà lạt',
    },
    {
      name: 'Củ cải trắng',
      slug: 'cu-cai-trang',
      description: 'Củ cải trắng tươi, giòn ngọt. Nấu canh, dưa chua rất ngon.',
      shortDesc: 'Củ cải trắng giòn ngọt',
      price: 15000,
      costPrice: 10000,
      sku: 'CCT-001',
      stock: 150,
      minStock: 15,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Lâm Đồng',
      status: ProductStatus.ACTIVE,
      categoryId: rauCu.id,
      displayOrder: 3,
    },
    {
      name: 'Khoai lang tím',
      slug: 'khoai-lang-tim',
      description: 'Khoai lang tím giàu chất chống oxi hóa, tốt cho sức khỏe.',
      shortDesc: 'Khoai lang tím bổ dưỡng',
      price: 22000,
      costPrice: 15000,
      sku: 'KLT-001',
      stock: 100,
      minStock: 10,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauCu.id,
      isNewArrival: true,
      displayOrder: 4,
    },
  ];

  // Products for Rau gia vị
  const rauGiaViProducts = [
    {
      name: 'Hành lá',
      slug: 'hanh-la',
      description: 'Hành lá tươi thơm, không thể thiếu trong bếp Việt. Dùng để rắc lên các món ăn.',
      shortDesc: 'Hành lá tươi thơm',
      price: 8000,
      costPrice: 5000,
      sku: 'HL-001',
      stock: 200,
      minStock: 20,
      unit: ProductUnit.BUNDLE,
      weight: 0.1,
      origin: 'Lâm Đồng',
      status: ProductStatus.ACTIVE,
      categoryId: rauGiaVi.id,
      isBestSeller: true,
      displayOrder: 1,
      metaTitle: 'Hành lá tươi',
      metaKeywords: 'hành lá, gia vị',
    },
    {
      name: 'Ngò rí',
      slug: 'ngo-ri',
      description: 'Ngò rí (rau mùi) thơm đặc trưng, dùng cho phở, bún, gỏi.',
      shortDesc: 'Ngò rí thơm đặc trưng',
      price: 7000,
      costPrice: 4000,
      sku: 'NR-001',
      stock: 150,
      minStock: 15,
      unit: ProductUnit.BUNDLE,
      weight: 0.1,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauGiaVi.id,
      isBestSeller: true,
      displayOrder: 2,
    },
    {
      name: 'Húng quế',
      slug: 'hung-que',
      description: 'Húng quế thơm nồng, dùng cho phở, bún bò, các món Thái.',
      shortDesc: 'Húng quế thơm nồng',
      price: 6000,
      costPrice: 3000,
      sku: 'HQ-001',
      stock: 100,
      minStock: 10,
      unit: ProductUnit.BUNDLE,
      weight: 0.05,
      origin: 'Lâm Đồng',
      status: ProductStatus.ACTIVE,
      categoryId: rauGiaVi.id,
      displayOrder: 3,
    },
    {
      name: 'Tía tô',
      slug: 'tia-to',
      description: 'Tía tô (perilla) thơm mát, dùng cho gỏi, bún, ốc.',
      shortDesc: 'Tía tô thơm mát',
      price: 5000,
      costPrice: 3000,
      sku: 'TT-001',
      stock: 80,
      minStock: 8,
      unit: ProductUnit.BUNDLE,
      weight: 0.05,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauGiaVi.id,
      displayOrder: 4,
    },
  ];

  // Products for Rau họ đậu
  const rauHoDauProducts = [
    {
      name: 'Đậu cove',
      slug: 'dau-cove',
      description: 'Đậu cove (đậu Hà Lan) giòn ngọt, giàu protein và chất xơ.',
      shortDesc: 'Đậu cove giòn ngọt',
      price: 35000,
      originalPrice: 40000,
      costPrice: 25000,
      sku: 'DC-001',
      stock: 80,
      minStock: 8,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauHoDau.id,
      isFeatured: true,
      isOnSale: true,
      displayOrder: 1,
      metaTitle: 'Đậu cove Đà Lạt',
      metaKeywords: 'đậu cove, đậu hà lan',
    },
    {
      name: 'Đậu que',
      slug: 'dau-que',
      description: 'Đậu que tươi, non giòn, xào hoặc luộc đều ngon.',
      shortDesc: 'Đậu que tươi non giòn',
      price: 25000,
      costPrice: 18000,
      sku: 'DQ-001',
      stock: 100,
      minStock: 10,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Lâm Đồng',
      status: ProductStatus.ACTIVE,
      categoryId: rauHoDau.id,
      displayOrder: 2,
    },
    {
      name: 'Đậu Hà Lan hạt',
      slug: 'dau-ha-lan-hat',
      description: 'Đậu Hà Lan hạt tươi, ngọt mát, giàu protein.',
      shortDesc: 'Đậu Hà Lan hạt tươi',
      price: 30000,
      costPrice: 22000,
      sku: 'DHL-001',
      stock: 60,
      minStock: 6,
      unit: ProductUnit.KG,
      weight: 1.0,
      origin: 'Đà Lạt',
      status: ProductStatus.ACTIVE,
      categoryId: rauHoDau.id,
      isNewArrival: true,
      displayOrder: 3,
    },
  ];

  // Create all products
  const allProducts = [
    ...rauXanhProducts,
    ...rauCuProducts,
    ...rauGiaViProducts,
    ...rauHoDauProducts,
  ];

  for (const product of allProducts) {
    await prisma.product.create({ data: product });
    console.log(`Created product: ${product.name}`);
  }

  // Create some product images
  await prisma.productImage.createMany({
    data: [
      {
        productId: (await prisma.product.findUnique({ where: { slug: 'rau-muong' } }))!.id,
        url: '/images/products/rau-muong-1.jpg',
        alt: 'Rau muống tươi',
        isPrimary: true,
        order: 0,
      },
      {
        productId: (await prisma.product.findUnique({ where: { slug: 'ca-rot-da-lat' } }))!.id,
        url: '/images/products/ca-rot-1.jpg',
        alt: 'Cà rốt Đà Lạt',
        isPrimary: true,
        order: 0,
      },
    ],
  });

  // Create some product variants
  const carrotId = (await prisma.product.findUnique({ where: { slug: 'ca-rot-da-lat' } }))!.id;
  await prisma.productVariant.createMany({
    data: [
      {
        productId: carrotId,
        name: '500g',
        sku: 'CR-001-500',
        price: 15000,
        stock: 50,
        attributes: { weight: '500g' },
        isActive: true,
        order: 1,
      },
      {
        productId: carrotId,
        name: '1kg',
        sku: 'CR-001-1K',
        price: 25000,
        stock: 100,
        attributes: { weight: '1kg' },
        isActive: true,
        order: 2,
      },
      {
        productId: carrotId,
        name: '2kg (Túi)',
        sku: 'CR-001-2K',
        price: 45000,
        stock: 30,
        attributes: { weight: '2kg', packaging: 'bag' },
        isActive: true,
        order: 3,
      },
    ],
  });

  console.log('✅ Products and categories seeded successfully!');
}

seedProductsAndCategories()
  .catch((e) => {
    console.error('❌ Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
