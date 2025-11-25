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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceDocumentCategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SourceDocumentCategoryService = class SourceDocumentCategoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        return this.prisma.sourceDocumentCategory.create({
            data: input,
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async findAll() {
        return this.prisma.sourceDocumentCategory.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        sourceDocuments: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.sourceDocumentCategory.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                sourceDocuments: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        sourceDocuments: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, input) {
        await this.findOne(id);
        return this.prisma.sourceDocumentCategory.update({
            where: { id },
            data: input,
            include: {
                parent: true,
                children: true,
            },
        });
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.sourceDocumentCategory.delete({
            where: { id },
        });
    }
    async getTree() {
        return this.prisma.sourceDocumentCategory.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true,
                        _count: {
                            select: {
                                sourceDocuments: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        sourceDocuments: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.SourceDocumentCategoryService = SourceDocumentCategoryService;
exports.SourceDocumentCategoryService = SourceDocumentCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SourceDocumentCategoryService);
//# sourceMappingURL=source-document-category.service.js.map