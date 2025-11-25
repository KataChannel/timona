import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacSeederService } from '../security/services/rbac-seeder.service';

async function bootstrap() {
  console.log('🌱 Starting Menu Seeder...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(RbacSeederService);

  try {
    console.log('📋 Seeding RBAC (roles, permissions, and menus)...');
    // await seeder.seedDefaultRolesAndPermissions();
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding menus:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
