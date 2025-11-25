"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcommerceModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const redis_service_1 = require("../redis/redis.service");
const cart_service_1 = require("../services/cart.service");
const order_service_1 = require("../services/order.service");
const notification_service_1 = require("../services/notification.service");
const push_notification_service_1 = require("../services/push-notification.service");
const cart_resolver_1 = require("../graphql/resolvers/cart.resolver");
const order_resolver_1 = require("../graphql/resolvers/order.resolver");
const notification_resolver_1 = require("../graphql/resolvers/notification.resolver");
const push_notification_resolver_1 = require("../graphql/resolvers/push-notification.resolver");
const real_time_notification_service_1 = require("../realtime/real-time-notification.service");
const advanced_cache_service_1 = require("../common/services/advanced-cache.service");
const performance_metrics_service_1 = require("../common/services/performance-metrics.service");
let EcommerceModule = class EcommerceModule {
};
exports.EcommerceModule = EcommerceModule;
exports.EcommerceModule = EcommerceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        providers: [
            redis_service_1.RedisService,
            advanced_cache_service_1.AdvancedCacheService,
            performance_metrics_service_1.PerformanceMetricsService,
            real_time_notification_service_1.RealTimeNotificationService,
            notification_service_1.NotificationService,
            push_notification_service_1.PushNotificationService,
            cart_service_1.CartService,
            order_service_1.OrderService,
            cart_resolver_1.CartResolver,
            order_resolver_1.OrderResolver,
            notification_resolver_1.NotificationResolver,
            push_notification_resolver_1.PushNotificationResolver,
        ],
        exports: [cart_service_1.CartService, order_service_1.OrderService, notification_service_1.NotificationService, push_notification_service_1.PushNotificationService],
    })
], EcommerceModule);
//# sourceMappingURL=ecommerce.module.js.map