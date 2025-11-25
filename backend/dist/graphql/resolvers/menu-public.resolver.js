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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MenuPublicResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuPublicResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MenuPublicResolver = MenuPublicResolver_1 = class MenuPublicResolver {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MenuPublicResolver_1.name);
        this.logger.log('🌐 Public Menu Resolver ready');
    }
    async publicMenus(type, isActive, isVisible, orderBy, skip, take, includeChildren) {
        try {
            const where = {};
            if (type)
                where.type = type;
            if (typeof isActive === 'boolean')
                where.isActive = isActive;
            if (typeof isVisible === 'boolean')
                where.isVisible = isVisible;
            const include = includeChildren ? {
                children: {
                    where: {
                        isActive: true,
                        isVisible: true,
                    },
                    orderBy: orderBy || { order: client_1.Prisma.SortOrder.asc },
                    include: {
                        children: {
                            where: {
                                isActive: true,
                                isVisible: true,
                            },
                            orderBy: { order: client_1.Prisma.SortOrder.asc },
                        }
                    }
                }
            } : undefined;
            const menus = await this.prisma.menu.findMany({
                where,
                orderBy: orderBy || { order: client_1.Prisma.SortOrder.asc },
                skip,
                take,
                include,
            });
            this.logger.debug(`✅ Fetched ${menus.length} public menus (type: ${type || 'all'})`);
            return menus;
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch public menus: ${error.message}`, error.stack);
            throw error;
        }
    }
    async publicMenuById(id, includeChildren) {
        try {
            const include = includeChildren ? {
                children: {
                    where: {
                        isActive: true,
                        isVisible: true,
                    },
                    orderBy: { order: client_1.Prisma.SortOrder.asc },
                    include: {
                        children: {
                            where: {
                                isActive: true,
                                isVisible: true,
                            },
                            orderBy: { order: client_1.Prisma.SortOrder.asc },
                        }
                    }
                }
            } : undefined;
            const menu = await this.prisma.menu.findUnique({
                where: { id },
                include,
            });
            if (!menu) {
                this.logger.debug(`⚠️ Menu not found: ${id}`);
                return null;
            }
            this.logger.debug(`✅ Fetched public menu: ${id}`);
            return menu;
        }
        catch (error) {
            this.logger.error(`❌ Failed to fetch public menu by ID: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MenuPublicResolver = MenuPublicResolver;
__decorate([
    (0, graphql_1.Query)(() => [graphql_type_json_1.default], {
        name: 'publicMenus',
        description: 'Get public menu items (no authentication required)',
    }),
    __param(0, (0, graphql_1.Args)('type', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('isActive', { type: () => Boolean, nullable: true })),
    __param(2, (0, graphql_1.Args)('isVisible', { type: () => Boolean, nullable: true })),
    __param(3, (0, graphql_1.Args)('orderBy', { type: () => graphql_type_json_1.default, nullable: true })),
    __param(4, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true })),
    __param(5, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true })),
    __param(6, (0, graphql_1.Args)('includeChildren', { type: () => Boolean, nullable: true, defaultValue: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Boolean, Object, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], MenuPublicResolver.prototype, "publicMenus", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, {
        name: 'publicMenuById',
        description: 'Get a specific public menu item by ID (no authentication required)',
        nullable: true,
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __param(1, (0, graphql_1.Args)('includeChildren', { type: () => Boolean, nullable: true, defaultValue: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], MenuPublicResolver.prototype, "publicMenuById", null);
exports.MenuPublicResolver = MenuPublicResolver = MenuPublicResolver_1 = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuPublicResolver);
//# sourceMappingURL=menu-public.resolver.js.map