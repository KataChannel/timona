"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KetoAnModule = void 0;
const common_1 = require("@nestjs/common");
const invoice_export_controller_1 = require("./invoice-export.controller");
const invoice_export_service_1 = require("./invoice-export.service");
const product_normalization_service_1 = require("./product-normalization.service");
const product_normalization_resolver_1 = require("./product-normalization.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_module_1 = require("../auth/auth.module");
const user_service_1 = require("../services/user.service");
let KetoAnModule = class KetoAnModule {
};
exports.KetoAnModule = KetoAnModule;
exports.KetoAnModule = KetoAnModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [invoice_export_controller_1.InvoiceExportController],
        providers: [
            invoice_export_service_1.InvoiceExportService,
            product_normalization_service_1.ProductNormalizationService,
            product_normalization_resolver_1.ProductNormalizationResolver,
            user_service_1.UserService,
        ],
        exports: [invoice_export_service_1.InvoiceExportService, product_normalization_service_1.ProductNormalizationService],
    })
], KetoAnModule);
//# sourceMappingURL=ketoan.module.js.map