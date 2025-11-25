"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductNormalizationController = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ProductNormalizationController = class ProductNormalizationController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async normalizeProducts(dto) {
        try {
            const { dryRun = false, limit = 10, threshold, force = false } = dto;
            const scriptPath = (0, path_1.join)(process.cwd(), 'scripts', 'updateten2.js');
            let command = `node ${scriptPath}`;
            if (dryRun) {
                command += ' --dry-run';
            }
            if (limit > 0) {
                command += ` --limit=${limit}`;
            }
            if (threshold) {
                command += ` --threshold=${threshold}`;
            }
            if (force) {
                command += ' --force';
            }
            const { stdout, stderr } = await execAsync(command, {
                cwd: process.cwd(),
                maxBuffer: 10 * 1024 * 1024,
            });
            const stats = await this.getStats();
            return {
                success: true,
                message: dryRun
                    ? `Preview completed for ${limit || 'all'} products`
                    : `Successfully normalized ${limit || 'all'} products`,
                output: stdout,
                stats,
            };
        }
        catch (error) {
            console.error('Normalization error:', error);
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to normalize products',
                error: error instanceof Error ? error.message : 'Unknown error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats() {
        try {
            const [total, normalized, pending] = await Promise.all([
                this.prisma.ext_sanphamhoadon.count({
                    where: { ten: { not: null } },
                }),
                this.prisma.ext_sanphamhoadon.count({
                    where: { ten2: { not: null } },
                }),
                this.prisma.ext_sanphamhoadon.count({
                    where: {
                        ten: { not: null },
                        ten2: null,
                    },
                }),
            ]);
            return {
                total,
                normalized,
                pending,
            };
        }
        catch (error) {
            console.error('Error getting stats:', error);
            return {
                total: 0,
                normalized: 0,
                pending: 0,
            };
        }
    }
};
exports.ProductNormalizationController = ProductNormalizationController;
__decorate([
    (0, common_1.Post)('normalize-products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductNormalizationController.prototype, "normalizeProducts", null);
exports.ProductNormalizationController = ProductNormalizationController = __decorate([
    (0, common_1.Controller)('api/ketoan'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductNormalizationController);
//# sourceMappingURL=product-normalization.controller.js.map