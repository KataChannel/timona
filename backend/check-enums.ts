import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkEnums() {
  const enums = await prisma.$queryRawUnsafe<Array<{typname: string}>>(
    `SELECT typname FROM pg_type WHERE typcategory = 'E' AND typname IN ('ReleaseType', 'ReleaseStatus', 'ChangelogType', 'GuideType', 'SupportTicketStatus', 'SupportTicketPriority', 'SupportTicketCategory') ORDER BY typname`
  );
  
  console.log('\n📋 Existing enums in database:');
  enums.forEach(e => console.log(`   - ${e.typname}`));
  
  // Check BlockType values
  const blockTypes = await prisma.$queryRawUnsafe<Array<{enumlabel: string}>>(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BlockType') ORDER BY enumsortorder`
  );
  
  console.log('\n📋 BlockType enum values:');
  blockTypes.forEach(b => console.log(`   - ${b.enumlabel}`));
  
  const hasBlogCarousel = blockTypes.some(b => b.enumlabel === 'BLOG_CAROUSEL');
  console.log(`\n${hasBlogCarousel ? '✅' : '❌'} BLOG_CAROUSEL ${hasBlogCarousel ? 'exists' : 'missing'}`);
  
  await prisma.$disconnect();
}

checkEnums().catch(console.error);
