import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductMenu() {
  const menu = await prisma.menu.findFirst({
    where: {
      OR: [
        { title: 'Sản Phẩm' },
        { path: '/admin/products' },
        { route: '/admin/products' },
      ],
    },
  });

  console.log('Sản Phẩm menu:');
  console.log(JSON.stringify(menu, null, 2));
}

checkProductMenu()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
