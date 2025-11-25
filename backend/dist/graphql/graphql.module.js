"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLResolversModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const user_resolver_1 = require("./resolvers/user.resolver");
const post_resolver_1 = require("./resolvers/post.resolver");
const comment_resolver_1 = require("./resolvers/comment.resolver");
const grok_resolver_1 = require("./resolvers/grok.resolver");
const task_resolver_1 = require("./resolvers/task.resolver");
const page_resolver_1 = require("./resolvers/page.resolver");
const invoice_resolver_1 = require("./resolvers/invoice.resolver");
const rbac_resolver_1 = require("./resolvers/rbac.resolver");
const rbac_resolver_2 = require("./rbac/rbac.resolver");
const orama_search_resolver_1 = require("./resolvers/orama-search.resolver");
const universal_query_resolver_1 = require("./resolvers/universal-query.resolver");
const ext_models_resolver_1 = require("./resolvers/ext-models.resolver");
const custom_template_resolver_1 = require("./resolvers/custom-template.resolver");
const website_setting_resolver_1 = require("./resolvers/website-setting.resolver");
const menu_public_resolver_1 = require("./resolvers/menu-public.resolver");
const universal_dynamic_resolver_1 = require("./resolvers/universal-dynamic.resolver");
const dynamic_graphql_engine_1 = require("./core/dynamic-graphql.engine");
const data_import_export_resolver_1 = require("./resolvers/data-import-export.resolver");
const invoice_controller_1 = require("../controllers/invoice.controller");
const invoice_import_controller_1 = require("../controllers/invoice-import.controller");
const category_import_export_controller_1 = require("../controllers/category-import-export.controller");
const product_import_export_controller_1 = require("../controllers/product-import-export.controller");
const affiliate_controller_1 = require("../controllers/affiliate.controller");
const tracking_controller_1 = require("../controllers/tracking.controller");
const user_service_1 = require("../services/user.service");
const post_service_1 = require("../services/post.service");
const comment_service_1 = require("../services/comment.service");
const task_service_1 = require("../services/task.service");
const task_share_service_1 = require("../services/task-share.service");
const task_comment_service_1 = require("../services/task-comment.service");
const task_media_service_1 = require("../services/task-media.service");
const otp_service_1 = require("../services/otp.service");
const pubsub_service_1 = require("../services/pubsub.service");
const page_service_1 = require("../services/page.service");
const invoice_service_1 = require("../services/invoice.service");
const invoice_import_service_1 = require("../services/invoice-import.service");
const category_import_export_service_1 = require("../services/category-import-export.service");
const product_import_export_service_1 = require("../services/product-import-export.service");
const backend_config_service_1 = require("../services/backend-config.service");
const rbac_service_1 = require("../services/rbac.service");
const rbac_service_2 = require("../common/services/rbac.service");
const affiliate_service_1 = require("../services/affiliate.service");
const affiliate_tracking_service_1 = require("../services/affiliate-tracking.service");
const affiliate_payment_service_1 = require("../services/affiliate-payment.service");
const affiliate_conversion_service_1 = require("../services/affiliate-conversion.service");
const custom_template_service_1 = require("../services/custom-template.service");
const dynamic_query_generator_service_1 = require("./services/dynamic-query-generator.service");
const data_import_service_1 = require("../services/data-import.service");
const image_upload_service_1 = require("../services/image-upload.service");
const schema_inspector_service_1 = require("../services/schema-inspector.service");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const grok_module_1 = require("../grok/grok.module");
const minio_module_1 = require("../minio/minio.module");
const search_module_1 = require("../search/search.module");
const menu_module_1 = require("../menu/menu.module");
const affiliate_resolver_1 = require("./resolvers/affiliate.resolver");
let GraphQLResolversModule = class GraphQLResolversModule {
};
exports.GraphQLResolversModule = GraphQLResolversModule;
exports.GraphQLResolversModule = GraphQLResolversModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            grok_module_1.GrokModule,
            minio_module_1.MinioModule,
            search_module_1.SearchModule,
            menu_module_1.MenuModule,
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [
            invoice_controller_1.InvoiceController,
            invoice_import_controller_1.InvoiceImportController,
            category_import_export_controller_1.CategoryImportExportController,
            product_import_export_controller_1.ProductImportExportController,
            affiliate_controller_1.AffiliateController,
            tracking_controller_1.TrackingController,
        ],
        providers: [
            dynamic_graphql_engine_1.DynamicGraphQLEngine,
            universal_dynamic_resolver_1.UniversalDynamicResolver,
            data_import_export_resolver_1.DataImportExportResolver,
            data_import_export_resolver_1.ImageUploadResolver,
            user_resolver_1.UserResolver,
            post_resolver_1.PostResolver,
            comment_resolver_1.CommentResolver,
            grok_resolver_1.GrokResolver,
            task_resolver_1.TaskResolver,
            page_resolver_1.PageResolver,
            invoice_resolver_1.InvoiceResolver,
            rbac_resolver_1.PermissionResolver,
            rbac_resolver_1.RoleResolver,
            rbac_resolver_1.UserRbacResolver,
            rbac_resolver_2.RBACResolver,
            affiliate_resolver_1.AffiliateUserResolver,
            affiliate_resolver_1.AffiliateCampaignResolver,
            affiliate_resolver_1.AffiliateTrackingResolver,
            affiliate_resolver_1.AffiliatePaymentResolver,
            affiliate_resolver_1.AffiliateConversionResolver,
            orama_search_resolver_1.OramaSearchResolver,
            universal_query_resolver_1.UniversalQueryResolver,
            ext_models_resolver_1.ExtModelsResolver,
            custom_template_resolver_1.CustomTemplateResolver,
            website_setting_resolver_1.WebsiteSettingResolver,
            menu_public_resolver_1.MenuPublicResolver,
            user_service_1.UserService,
            post_service_1.PostService,
            comment_service_1.CommentService,
            task_service_1.TaskService,
            task_share_service_1.TaskShareService,
            task_comment_service_1.TaskCommentService,
            task_media_service_1.TaskMediaService,
            otp_service_1.OtpService,
            pubsub_service_1.PubSubService,
            page_service_1.PageService,
            invoice_service_1.InvoiceService,
            invoice_import_service_1.InvoiceImportService,
            category_import_export_service_1.CategoryImportExportService,
            product_import_export_service_1.ProductImportExportService,
            backend_config_service_1.BackendConfigService,
            rbac_service_1.RbacService,
            rbac_service_2.RBACService,
            custom_template_service_1.CustomTemplateService,
            affiliate_service_1.AffiliateUserService,
            affiliate_service_1.AffiliateCampaignService,
            affiliate_tracking_service_1.AffiliateTrackingService,
            affiliate_payment_service_1.AffiliatePaymentService,
            affiliate_conversion_service_1.AffiliateConversionService,
            data_import_service_1.DataImportService,
            image_upload_service_1.ImageUploadService,
            schema_inspector_service_1.SchemaInspectorService,
            dynamic_query_generator_service_1.DynamicQueryGeneratorService,
        ],
        exports: [
            user_service_1.UserService,
            post_service_1.PostService,
            comment_service_1.CommentService,
            task_service_1.TaskService,
            task_share_service_1.TaskShareService,
            task_comment_service_1.TaskCommentService,
            task_media_service_1.TaskMediaService,
            pubsub_service_1.PubSubService,
            page_service_1.PageService,
            invoice_service_1.InvoiceService,
            invoice_import_service_1.InvoiceImportService,
            category_import_export_service_1.CategoryImportExportService,
            product_import_export_service_1.ProductImportExportService,
            backend_config_service_1.BackendConfigService,
            rbac_service_1.RbacService,
            custom_template_service_1.CustomTemplateService,
            affiliate_service_1.AffiliateUserService,
            affiliate_service_1.AffiliateCampaignService,
            affiliate_tracking_service_1.AffiliateTrackingService,
            affiliate_payment_service_1.AffiliatePaymentService,
            affiliate_conversion_service_1.AffiliateConversionService,
        ],
    })
], GraphQLResolversModule);
//# sourceMappingURL=graphql.module.js.map