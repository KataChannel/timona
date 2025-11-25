import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductMenu() {
  console.log('🔧 Fixing Sản Phẩm menu...\n');

  const menu = await prisma.menu.findFirst({
    where: {
      OR: [
        { title: 'Sản Phẩm', type: 'SIDEBAR' },
        { route: '/admin/products' },
      ],
    },
  });

  if (!menu) {
    console.error('❌ Menu not found');
    return;
  }

  console.log('Found menu:', menu.title);
  console.log('Current requiredRoles:', menu.requiredRoles);
  console.log('');

  await prisma.menu.update({
    where: { id: menu.id },
    data: {
      requiredRoles: ['admin', 'super_admin', 'product_manager', 'ecommerce_manager'],
      isPublic: false,
    },
  });

  console.log('✅ Updated menu:');
  console.log('   New requiredRoles: admin, super_admin, product_manager, ecommerce_manager');
  console.log('   isPublic: false');
}

fixProductMenu()
  .then(() => {
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
