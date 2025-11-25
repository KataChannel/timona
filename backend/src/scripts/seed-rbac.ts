import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RbacSeederService } from '../security/services/rbac-seeder.service';

async function bootstrap() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 RBAC SEEDER - Default Roles & Permissions');
  console.log('='.repeat(60) + '\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const rbacSeeder = app.get(RbacSeederService);

  try {
    await rbacSeeder.seedDefaultRolesAndPermissions();
    console.log('\n✅ RBAC seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ RBAC seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
