"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const rbac_seeder_service_1 = require("../security/services/rbac-seeder.service");
async function bootstrap() {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 RBAC SEEDER - Default Roles & Permissions');
    console.log('='.repeat(60) + '\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const rbacSeeder = app.get(rbac_seeder_service_1.RbacSeederService);
    try {
        await rbacSeeder.seedDefaultRolesAndPermissions();
        console.log('\n✅ RBAC seeding completed successfully!\n');
    }
    catch (error) {
        console.error('\n❌ RBAC seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-rbac.js.map