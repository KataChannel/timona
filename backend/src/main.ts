import 'reflect-metadata';

// Polyfill File API for Node < 20 (fix undici issue)
if (typeof global.File === 'undefined') {
  (global as any).File = class File extends Blob {
    constructor(parts: any[], name: string, options?: any) {
      super(parts, options);
      Object.defineProperty(this, 'name', { value: name });
    }
  };
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { EnvConfigService } from './config/env-config.service';
import { GraphQLValidationPipe } from './common/pipes/graphql-validation.pipe';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as express from 'express';
import { graphqlUploadExpress } from 'graphql-upload-ts';

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Log environment configuration using ConfigService directly
  console.log('🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${configService.get('NODE_ENV', 'development')}`);
  console.log(`   PORT: ${configService.get('PORT', 4000)}`);
  console.log(`   FRONTEND_URL: ${configService.get('FRONTEND_URL', 'http://localhost:3000')}`);
  
  // Configure JSON body parser with larger limit for GraphQL (MUST be BEFORE graphqlUploadExpress)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // IMPORTANT: graphqlUploadExpress MUST be applied AFTER json/urlencoded middleware
  // and BEFORE Apollo Server middleware to work correctly
  app.use('/graphql', graphqlUploadExpress({ 
    maxFileSize: 500000000, // 500MB max file size
    maxFiles: 10 
  }));
  
  // Serve static files for log viewer
  app.use('/logs', express.static(join(__dirname, '../public')));
  
  // Enable CORS with support for multiple origins and IP addresses
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
    // Allow any origin in development, or configure specific IPs in production
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
      // Apollo Client headers
      'apollo-require-preflight',
      'x-apollo-operation-name',
      'x-apollo-tracing',
      // GraphQL Upload headers
      'graphql-upload',
      // Common custom headers
      'x-request-id',
      'x-correlation-id',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight requests for 24 hours
  });

  // Global validation pipe - custom pipe that skips file uploads
  app.useGlobalPipes(
    new GraphQLValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // ✅ Allow extra properties (GraphQL will validate)
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // ✅ Auto-convert types
      },
      exceptionFactory: (errors) => {
        // Log validation errors for debugging
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
    }),
  );

  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = configService.get('PORT', 4000);
  await app.listen(port);
  
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 GraphQL playground available at http://localhost:${port}/graphql`);
}

bootstrap();
