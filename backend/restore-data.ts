import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BackupData {
  users?: any[];
  tasks?: any[];
  auth_methods?: any[];
  audit_logs?: any[];
}

async function loadBackupData(backupPath: string): Promise<BackupData> {
  const data: BackupData = {};
  
  try {
    // Load users
    const usersPath = path.join(backupPath, 'users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      data.users = JSON.parse(usersData);
      console.log(`Loaded ${data.users.length} users`);
    }

    // Load tasks
    const tasksPath = path.join(backupPath, 'tasks.json');
    if (fs.existsSync(tasksPath)) {
      const tasksData = fs.readFileSync(tasksPath, 'utf8');
      data.tasks = JSON.parse(tasksData);
      console.log(`Loaded ${data.tasks.length} tasks`);
    }

    // Load auth methods
    const authMethodsPath = path.join(backupPath, 'auth_methods.json');
    if (fs.existsSync(authMethodsPath)) {
      const authMethodsData = fs.readFileSync(authMethodsPath, 'utf8');
      data.auth_methods = JSON.parse(authMethodsData);
      console.log(`Loaded ${data.auth_methods.length} auth methods`);
    }

    // Load audit logs
    const auditLogsPath = path.join(backupPath, 'audit_logs.json');
    if (fs.existsSync(auditLogsPath)) {
      const auditLogsData = fs.readFileSync(auditLogsPath, 'utf8');
      data.audit_logs = JSON.parse(auditLogsData);
      console.log(`Loaded ${data.audit_logs.length} audit logs`);
    }

  } catch (error) {
    console.error('Error loading backup data:', error);
    throw error;
  }

  return data;
}

function transformUserData(user: any) {
  // Map old schema to new schema
  return {
    id: user.id, // Already UUID format
    email: user.email,
    username: user.username,
    password: user.password,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    roleType: user.role || user.roleType || 'USER', // Map role to roleType
    isActive: user.isActive ?? true,
    isVerified: user.isVerified ?? false,
    isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
    failedLoginAttempts: user.failedLoginAttempts ?? 0,
    lockedUntil: user.lockedUntil ? new Date(user.lockedUntil) : null,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
}

function transformTaskData(task: any) {
  return {
    id: task.id, // Already UUID format
    title: task.title,
    description: task.description,
    category: task.category || 'OTHER',
    priority: task.priority || 'MEDIUM',
    status: task.status || 'PENDING',
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
    userId: task.userId,
    parentId: task.parentId,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt)
  };
}

function transformAuthMethodData(authMethod: any) {
  return {
    id: authMethod.id, // Already UUID format
    userId: authMethod.userId,
    provider: authMethod.provider || 'LOCAL',
    providerId: authMethod.providerId,
    isVerified: authMethod.isVerified ?? false,
    createdAt: new Date(authMethod.createdAt),
    updatedAt: new Date(authMethod.updatedAt)
  };
}

function transformAuditLogData(auditLog: any) {
  return {
    id: auditLog.id, // Already UUID format
    userId: auditLog.userId,
    sessionId: auditLog.sessionId,
    action: auditLog.action,
    resourceType: auditLog.resourceType || 'user', // Default to 'user' if missing
    resourceId: auditLog.resourceId,
    ipAddress: auditLog.ipAddress,
    userAgent: auditLog.userAgent,
    method: auditLog.method,
    endpoint: auditLog.endpoint,
    oldValues: auditLog.oldValues,
    newValues: auditLog.newValues,
    details: auditLog.details,
    success: auditLog.success ?? true,
    errorMessage: auditLog.errorMessage,
    responseTime: auditLog.responseTime,
    requestSize: auditLog.requestSize,
    responseSize: auditLog.responseSize,
    dbQueryTime: auditLog.dbQueryTime,
    dbQueryCount: auditLog.dbQueryCount,
    memoryUsage: auditLog.memoryUsage,
    cpuUsage: auditLog.cpuUsage,
    statusCode: auditLog.statusCode,
    performanceData: auditLog.performanceData,
    correlationId: auditLog.correlationId,
    sessionInfo: auditLog.sessionInfo,
    timestamp: new Date(auditLog.timestamp || auditLog.createdAt),
    createdAt: new Date(auditLog.createdAt)
  };
}

async function restoreData(backupPath: string) {
  console.log(`Starting data restore from: ${backupPath}`);
  
  try {
    // Load backup data
    const data = await loadBackupData(backupPath);
    
    // Clear existing data (be careful!)
    console.log('Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.authMethod.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    
    // Restore users first (other tables depend on users)
    if (data.users && data.users.length > 0) {
      console.log('Restoring users...');
      const transformedUsers = data.users.map(transformUserData);
      
      for (const user of transformedUsers) {
        try {
          await prisma.user.create({
            data: user
          });
        } catch (error: any) {
          console.error(`Error creating user ${user.username}:`, error.message);
        }
      }
      console.log(`✅ Restored ${transformedUsers.length} users`);
    }

    // Restore auth methods
    if (data.auth_methods && data.auth_methods.length > 0) {
      console.log('Restoring auth methods...');
      const transformedAuthMethods = data.auth_methods.map(transformAuthMethodData);
      
      for (const authMethod of transformedAuthMethods) {
        try {
          // Check if user exists
          const userExists = await prisma.user.findUnique({
            where: { id: authMethod.userId }
          });
          
          if (userExists) {
            await prisma.authMethod.create({
              data: authMethod
            });
          } else {
            console.warn(`Skipping auth method for non-existent user: ${authMethod.userId}`);
          }
        } catch (error: any) {
          console.error(`Error creating auth method:`, error.message);
        }
      }
      console.log(`✅ Restored ${transformedAuthMethods.length} auth methods`);
    }

    // Restore tasks
    if (data.tasks && data.tasks.length > 0) {
      console.log('Restoring tasks...');
      const transformedTasks = data.tasks.map(transformTaskData);
      
      // Sort tasks to handle parent-child relationships
      const rootTasks = transformedTasks.filter(t => !t.parentId);
      const childTasks = transformedTasks.filter(t => t.parentId);
      
      // Create root tasks first
      for (const task of rootTasks) {
        try {
          // Check if user exists
          const userExists = await prisma.user.findUnique({
            where: { id: task.userId }
          });
          
          if (userExists) {
            await prisma.task.create({
              data: task
            });
          } else {
            console.warn(`Skipping task for non-existent user: ${task.userId}`);
          }
        } catch (error: any) {
          console.error(`Error creating root task ${task.title}:`, error.message);
        }
      }
      
      // Create child tasks
      for (const task of childTasks) {
        try {
          // Check if user and parent exist
          const userExists = await prisma.user.findUnique({
            where: { id: task.userId }
          });
          const parentExists = await prisma.task.findUnique({
            where: { id: task.parentId! }
          });
          
          if (userExists && parentExists) {
            await prisma.task.create({
              data: task
            });
          } else {
            console.warn(`Skipping child task - user exists: ${!!userExists}, parent exists: ${!!parentExists}`);
          }
        } catch (error: any) {
          console.error(`Error creating child task ${task.title}:`, error.message);
        }
      }
      console.log(`✅ Restored ${transformedTasks.length} tasks`);
    }

    // Restore audit logs last
    if (data.audit_logs && data.audit_logs.length > 0) {
      console.log('Restoring audit logs...');
      const transformedAuditLogs = data.audit_logs.map(transformAuditLogData);
      
      for (const auditLog of transformedAuditLogs) {
        try {
          // Check if user exists (if userId is provided)
          if (auditLog.userId) {
            const userExists = await prisma.user.findUnique({
              where: { id: auditLog.userId }
            });
            
            if (!userExists) {
              auditLog.userId = null; // Set to null if user doesn't exist
            }
          }
          
          await prisma.auditLog.create({
            data: auditLog
          });
        } catch (error: any) {
          console.error(`Error creating audit log:`, error.message);
        }
      }
      console.log(`✅ Restored ${transformedAuditLogs.length} audit logs`);
    }

    console.log('🎉 Data restore completed successfully!');
    
    // Print summary
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.authMethod.count(),
      prisma.auditLog.count()
    ]);
    
    console.log('\n📊 Database Summary:');
    console.log(`Users: ${counts[0]}`);
    console.log(`Tasks: ${counts[1]}`);
    console.log(`Auth Methods: ${counts[2]}`);
    console.log(`Audit Logs: ${counts[3]}`);

  } catch (error) {
    console.error('❌ Error during data restore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const backupPath = process.argv[2];
  
  if (!backupPath) {
    console.error('Usage: bun run restore-data.ts <backup-path>');
    process.exit(1);
  }
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup path does not exist: ${backupPath}`);
    process.exit(1);
  }
  
  console.log('⚠️  WARNING: This will delete all existing data and restore from backup!');
  console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
  
  // Wait 5 seconds before proceeding
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await restoreData(backupPath);
}

if (require.main === module) {
  main().catch(console.error);
}

export { restoreData, loadBackupData };