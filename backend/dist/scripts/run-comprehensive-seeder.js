#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const comprehensive_seeder_service_1 = require("./comprehensive-seeder.service");
const prisma_service_1 = require("../prisma/prisma.service");
async function bootstrap() {
    console.log('🌱 Starting Comprehensive Database Seeding...\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const prisma = app.get(prisma_service_1.PrismaService);
        const seeder = new comprehensive_seeder_service_1.ComprehensiveSeederService(prisma);
        await seeder.seedAll();
        console.log('\n✅ Comprehensive seeding completed successfully!');
        console.log('📧 Admin email: katachanneloffical@gmail.com');
        console.log('🔑 Admin password: Admin@2024');
    }
    catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=run-comprehensive-seeder.js.map