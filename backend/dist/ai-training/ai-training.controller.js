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
var AiTrainingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTrainingController = void 0;
const common_1 = require("@nestjs/common");
const ai_training_service_1 = require("./ai-training.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AiTrainingController = AiTrainingController_1 = class AiTrainingController {
    constructor(aiTrainingService) {
        this.aiTrainingService = aiTrainingService;
        this.logger = new common_1.Logger(AiTrainingController_1.name);
    }
    async createTrainingData(req, chatbotId, createTrainingDataDto) {
        const userId = req.user?.sub || req.user?.id;
        return this.aiTrainingService.createTrainingData(userId, chatbotId, createTrainingDataDto);
    }
    async getUserTrainingData(req) {
        const userId = req.user?.sub || req.user?.id;
        return this.aiTrainingService.getUserTrainingData(userId);
    }
    async getTrainingDataById(req, id) {
        const userId = req.user?.sub || req.user?.id;
        return this.aiTrainingService.getTrainingDataById(userId, id);
    }
    async deleteTrainingData(req, id) {
        const userId = req.user?.sub || req.user?.id;
        await this.aiTrainingService.deleteTrainingData(userId, id);
        return { message: 'Training data deleted successfully' };
    }
};
exports.AiTrainingController = AiTrainingController;
__decorate([
    (0, common_1.Post)(':chatbotId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('chatbotId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AiTrainingController.prototype, "createTrainingData", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiTrainingController.prototype, "getUserTrainingData", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiTrainingController.prototype, "getTrainingDataById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiTrainingController.prototype, "deleteTrainingData", null);
exports.AiTrainingController = AiTrainingController = AiTrainingController_1 = __decorate([
    (0, common_1.Controller)('ai-training'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_training_service_1.AiTrainingService])
], AiTrainingController);
//# sourceMappingURL=ai-training.controller.js.map