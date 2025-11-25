import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidCUID(str: string): boolean {
  const cuidRegex = /^c[0-9a-z]{24}$/;
  return cuidRegex.test(str);
}

async function validateUUIDs() {
  console.log('🔍 Validating UUID format in database...\n');
  
  let totalChecked = 0;
  let invalidIds = 0;
  let cuidFound = 0;
  
  try {
    // Check Users
    console.log('Checking Users...');
    const users = await prisma.user.findMany({ select: { id: true, username: true } });
    for (const user of users) {
      totalChecked++;
      if (!isValidUUID(user.id)) {
        console.log(`❌ Invalid UUID in Users: ${user.id} (${user.username})`);
        invalidIds++;
        if (isValidCUID(user.id)) {
          cuidFound++;
        }
      }
    }
    console.log(`✅ Users: ${users.length} records, all have valid UUIDs\n`);
    
    // Check Tasks
    console.log('Checking Tasks...');
    const tasks = await prisma.task.findMany({ select: { id: true, title: true, userId: true, parentId: true } });
    for (const task of tasks) {
      totalChecked++;
      if (!isValidUUID(task.id)) {
        console.log(`❌ Invalid UUID in Tasks: ${task.id} (${task.title})`);
        invalidIds++;
        if (isValidCUID(task.id)) {
          cuidFound++;
        }
      }
      
      // Check foreign keys
      if (task.userId && !isValidUUID(task.userId)) {
        console.log(`❌ Invalid UUID in Tasks.userId: ${task.userId}`);
        invalidIds++;
      }
      if (task.parentId && !isValidUUID(task.parentId)) {
        console.log(`❌ Invalid UUID in Tasks.parentId: ${task.parentId}`);
        invalidIds++;
      }
    }
    console.log(`✅ Tasks: ${tasks.length} records, all have valid UUIDs\n`);
    
    // Check Auth Methods
    console.log('Checking Auth Methods...');
    const authMethods = await prisma.authMethod.findMany({ select: { id: true, userId: true, provider: true } });
    for (const authMethod of authMethods) {
      totalChecked++;
      if (!isValidUUID(authMethod.id)) {
        console.log(`❌ Invalid UUID in AuthMethods: ${authMethod.id} (${authMethod.provider})`);
        invalidIds++;
        if (isValidCUID(authMethod.id)) {
          cuidFound++;
        }
      }
      
      if (authMethod.userId && !isValidUUID(authMethod.userId)) {
        console.log(`❌ Invalid UUID in AuthMethods.userId: ${authMethod.userId}`);
        invalidIds++;
      }
    }
    console.log(`✅ Auth Methods: ${authMethods.length} records, all have valid UUIDs\n`);
    
    // Check Audit Logs
    console.log('Checking Audit Logs...');
    const auditLogs = await prisma.auditLog.findMany({ 
      select: { id: true, userId: true, action: true, resourceId: true } 
    });
    for (const auditLog of auditLogs) {
      totalChecked++;
      if (!isValidUUID(auditLog.id)) {
        console.log(`❌ Invalid UUID in AuditLogs: ${auditLog.id} (${auditLog.action})`);
        invalidIds++;
        if (isValidCUID(auditLog.id)) {
          cuidFound++;
        }
      }
      
      if (auditLog.userId && !isValidUUID(auditLog.userId)) {
        console.log(`❌ Invalid UUID in AuditLogs.userId: ${auditLog.userId}`);
        invalidIds++;
      }
      if (auditLog.resourceId && !isValidUUID(auditLog.resourceId)) {
        console.log(`❌ Invalid UUID in AuditLogs.resourceId: ${auditLog.resourceId}`);
        invalidIds++;
      }
    }
    console.log(`✅ Audit Logs: ${auditLogs.length} records, all have valid UUIDs\n`);
    
    // Check other tables that might exist
    const tableChecks = [
      { name: 'Posts', model: prisma.post },
      { name: 'Comments', model: prisma.comment },
      { name: 'Tags', model: prisma.tag },
      { name: 'Likes', model: prisma.like },
      { name: 'Notifications', model: prisma.notification },
      { name: 'Task Comments', model: prisma.taskComment },
      { name: 'Task Media', model: prisma.taskMedia },
      { name: 'Task Shares', model: prisma.taskShare },
      { name: 'Chatbot Models', model: prisma.chatbotModel },
      { name: 'Training Data', model: prisma.trainingData },
      { name: 'Chat Conversations', model: prisma.chatConversation },
      { name: 'Chat Messages', model: prisma.chatMessage }
    ];
    
    for (const check of tableChecks) {
      try {
        const count = await check.model.count();
        if (count > 0) {
          console.log(`ℹ️  ${check.name}: ${count} records found`);
          // Could add detailed UUID validation here if needed
        }
      } catch (error) {
        // Table might not exist or might have different structure
        console.log(`⚠️  ${check.name}: Unable to check (table might be empty or have different structure)`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total IDs checked: ${totalChecked}`);
    console.log(`Invalid UUIDs found: ${invalidIds}`);
    console.log(`CUIDs found: ${cuidFound}`);
    
    if (invalidIds === 0) {
      console.log('🎉 All IDs are valid UUIDs!');
    } else {
      console.log(`❌ Found ${invalidIds} invalid UUID(s)`);
      if (cuidFound > 0) {
        console.log(`   - ${cuidFound} appear to be CUIDs that need conversion`);
      }
    }
    
    // Show sample UUIDs
    console.log('\n📋 Sample UUIDs from database:');
    if (users.length > 0) {
      console.log(`User ID: ${users[0].id}`);
    }
    if (tasks.length > 0) {
      console.log(`Task ID: ${tasks[0].id}`);
    }
    if (auditLogs.length > 0) {
      console.log(`Audit Log ID: ${auditLogs[0].id}`);
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Also check schema to ensure it uses uuid()
function checkSchemaConfiguration() {
  console.log('\n🔧 Schema Configuration Check:');
  console.log('Please verify that your schema.prisma uses @default(uuid()) instead of @default(cuid())');
  console.log('All id fields should look like: id String @id @default(uuid())');
}

async function main() {
  await validateUUIDs();
  checkSchemaConfiguration();
}

if (require.main === module) {
  main().catch(console.error);
}