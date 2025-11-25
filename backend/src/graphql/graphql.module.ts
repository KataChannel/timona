import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { UserResolver } from './resolvers/user.resolver';
import { PostResolver } from './resolvers/post.resolver';
import { CommentResolver } from './resolvers/comment.resolver';
import { GrokResolver } from './resolvers/grok.resolver';
import { TaskResolver } from './resolvers/task.resolver';
import { PageResolver } from './resolvers/page.resolver';
import { InvoiceResolver } from './resolvers/invoice.resolver';
import { PermissionResolver, RoleResolver, UserRbacResolver } from './resolvers/rbac.resolver';
import { RBACResolver } from './rbac/rbac.resolver';
import { OramaSearchResolver } from './resolvers/orama-search.resolver';
import { UniversalQueryResolver } from './resolvers/universal-query.resolver';
import { ExtModelsResolver } from './resolvers/ext-models.resolver';
import { CustomTemplateResolver } from './resolvers/custom-template.resolver';
import { WebsiteSettingResolver } from './resolvers/website-setting.resolver';
import { MenuPublicResolver } from './resolvers/menu-public.resolver';

// 🚀 NEW: Universal Dynamic GraphQL Resolver
import { UniversalDynamicResolver } from './resolvers/universal-dynamic.resolver';
import { DynamicGraphQLEngine } from './core/dynamic-graphql.engine';

// 🚀 NEW: Data Import/Export and Image Upload Resolvers
import { DataImportExportResolver, ImageUploadResolver } from './resolvers/data-import-export.resolver';

import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceImportController } from '../controllers/invoice-import.controller';
import { CategoryImportExportController } from '../controllers/category-import-export.controller';
import { ProductImportExportController } from '../controllers/product-import-export.controller';
import { AffiliateController } from '../controllers/affiliate.controller';
import { TrackingController } from '../controllers/tracking.controller';

import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { TaskService } from '../services/task.service';
import { TaskShareService } from '../services/task-share.service';
import { TaskCommentService } from '../services/task-comment.service';
import { TaskMediaService } from '../services/task-media.service';
// NotificationService moved to EcommerceModule
import { OtpService } from '../services/otp.service';
import { PubSubService } from '../services/pubsub.service';
import { PageService } from '../services/page.service';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceImportService } from '../services/invoice-import.service';
import { CategoryImportExportService } from '../services/category-import-export.service';
import { ProductImportExportService } from '../services/product-import-export.service';
import { BackendConfigService } from '../services/backend-config.service';
import { RbacService } from '../services/rbac.service';
import { RBACService } from '../common/services/rbac.service';
import { AffiliateUserService, AffiliateCampaignService } from '../services/affiliate.service';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';
import { AffiliatePaymentService } from '../services/affiliate-payment.service';
import { AffiliateConversionService } from '../services/affiliate-conversion.service';
import { CustomTemplateService } from '../services/custom-template.service';
import { DynamicQueryGeneratorService } from './services/dynamic-query-generator.service';

// 🚀 NEW: Data Import/Export and Image Upload Services
import { DataImportService } from '../services/data-import.service';
import { ImageUploadService } from '../services/image-upload.service';
import { SchemaInspectorService } from '../services/schema-inspector.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GrokModule } from '../grok/grok.module';
import { MinioModule } from '../minio/minio.module';
import { SearchModule } from '../search/search.module';
import { MenuModule } from '../menu/menu.module';
import { AffiliateUserResolver, AffiliateCampaignResolver, AffiliateTrackingResolver, AffiliatePaymentResolver, AffiliateConversionResolver } from './resolvers/affiliate.resolver';
// JSON scalar handled by graphql-type-json directly

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GrokModule,
    MinioModule,
    SearchModule,
    MenuModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [
    InvoiceController,
    InvoiceImportController,
    CategoryImportExportController,
    ProductImportExportController,
    AffiliateController,
    TrackingController,
  ],
  providers: [
    // Scalars handled by graphql-type-json directly
    
    // 🚀 NEW: Universal Dynamic GraphQL System
    DynamicGraphQLEngine,
    UniversalDynamicResolver,
    
    // 🚀 NEW: Data Import/Export and Image Upload
    DataImportExportResolver,
    ImageUploadResolver,
    
    // Resolvers
    UserResolver,
    PostResolver,
    CommentResolver,
    GrokResolver,
    TaskResolver,
    PageResolver,
    InvoiceResolver,
    // RBAC resolvers
    PermissionResolver,
    RoleResolver,
    UserRbacResolver,
    RBACResolver,
    
    // Affiliate resolvers
    AffiliateUserResolver,
    AffiliateCampaignResolver,
    AffiliateTrackingResolver,
    AffiliatePaymentResolver,
    AffiliateConversionResolver,
    
    // Search resolver
    OramaSearchResolver,
    
    // Universal Dynamic Query resolver
    UniversalQueryResolver,
    
    // External models resolver
    ExtModelsResolver,
    
    // Custom templates resolver
    CustomTemplateResolver,
    
    // Website settings resolver
    WebsiteSettingResolver,
    
    // Menu public resolver (MenuResolver được import từ MenuModule)
    MenuPublicResolver,
    
    // Services
    UserService,
    PostService,
    CommentService,
    TaskService,
    TaskShareService,
    TaskCommentService,
    TaskMediaService,
    // NotificationService moved to EcommerceModule
    OtpService,
    PubSubService,
    PageService,
    InvoiceService,
    InvoiceImportService,
    CategoryImportExportService,
    ProductImportExportService,
    BackendConfigService,
    RbacService,
    RBACService,
    
    // Custom template service
    CustomTemplateService,
    
    // Affiliate services
    AffiliateUserService,
    AffiliateCampaignService,
    AffiliateTrackingService,
    AffiliatePaymentService,
    AffiliateConversionService,
    
    // 🚀 NEW: Data Import/Export and Image Upload Services
    DataImportService,
    ImageUploadService,
    SchemaInspectorService,
    
    // Dynamic Query service
    DynamicQueryGeneratorService,
  ],
  exports: [
    UserService,
    PostService,
    CommentService,
    TaskService,
    TaskShareService,
    TaskCommentService,
    TaskMediaService,
    // NotificationService exported from EcommerceModule
    PubSubService,
    PageService,
    InvoiceService,
    InvoiceImportService,
    CategoryImportExportService,
    ProductImportExportService,
    BackendConfigService,
    RbacService,
    
    // Custom template service
    CustomTemplateService,
    
    // Affiliate services
    AffiliateUserService,
    AffiliateCampaignService,
    AffiliateTrackingService,
    AffiliatePaymentService,
    AffiliateConversionService,
  ],
})
export class GraphQLResolversModule {}

