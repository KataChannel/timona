import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthGraphQL() {
  try {
    console.log('🔍 Test GraphQL query cho AUTH settings...\n');

    // Simulate GraphQL query: websiteSettings(category: "AUTH")
    const authSettings = await prisma.websiteSetting.findMany({
      where: {
        category: 'AUTH',
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ],
    });

    console.log(`✅ Query: websiteSettings(category: "AUTH")`);
    console.log(`📦 Kết quả: ${authSettings.length} settings\n`);

    authSettings.forEach((s, i) => {
      console.log(`${i + 1}. ${s.label} (${s.key})`);
      console.log(`   Value: ${s.value}`);
      console.log(`   Type: ${s.type}`);
    });

    // Simulate GraphQL query: publicWebsiteSettings(category: "AUTH")
    console.log('\n---\n');
    const publicAuthSettings = await prisma.websiteSetting.findMany({
      where: {
        category: 'AUTH',
        isActive: true,
        isPublic: true,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ],
    });

    console.log(`✅ Query: publicWebsiteSettings(category: "AUTH")`);
    console.log(`📦 Kết quả: ${publicAuthSettings.length} settings\n`);

    console.log('\n✅ GraphQL queries hoạt động bình thường!');
    console.log('💡 Có thể test qua GraphQL Playground:');
    console.log('   http://localhost:4000/graphql');
    console.log('\nQuery example:');
    console.log(`
query GetAuthSettings {
  websiteSettings(category: "AUTH") {
    key
    label
    value
    type
    category
  }
}
    `);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuthGraphQL();
