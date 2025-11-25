#!/usr/bin/env ts-node
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ComprehensiveSeederService } from './comprehensive-seeder.service';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  console.log('🌱 Starting Comprehensive Database Seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);
    const seeder = new ComprehensiveSeederService(prisma);

    await seeder.seedAll();

    console.log('\n✅ Comprehensive seeding completed successfully!');
    console.log('📧 Admin email: katachanneloffical@gmail.com');
    console.log('🔑 Admin password: Admin@2024');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
