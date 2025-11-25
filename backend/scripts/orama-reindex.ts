#!/usr/bin/env node

/**
 * Orama Search Index Population Script
 * 
 * This script populates the Orama search indexes with existing data from the database.
 * It can be run manually or as part of deployment/migration processes.
 * 
 * Usage:
 *   bun run scripts/orama-reindex.ts
 */

import { PrismaClient } from '@prisma/client';
import { create, insert, save } from '@orama/orama';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

// Schema definitions (same as in orama.service.ts)
const TASK_SCHEMA = {
  id: 'string',
  title: 'string',
  description: 'string',
  status: 'string',
  priority: 'string',
  tags: 'string[]',
  authorId: 'string',
  assigneeId: 'string',
  projectId: 'string',
  teamId: 'string',
  createdAt: 'number',
  updatedAt: 'number',
  dueDate: 'number',
} as const;

const USER_SCHEMA = {
  id: 'string',
  email: 'string',
  name: 'string',
  role: 'string',
  department: 'string',
  skills: 'string[]',
  createdAt: 'number',
} as const;

const AFFILIATE_CAMPAIGN_SCHEMA = {
  id: 'string',
  name: 'string',
  description: 'string',
  status: 'string',
  commissionType: 'string',
  commissionValue: 'number',
  startDate: 'number',
  endDate: 'number',
  createdAt: 'number',
} as const;

const AFFILIATE_LINK_SCHEMA = {
  id: 'string',
  campaignId: 'string',
  userId: 'string',
  code: 'string',
  url: 'string',
  clicks: 'number',
  conversions: 'number',
  createdAt: 'number',
} as const;

const persistPath = process.env.ORAMA_PERSIST_PATH || './data/orama';

async function ensureDirectory() {
  await fs.mkdir(persistPath, { recursive: true });
  console.log(`✓ Ensured persist directory: ${persistPath}`);
}

async function indexTasks() {
  console.log('\n📝 Indexing tasks...');
  
  const taskIndex = await create({ schema: TASK_SCHEMA });
  const tasks = await prisma.task.findMany();
  
  for (const task of tasks) {
    await insert(taskIndex, {
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      status: task.status || '',
      priority: task.priority || '',
      tags: [], // Task model doesn't have tags in schema
      authorId: task.userId || '', // Use userId instead
      assigneeId: '', // Not in schema
      projectId: '', // Not in schema
      teamId: '', // Not in schema
      createdAt: task.createdAt ? new Date(task.createdAt).getTime() : Date.now(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt).getTime() : Date.now(),
      dueDate: task.dueDate ? new Date(task.dueDate).getTime() : 0,
    });
  }
  
  const data = await save(taskIndex);
  const indexPath = path.join(persistPath, 'tasks.json');
  await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
  
  console.log(`✓ Indexed ${tasks.length} tasks`);
  return tasks.length;
}

async function indexUsers() {
  console.log('\n👥 Indexing users...');
  
  const userIndex = await create({ schema: USER_SCHEMA });
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await insert(userIndex, {
      id: user.id,
      email: user.email || '',
      name: user.username || '', // Use username as name
      role: '', // Role not in user model directly
      department: '', // Department not in schema
      skills: [], // Skills not in schema
      createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
    });
  }
  
  const data = await save(userIndex);
  const indexPath = path.join(persistPath, 'users.json');
  await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
  
  console.log(`✓ Indexed ${users.length} users`);
  return users.length;
}

async function indexAffiliateCampaigns() {
  console.log('\n🎯 Indexing affiliate campaigns...');
  
  const campaignIndex = await create({ schema: AFFILIATE_CAMPAIGN_SCHEMA });
  const campaigns = await prisma.affCampaign.findMany();
  
  for (const campaign of campaigns) {
    await insert(campaignIndex, {
      id: campaign.id,
      name: campaign.name || '',
      description: campaign.description || '',
      status: campaign.status || '',
      commissionType: campaign.commissionType || '',
      commissionValue: campaign.commissionRate ? parseFloat(campaign.commissionRate.toString()) : 0, // Use commissionRate
      startDate: campaign.startDate ? new Date(campaign.startDate).getTime() : 0,
      endDate: campaign.endDate ? new Date(campaign.endDate).getTime() : 0,
      createdAt: campaign.createdAt ? new Date(campaign.createdAt).getTime() : Date.now(),
    });
  }
  
  const data = await save(campaignIndex);
  const indexPath = path.join(persistPath, 'affiliate_campaigns.json');
  await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
  
  console.log(`✓ Indexed ${campaigns.length} affiliate campaigns`);
  return campaigns.length;
}

async function indexAffiliateLinks() {
  console.log('\n🔗 Indexing affiliate links...');
  
  const linkIndex = await create({ schema: AFFILIATE_LINK_SCHEMA });
  const links = await prisma.affLink.findMany();
  
  for (const link of links) {
    await insert(linkIndex, {
      id: link.id,
      campaignId: link.campaignId || '',
      userId: link.affiliateId || '', // Use affiliateId as userId
      code: link.trackingCode || '', // Use trackingCode as code
      url: link.originalUrl || '', // Use originalUrl as url
      clicks: link.totalClicks || 0, // Use totalClicks
      conversions: link.totalConversions || 0, // Use totalConversions
      createdAt: link.createdAt ? new Date(link.createdAt).getTime() : Date.now(),
    });
  }
  
  const data = await save(linkIndex);
  const indexPath = path.join(persistPath, 'affiliate_links.json');
  await fs.writeFile(indexPath, JSON.stringify(data), 'utf-8');
  
  console.log(`✓ Indexed ${links.length} affiliate links`);
  return links.length;
}

async function main() {
  console.log('🔍 Orama Search Index Population');
  console.log('================================\n');
  
  const startTime = Date.now();
  
  try {
    await ensureDirectory();
    
    const [taskCount, userCount, campaignCount, linkCount] = await Promise.all([
      indexTasks(),
      indexUsers(),
      indexAffiliateCampaigns(),
      indexAffiliateLinks(),
    ]);
    
    const totalCount = taskCount + userCount + campaignCount + linkCount;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ Reindexing completed successfully!');
    console.log(`   Total documents indexed: ${totalCount}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Persist path: ${persistPath}`);
    
  } catch (error) {
    console.error('\n❌ Reindexing failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
