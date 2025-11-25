import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSourceDocuments() {
  console.log('🔍 Checking Source Documents...\n');

  // Count by type
  const types = ['FILE', 'VIDEO', 'TEXT', 'AUDIO', 'LINK', 'IMAGE'];
  
  for (const type of types) {
    const count = await prisma.sourceDocument.count({
      where: { type: type as any },
    });
    const icon = {
      FILE: '📄',
      VIDEO: '🎥',
      TEXT: '📝',
      AUDIO: '🎵',
      LINK: '🔗',
      IMAGE: '🖼️'
    }[type];
    console.log(`${icon} ${type}: ${count} documents`);
  }

  console.log('\n📊 Total Statistics:');
  const total = await prisma.sourceDocument.count();
  const published = await prisma.sourceDocument.count({
    where: { status: 'PUBLISHED' },
  });
  const analyzed = await prisma.sourceDocument.count({
    where: { isAiAnalyzed: true },
  });
  
  console.log(`Total Documents: ${total}`);
  console.log(`Published: ${published}`);
  console.log(`AI Analyzed: ${analyzed}`);

  console.log('\n📁 Categories:');
  const categories = await prisma.sourceDocumentCategory.findMany({
    include: {
      _count: {
        select: { sourceDocuments: true },
      },
    },
  });

  categories.forEach((cat) => {
    console.log(`${cat.icon || '📂'} ${cat.name}: ${cat._count.sourceDocuments} documents`);
  });

  console.log('\n📚 Sample Documents:');
  const samples = await prisma.sourceDocument.findMany({
    take: 3,
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  samples.forEach((doc) => {
    const typeIcon = {
      FILE: '📄',
      VIDEO: '🎥',
      TEXT: '📝',
      AUDIO: '🎵',
      LINK: '🔗',
      IMAGE: '🖼️'
    }[doc.type];
    console.log(`\n${typeIcon} ${doc.title}`);
    console.log(`   Category: ${doc.category?.name || 'N/A'}`);
    console.log(`   Status: ${doc.status}`);
    console.log(`   Tags: ${doc.tags.join(', ')}`);
    if (doc.aiSummary) {
      console.log(`   AI Summary: ${doc.aiSummary.substring(0, 100)}...`);
    }
  });
}

async function main() {
  try {
    await checkSourceDocuments();
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
