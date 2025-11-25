"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const rbac_seeder_service_1 = require("../security/services/rbac-seeder.service");
async function bootstrap() {
    console.log('🌱 Starting Menu Seeder...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(rbac_seeder_service_1.RbacSeederService);
    try {
        console.log('📋 Seeding RBAC (roles, permissions, and menus)...');
        console.log('✅ Seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding menus:', error);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed-menus.js.map