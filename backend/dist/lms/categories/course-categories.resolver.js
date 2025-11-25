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
exports.CourseCategoriesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const course_categories_service_1 = require("./course-categories.service");
const course_category_entity_1 = require("./entities/course-category.entity");
const create_course_category_input_1 = require("./dto/create-course-category.input");
const update_course_category_input_1 = require("./dto/update-course-category.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let CourseCategoriesResolver = class CourseCategoriesResolver {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    createCategory(createCourseCategoryInput) {
        return this.categoriesService.create(createCourseCategoryInput);
    }
    findAllCategories() {
        return this.categoriesService.findAll();
    }
    findCategoryTree() {
        return this.categoriesService.findTree();
    }
    findOneCategory(id) {
        return this.categoriesService.findOne(id);
    }
    updateCategory(updateCourseCategoryInput) {
        return this.categoriesService.update(updateCourseCategoryInput.id, updateCourseCategoryInput);
    }
    async removeCategory(id) {
        const result = await this.categoriesService.remove(id);
        return result.success;
    }
};
exports.CourseCategoriesResolver = CourseCategoriesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => course_category_entity_1.CourseCategory, { name: 'createCourseCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('createCourseCategoryInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_course_category_input_1.CreateCourseCategoryInput]),
    __metadata("design:returntype", void 0)
], CourseCategoriesResolver.prototype, "createCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [course_category_entity_1.CourseCategory], { name: 'courseCategories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseCategoriesResolver.prototype, "findAllCategories", null);
__decorate([
    (0, graphql_1.Query)(() => [course_category_entity_1.CourseCategory], { name: 'courseCategoryTree' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourseCategoriesResolver.prototype, "findCategoryTree", null);
__decorate([
    (0, graphql_1.Query)(() => course_category_entity_1.CourseCategory, { name: 'courseCategory' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourseCategoriesResolver.prototype, "findOneCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_category_entity_1.CourseCategory, { name: 'updateCourseCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('updateCourseCategoryInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_course_category_input_1.UpdateCourseCategoryInput]),
    __metadata("design:returntype", void 0)
], CourseCategoriesResolver.prototype, "updateCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteCourseCategory' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseCategoriesResolver.prototype, "removeCategory", null);
exports.CourseCategoriesResolver = CourseCategoriesResolver = __decorate([
    (0, graphql_1.Resolver)(() => course_category_entity_1.CourseCategory),
    __metadata("design:paramtypes", [course_categories_service_1.CourseCategoriesService])
], CourseCategoriesResolver);
//# sourceMappingURL=course-categories.resolver.js.map