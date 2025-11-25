"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
if (typeof global.File === 'undefined') {
    global.File = class File extends Blob {
        constructor(parts, name, options) {
            super(parts, options);
            Object.defineProperty(this, 'name', { value: name });
        }
    };
}
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
const graphql_validation_pipe_1 = require("./common/pipes/graphql-validation.pipe");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
const express = __importStar(require("express"));
const graphql_upload_ts_1 = require("graphql-upload-ts");
dotenv.config({ path: (0, path_1.join)(__dirname, '../.env.local') });
dotenv.config({ path: (0, path_1.join)(__dirname, '../../.env') });
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    console.log('🔧 Environment Configuration:');
    console.log(`   NODE_ENV: ${configService.get('NODE_ENV', 'development')}`);
    console.log(`   PORT: ${configService.get('PORT', 4000)}`);
    console.log(`   FRONTEND_URL: ${configService.get('FRONTEND_URL', 'http://localhost:3000')}`);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use('/graphql', (0, graphql_upload_ts_1.graphqlUploadExpress)({
        maxFileSize: 500000000,
        maxFiles: 10
    }));
    app.use('/logs', express.static((0, path_1.join)(__dirname, '../public')));
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    const corsOrigins = [
        'http://localhost:3000',
        'http://localhost:12000',
        'http://localhost:13000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:12000',
        'http://127.0.0.1:13000',
        'http://116.118.49.243:12000',
        'http://116.118.49.243:13000',
        'https://shop.rausachtrangia.com',
        'https://app.tazagroup.com',
        'https://app.tazagroup.vn',
        'http://app.tazagroup.vn',
        'https://api.rausachtrangia.com',
        'https://appapi.tazagroup.vn',
        'http://appapi.tazagroup.vn',
        frontendUrl,
        process.env.NODE_ENV === 'development' ? /.*/ : undefined,
    ].filter(Boolean);
    app.enableCors({
        origin: corsOrigins.length > 0 ? corsOrigins : true,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
            'apollo-require-preflight',
            'x-apollo-operation-name',
            'x-apollo-tracing',
            'graphql-upload',
            'x-request-id',
            'x-correlation-id',
        ],
        exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
    });
    app.useGlobalPipes(new graphql_validation_pipe_1.GraphQLValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            console.error('❌ Validation errors:', JSON.stringify(errors, null, 2));
            const messages = errors.map(error => {
                return {
                    field: error.property,
                    errors: Object.values(error.constraints || {}),
                };
            });
            console.error('❌ Formatted errors:', JSON.stringify(messages, null, 2));
            return new (require('@nestjs/common').BadRequestException)(errors);
        },
    }));
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    const port = configService.get('PORT', 4000);
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📊 GraphQL playground available at http://localhost:${port}/graphql`);
}
bootstrap();
//# sourceMappingURL=main.js.map