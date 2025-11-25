import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { join } from 'path';

// Modules
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLResolversModule } from './graphql/graphql.module';
import { GrokModule } from './grok/grok.module';
import { MinioModule } from './minio/minio.module';
import { LoggerModule } from './logger/logger.module';
import { AiTrainingModule } from './ai-training/ai-training.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AiModule } from './ai/ai.module';
import { DataLoaderModule } from './common/data-loaders/data-loader.module';
import { GraphQLPerformanceModule } from './common/graphql-performance/graphql-performance.module';
import { CommonServicesModule } from './common/common-services.module';
import { RealTimeModule } from './realtime/real-time.module';
import { SearchModule } from './search/search.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SecurityModule } from './security/security.module';
import { UnifiedDynamicModule } from './graphql/unified-dynamic.module';
import { KetoAnModule } from './ketoan/ketoan.module';
import { MenuModule } from './menu/menu.module';
import { FileModule } from './graphql/modules/file.module';
import { HRModule } from './graphql/modules/hr.module';
import { ProductModule } from './graphql/modules/product.module';
import { BlogModule } from './graphql/modules/blog.module';
import { ReviewModule } from './graphql/modules/review.module';
import { TestController } from './test.controller';
import { SeedModule } from './seed/seed.module';
import { CallCenterModule } from './callcenter/callcenter.module';
import { LmsModule } from './lms/lms.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { ReleaseHubModule } from './release-hub/release-hub.module';

// Configuration
import { validationSchema } from './config/validation';
import { EnvConfigService } from './config/env-config.service';

// Controllers
import { LogController } from './controllers/log.controller';
import { FileController } from './controllers/file.controller';
import { FilesController } from './controllers/files.controller';
import { ProductNormalizationController } from './api/product-normalization.controller';

// Resolvers
import { AppResolver } from './app.resolver';

// Interceptors
import { GraphQLLoggingInterceptor } from './interceptors/graphql-logging.interceptor';
import { InputSanitizationInterceptor } from './common/interceptors/input-sanitization.interceptor';
import { GraphQLPerformanceInterceptor } from './common/interceptors/graphql-performance.interceptor';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    // Configuration - MUST BE FIRST
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: ['.env.local', '../.env'],
    }),

    // Core Modules - BEFORE GraphQL
    PrismaModule,
    AuthModule,
    
    // GraphQL - AFTER Core Modules
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('NODE_ENV') !== 'production',
        introspection: configService.get('NODE_ENV') !== 'production',
        context: ({ req, res }) => ({ req, res }),
        // Disable Apollo's body parser - let Express handle it (configured in main.ts)
        bodyParserConfig: false,
        // Add Upload scalar type definition and resolver
        typeDefs: `
          scalar Upload
        `,
        resolvers: {
          Upload: GraphQLUpload,
        },
        subscriptions: {
          'graphql-ws': {
            path: '/graphql',
          },
          'subscriptions-transport-ws': {
            path: '/graphql',
          },
        },
        // Security enhancements for GIAI ĐOẠN 1
        validationRules: [
          require('graphql-depth-limit')(10),
        ],
        formatError: (error) => {
          // Log security-related errors
          if (error.message.includes('depth') || error.message.includes('complexity')) {
            console.warn('GraphQL security validation failed:', error.message);
          }
          return error;
        },
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling (global) - TODO: Fix Reflector dependency issue
    // ScheduleModule.forRoot(),

    // Application Modules
    CacheModule,
    RedisModule,
    DataLoaderModule,
    GraphQLPerformanceModule,
    GraphQLResolversModule,
    GrokModule,
    MinioModule,
    LoggerModule,
    // HealthModule, // TODO: Fix TypeOrmHealthIndicator issue with Terminus - using Prisma only
    AiTrainingModule,
    ChatbotModule,
    AiModule,
    CommonServicesModule,
    RealTimeModule,
    SearchModule,
    // MonitoringModule, // TODO: Fix TerminusModule/TypeORM dependency issue
    SecurityModule,
    UnifiedDynamicModule,
    KetoAnModule,
    MenuModule,
    FileModule,
    HRModule,
    ProductModule,
    BlogModule,
    ReviewModule,
    SeedModule,
    CallCenterModule,
    LmsModule,
    ProjectModule,
    EcommerceModule,
    SupportChatModule,
    ReleaseHubModule,
  ],
  controllers: [
    LogController,
    TestController,
    FileController,
    FilesController,
    ProductNormalizationController,
  ],
  providers: [
    EnvConfigService,
    AppResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: InputSanitizationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphQLPerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}
