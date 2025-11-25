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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const courses_service_1 = require("./courses.service");
const ai_course_generator_service_1 = require("./ai-course-generator.service");
const course_entity_1 = require("./entities/course.entity");
const course_analysis_result_entity_1 = require("./entities/course-analysis-result.entity");
const paginated_courses_entity_1 = require("./entities/paginated-courses.entity");
const create_course_input_1 = require("./dto/create-course.input");
const update_course_input_1 = require("./dto/update-course.input");
const course_filters_input_1 = require("./dto/course-filters.input");
const generate_course_from_documents_input_1 = require("./dto/generate-course-from-documents.input");
const analyze_documents_for_course_input_1 = require("./dto/analyze-documents-for-course.input");
const module_input_1 = require("./dto/module.input");
const lesson_input_1 = require("./dto/lesson.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const course_module_entity_1 = require("./entities/course-module.entity");
const lesson_entity_1 = require("./entities/lesson.entity");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let CoursesResolver = class CoursesResolver {
    constructor(coursesService, aiCourseGeneratorService) {
        this.coursesService = coursesService;
        this.aiCourseGeneratorService = aiCourseGeneratorService;
    }
    createCourse(user, createCourseInput) {
        return this.coursesService.create(user.id, createCourseInput);
    }
    findAll(filters) {
        return this.coursesService.findAll(filters || new course_filters_input_1.CourseFiltersInput());
    }
    findOne(id) {
        return this.coursesService.findOne(id);
    }
    findBySlug(slug) {
        return this.coursesService.findBySlug(slug);
    }
    getMyCourses(user) {
        return this.coursesService.getMyCourses(user.id);
    }
    updateCourse(user, updateCourseInput) {
        return this.coursesService.update(updateCourseInput.id, user.id, updateCourseInput);
    }
    publishCourse(user, id) {
        return this.coursesService.publish(id, user.id);
    }
    archiveCourse(user, id) {
        return this.coursesService.archive(id, user.id);
    }
    async removeCourse(user, id) {
        const result = await this.coursesService.remove(id, user.id);
        return result.success;
    }
    createModule(user, input) {
        return this.coursesService.createModule(user.id, input);
    }
    updateModule(user, input) {
        return this.coursesService.updateModule(user.id, input);
    }
    async deleteModule(user, id) {
        const result = await this.coursesService.deleteModule(user.id, id);
        return result.success;
    }
    reorderModules(user, input) {
        return this.coursesService.reorderModules(user.id, input);
    }
    createLesson(user, input) {
        return this.coursesService.createLesson(user.id, input);
    }
    updateLesson(user, input) {
        return this.coursesService.updateLesson(user.id, input);
    }
    async deleteLesson(user, id) {
        const result = await this.coursesService.deleteLesson(user.id, id);
        return result.success;
    }
    reorderLessons(user, input) {
        return this.coursesService.reorderLessons(user.id, input);
    }
    async analyzeDocumentsForCourse(user, input) {
        console.log('📥 Analyze documents request from user:', user.id);
        console.log('📚 Documents:', input.documentIds);
        return this.aiCourseGeneratorService.analyzeDocumentsForCourse({
            documentIds: input.documentIds,
            additionalContext: input.additionalContext,
        });
    }
    async generateCourseFromPrompt(user, prompt, categoryId) {
        return this.aiCourseGeneratorService.generateCourseFromPrompt({
            prompt,
            categoryId,
            instructorId: user.id,
        });
    }
    async generateCourseFromDocuments(user, input) {
        console.log('📥 Resolver received input:', JSON.stringify(input, null, 2));
        console.log('👤 User ID:', user.id);
        return this.aiCourseGeneratorService.generateCourseFromDocuments({
            documentIds: input.documentIds || [],
            categoryId: input.categoryId,
            additionalPrompt: input.additionalPrompt,
            instructorId: user.id,
        });
    }
    getSampleCoursePrompts() {
        return this.aiCourseGeneratorService.getSamplePrompts();
    }
    getCoursePromptTemplates() {
        return this.aiCourseGeneratorService.getPromptTemplates();
    }
};
exports.CoursesResolver = CoursesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'createCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('createCourseInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_course_input_1.CreateCourseInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "createCourse", null);
__decorate([
    (0, graphql_1.Query)(() => paginated_courses_entity_1.PaginatedCourses, { name: 'courses' }),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_filters_input_1.CourseFiltersInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => course_entity_1.Course, { name: 'course' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => course_entity_1.Course, { name: 'courseBySlug' }),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "findBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => [course_entity_1.Course], { name: 'myCourses' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "getMyCourses", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'updateCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('updateCourseInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_course_input_1.UpdateCourseInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "updateCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'publishCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "publishCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'archiveCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "archiveCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "removeCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_module_entity_1.CourseModule, { name: 'createModule' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, module_input_1.CreateModuleInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "createModule", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_module_entity_1.CourseModule, { name: 'updateModule' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, module_input_1.UpdateModuleInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "updateModule", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteModule' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteModule", null);
__decorate([
    (0, graphql_1.Mutation)(() => [course_module_entity_1.CourseModule], { name: 'reorderModules' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, module_input_1.ReorderModulesInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "reorderModules", null);
__decorate([
    (0, graphql_1.Mutation)(() => lesson_entity_1.Lesson, { name: 'createLesson' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lesson_input_1.CreateLessonInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "createLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => lesson_entity_1.Lesson, { name: 'updateLesson' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lesson_input_1.UpdateLessonInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "updateLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteLesson' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "deleteLesson", null);
__decorate([
    (0, graphql_1.Mutation)(() => [lesson_entity_1.Lesson], { name: 'reorderLessons' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, lesson_input_1.ReorderLessonsInput]),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "reorderLessons", null);
__decorate([
    (0, graphql_1.Query)(() => course_analysis_result_entity_1.CourseAnalysisResult, { name: 'analyzeDocumentsForCourse' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analyze_documents_for_course_input_1.AnalyzeDocumentsForCourseInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "analyzeDocumentsForCourse", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'generateCourseFromPrompt' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('prompt')),
    __param(2, (0, graphql_1.Args)('categoryId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "generateCourseFromPrompt", null);
__decorate([
    (0, graphql_1.Mutation)(() => course_entity_1.Course, { name: 'generateCourseFromDocuments' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_course_from_documents_input_1.GenerateCourseFromDocumentsInput]),
    __metadata("design:returntype", Promise)
], CoursesResolver.prototype, "generateCourseFromDocuments", null);
__decorate([
    (0, graphql_1.Query)(() => [String], { name: 'sampleCoursePrompts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "getSampleCoursePrompts", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.default, { name: 'coursePromptTemplates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoursesResolver.prototype, "getCoursePromptTemplates", null);
exports.CoursesResolver = CoursesResolver = __decorate([
    (0, graphql_1.Resolver)(() => course_entity_1.Course),
    __metadata("design:paramtypes", [courses_service_1.CoursesService,
        ai_course_generator_service_1.AICourseGeneratorService])
], CoursesResolver);
//# sourceMappingURL=courses.resolver.js.map