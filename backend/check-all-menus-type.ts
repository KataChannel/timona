import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMenuTypes() {
  console.log('🔍 Checking all menus by type...\n');

  const menus = await prisma.menu.findMany({
    where: {
      isActive: true,
      isVisible: true,
    },
    select: {
      id: true,
      title: true,
      type: true,
      route: true,
      url: true,
      path: true,
      slug: true,
      requiredRoles: true,
      isPublic: true,
    },
    orderBy: [
      { type: 'asc' },
      { order: 'asc' },
    ],
  });

  const menusByType = menus.reduce((acc, menu) => {
    const type = menu.type || 'NO_TYPE';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(menu);
    return acc;
  }, {} as Record<string, typeof menus>);

  for (const [type, items] of Object.entries(menusByType)) {
    console.log(`\n📋 ${type} (${items.length} menus):`);
    items.forEach((menu, index) => {
      const href = menu.route || menu.url || menu.path || `/${menu.slug}`;
      const roles = menu.requiredRoles && Array.isArray(menu.requiredRoles) 
        ? menu.requiredRoles.join(', ') 
        : 'none';
      const publicity = menu.isPublic ? '🌐 PUBLIC' : '🔒 PROTECTED';
      console.log(`  ${index + 1}. ${menu.title || menu.slug}`);
      console.log(`     Path: ${href}`);
      console.log(`     Roles: ${roles}`);
      console.log(`     ${publicity}`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`Total menus: ${menus.length}`);
  for (const [type, items] of Object.entries(menusByType)) {
    console.log(`  ${type}: ${items.length}`);
  }
}

checkMenuTypes()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
