#!/usr/bin/env bun

/**
 * Environment Variables Checker Script
 * Usage: bun check-env.ts
 */

import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

// Load environment variables from multiple sources
const envFiles = [
  '.env.local',
  '../.env',
];

console.log('🔍 Checking Environment Variables...\n');

// Load env files
envFiles.forEach(file => {
  const path = join(__dirname, file);
  if (existsSync(path)) {
    dotenv.config({ path });
    console.log(`✅ Loaded: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

console.log('\n📋 Environment Variables Status:\n');

// Required variables
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
];

// Optional variables with defaults
const optionalVars = [
  'FRONTEND_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'JWT_EXPIRES_IN',
  'MINIO_ENDPOINT',
  'MINIO_PORT',
  'MINIO_USE_SSL',
  'MINIO_BUCKET_NAME',
];

let hasErrors = false;

// Check required variables
console.log('🔥 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
      ? '***HIDDEN***'
      : varName === 'DATABASE_URL' 
        ? value.replace(/:[^:@]*@/, ':***@')
        : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    hasErrors = true;
  }
});

console.log('\n⚙️  Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes('PASSWORD') ? '***HIDDEN***' : value;
    console.log(`   ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`   ⚠️  ${varName}: Using default`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Some required environment variables are missing!');
  console.log('Please check your .env files and set the missing variables.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
  console.log('Ready to start the application.');
}
