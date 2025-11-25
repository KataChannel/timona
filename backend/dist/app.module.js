"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const GraphQLUpload_mjs_1 = __importDefault(require("graphql-upload/GraphQLUpload.mjs"));
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const cache_module_1 = require("./cache/cache.module");
const redis_module_1 = require("./redis/redis.module");
const auth_module_1 = require("./auth/auth.module");
const graphql_module_1 = require("./graphql/graphql.module");
const grok_module_1 = require("./grok/grok.module");
const minio_module_1 = require("./minio/minio.module");
const logger_module_1 = require("./logger/logger.module");
const ai_training_module_1 = require("./ai-training/ai-training.module");
const chatbot_module_1 = require("./chatbot/chatbot.module");
const ai_module_1 = require("./ai/ai.module");
const data_loader_module_1 = require("./common/data-loaders/data-loader.module");
const graphql_performance_module_1 = require("./common/graphql-performance/graphql-performance.module");
const common_services_module_1 = require("./common/common-services.module");
const real_time_module_1 = require("./realtime/real-time.module");
const search_module_1 = require("./search/search.module");
const security_module_1 = require("./security/security.module");
const unified_dynamic_module_1 = require("./graphql/unified-dynamic.module");
const ketoan_module_1 = require("./ketoan/ketoan.module");
const menu_module_1 = require("./menu/menu.module");
const file_module_1 = require("./graphql/modules/file.module");
const hr_module_1 = require("./graphql/modules/hr.module");
const product_module_1 = require("./graphql/modules/product.module");
const blog_module_1 = require("./graphql/modules/blog.module");
const review_module_1 = require("./graphql/modules/review.module");
const test_controller_1 = require("./test.controller");
const seed_module_1 = require("./seed/seed.module");
const callcenter_module_1 = require("./callcenter/callcenter.module");
const lms_module_1 = require("./lms/lms.module");
const ecommerce_module_1 = require("./ecommerce/ecommerce.module");
const support_chat_module_1 = require("./support-chat/support-chat.module");
const release_hub_module_1 = require("./release-hub/release-hub.module");
const validation_1 = require("./config/validation");
const env_config_service_1 = require("./config/env-config.service");
const log_controller_1 = require("./controllers/log.controller");
const file_controller_1 = require("./controllers/file.controller");
const files_controller_1 = require("./controllers/files.controller");
const product_normalization_controller_1 = require("./api/product-normalization.controller");
const app_resolver_1 = require("./app.resolver");
const graphql_logging_interceptor_1 = require("./interceptors/graphql-logging.interceptor");
const input_sanitization_interceptor_1 = require("./common/interceptors/input-sanitization.interceptor");
const graphql_performance_interceptor_1 = require("./common/interceptors/graphql-performance.interceptor");
const performance_interceptor_1 = require("./interceptors/performance.interceptor");
const project_module_1 = require("./project/project.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: validation_1.validationSchema,
                envFilePath: ['.env.local', '../.env'],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            graphql_1.GraphQLModule.forRootAsync({
                driver: apollo_1.ApolloDriver,
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                    sortSchema: true,
                    playground: configService.get('NODE_ENV') !== 'production',
                    introspection: configService.get('NODE_ENV') !== 'production',
                    context: ({ req, res }) => ({ req, res }),
                    bodyParserConfig: false,
                    typeDefs: `
          scalar Upload
        `,
                    resolvers: {
                        Upload: GraphQLUpload_mjs_1.default,
                    },
                    subscriptions: {
                        'graphql-ws': {
                            path: '/graphql',
                        },
                        'subscriptions-transport-ws': {
                            path: '/graphql',
                        },
                    },
                    validationRules: [
                        require('graphql-depth-limit')(10),
                    ],
                    formatError: (error) => {
                        if (error.message.includes('depth') || error.message.includes('complexity')) {
                            console.warn('GraphQL security validation failed:', error.message);
                        }
                        return error;
                    },
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            cache_module_1.CacheModule,
            redis_module_1.RedisModule,
            data_loader_module_1.DataLoaderModule,
            graphql_performance_module_1.GraphQLPerformanceModule,
            graphql_module_1.GraphQLResolversModule,
            grok_module_1.GrokModule,
            minio_module_1.MinioModule,
            logger_module_1.LoggerModule,
            ai_training_module_1.AiTrainingModule,
            chatbot_module_1.ChatbotModule,
            ai_module_1.AiModule,
            common_services_module_1.CommonServicesModule,
            real_time_module_1.RealTimeModule,
            search_module_1.SearchModule,
            security_module_1.SecurityModule,
            unified_dynamic_module_1.UnifiedDynamicModule,
            ketoan_module_1.KetoAnModule,
            menu_module_1.MenuModule,
            file_module_1.FileModule,
            hr_module_1.HRModule,
            product_module_1.ProductModule,
            blog_module_1.BlogModule,
            review_module_1.ReviewModule,
            seed_module_1.SeedModule,
            callcenter_module_1.CallCenterModule,
            lms_module_1.LmsModule,
            project_module_1.ProjectModule,
            ecommerce_module_1.EcommerceModule,
            support_chat_module_1.SupportChatModule,
            release_hub_module_1.ReleaseHubModule,
        ],
        controllers: [
            log_controller_1.LogController,
            test_controller_1.TestController,
            file_controller_1.FileController,
            files_controller_1.FilesController,
            product_normalization_controller_1.ProductNormalizationController,
        ],
        providers: [
            env_config_service_1.EnvConfigService,
            app_resolver_1.AppResolver,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: graphql_logging_interceptor_1.GraphQLLoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: input_sanitization_interceptor_1.InputSanitizationInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: graphql_performance_interceptor_1.GraphQLPerformanceInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: performance_interceptor_1.PerformanceInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map