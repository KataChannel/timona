"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModule = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const project_resolver_1 = require("./project.resolver");
const project_chat_gateway_1 = require("./project-chat.gateway");
const project_media_service_1 = require("./project-media.service");
const project_media_resolver_1 = require("./project-media.resolver");
const project_analytics_service_1 = require("./project-analytics.service");
const project_analytics_resolver_1 = require("./project-analytics.resolver");
const email_service_1 = require("./email.service");
const calendar_service_1 = require("./calendar.service");
const calendar_resolver_1 = require("./calendar.resolver");
const upload_controller_1 = require("./upload.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const user_service_1 = require("../services/user.service");
const minio_module_1 = require("../minio/minio.module");
let ProjectModule = class ProjectModule {
};
exports.ProjectModule = ProjectModule;
exports.ProjectModule = ProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            minio_module_1.MinioModule,
        ],
        controllers: [upload_controller_1.ProjectUploadController],
        providers: [
            project_service_1.ProjectService,
            project_resolver_1.ProjectResolver,
            project_chat_gateway_1.ProjectChatGateway,
            project_media_service_1.ProjectMediaService,
            project_media_resolver_1.ProjectMediaResolver,
            project_analytics_service_1.ProjectAnalyticsService,
            project_analytics_resolver_1.ProjectAnalyticsResolver,
            email_service_1.EmailService,
            calendar_service_1.CalendarService,
            calendar_resolver_1.CalendarResolver,
            user_service_1.UserService,
        ],
        exports: [
            project_service_1.ProjectService,
            project_chat_gateway_1.ProjectChatGateway,
            project_media_service_1.ProjectMediaService,
            project_analytics_service_1.ProjectAnalyticsService,
            email_service_1.EmailService,
            calendar_service_1.CalendarService,
        ],
    })
], ProjectModule);
//# sourceMappingURL=project.module.js.map