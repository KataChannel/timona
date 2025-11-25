"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeModule = void 0;
const common_1 = require("@nestjs/common");
const common_services_module_1 = require("../common/common-services.module");
const real_time_gateway_1 = require("./real-time.gateway");
const presence_service_1 = require("./presence.service");
const collaboration_service_1 = require("./collaboration.service");
const real_time_notification_service_1 = require("./real-time-notification.service");
let RealTimeModule = class RealTimeModule {
};
exports.RealTimeModule = RealTimeModule;
exports.RealTimeModule = RealTimeModule = __decorate([
    (0, common_1.Module)({
        imports: [common_services_module_1.CommonServicesModule],
        providers: [
            real_time_gateway_1.RealTimeGateway,
            presence_service_1.PresenceService,
            collaboration_service_1.CollaborationService,
            real_time_notification_service_1.RealTimeNotificationService,
        ],
        exports: [
            presence_service_1.PresenceService,
            collaboration_service_1.CollaborationService,
            real_time_notification_service_1.RealTimeNotificationService,
        ],
    })
], RealTimeModule);
//# sourceMappingURL=real-time.module.js.map