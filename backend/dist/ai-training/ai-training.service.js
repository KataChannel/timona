"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiTrainingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTrainingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let AiTrainingService = AiTrainingService_1 = class AiTrainingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiTrainingService_1.name);
    }
    async createTrainingData(userId, chatbotId, data) {
        try {
            this.logger.log(`Creating training data: ${data.title} for user: ${userId}`);
            if (!data.content && !data.filePath) {
                throw new common_1.BadRequestException('Either content or filePath must be provided');
            }
            let content = data.content;
            if (data.filePath && !content) {
                content = await this.readFileContent(data.filePath);
            }
            const trainingData = await this.prisma.trainingData.create({
                data: {
                    title: data.title,
                    type: data.type,
                    content: content,
                    filePath: data.filePath,
                    status: client_1.TrainingStatus.PENDING,
                    userId,
                    chatbotId,
                },
            });
            this.logger.log(`Training data created with ID: ${trainingData.id}`);
            this.processTrainingData(trainingData.id).catch((error) => {
                this.logger.error(`Failed to process training data ${trainingData.id}:`, error);
            });
            return this.mapToResponse(trainingData);
        }
        catch (error) {
            this.logger.error('Failed to create training data:', error);
            throw error;
        }
    }
    async getUserTrainingData(userId) {
        try {
            const trainingData = await this.prisma.trainingData.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            return trainingData.map(this.mapToResponse);
        }
        catch (error) {
            this.logger.error('Failed to fetch user training data:', error);
            throw error;
        }
    }
    async getTrainingDataById(userId, trainingDataId) {
        try {
            const trainingData = await this.prisma.trainingData.findFirst({
                where: {
                    id: trainingDataId,
                    userId,
                },
            });
            if (!trainingData) {
                throw new common_1.NotFoundException('Training data not found');
            }
            return this.mapToResponse(trainingData);
        }
        catch (error) {
            this.logger.error('Failed to fetch training data:', error);
            throw error;
        }
    }
    async deleteTrainingData(userId, trainingDataId) {
        try {
            const trainingData = await this.prisma.trainingData.findFirst({
                where: {
                    id: trainingDataId,
                    userId,
                },
            });
            if (!trainingData) {
                throw new common_1.NotFoundException('Training data not found');
            }
            await this.prisma.trainingData.delete({
                where: { id: trainingDataId },
            });
            this.logger.log(`Training data ${trainingDataId} deleted`);
        }
        catch (error) {
            this.logger.error('Failed to delete training data:', error);
            throw error;
        }
    }
    async processTrainingData(trainingDataId) {
        try {
            this.logger.log(`Processing training data: ${trainingDataId}`);
            await this.prisma.trainingData.update({
                where: { id: trainingDataId },
                data: { status: client_1.TrainingStatus.PROCESSING },
            });
            const trainingData = await this.prisma.trainingData.findUnique({
                where: { id: trainingDataId },
            });
            if (!trainingData) {
                throw new Error('Training data not found');
            }
            let processedContent = trainingData.content;
            switch (trainingData.type) {
                case client_1.TrainingDataType.DOCUMENT:
                    processedContent = await this.processDocument(trainingData.content);
                    break;
                case client_1.TrainingDataType.TEXT:
                    processedContent = await this.processText(trainingData.content);
                    break;
                case client_1.TrainingDataType.CONVERSATION:
                    processedContent = await this.processConversation(trainingData.content);
                    break;
                case client_1.TrainingDataType.FAQ:
                    processedContent = await this.processQAPair(trainingData.content);
                    break;
            }
            const embedding = await this.generateEmbedding(processedContent);
            await this.prisma.trainingData.update({
                where: { id: trainingDataId },
                data: {
                    content: processedContent,
                    embeddings: embedding,
                    status: client_1.TrainingStatus.COMPLETED,
                    processedAt: new Date(),
                },
            });
            this.logger.log(`Training data ${trainingDataId} processed successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to process training data ${trainingDataId}:`, error);
            await this.prisma.trainingData.update({
                where: { id: trainingDataId },
                data: {
                    status: client_1.TrainingStatus.FAILED,
                    errorMessage: error.message,
                },
            });
        }
    }
    async readFileContent(filePath) {
        try {
            const absolutePath = path.resolve(filePath);
            const content = await fs.readFile(absolutePath, 'utf-8');
            return content;
        }
        catch (error) {
            this.logger.error(`Failed to read file ${filePath}:`, error);
            throw new common_1.BadRequestException(`Unable to read file: ${filePath}`);
        }
    }
    async processDocument(content) {
        return content
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
    async processText(content) {
        return content.trim();
    }
    async processConversation(content) {
        try {
            const conversation = JSON.parse(content);
            if (Array.isArray(conversation)) {
                return conversation
                    .map((message) => `${message.speaker}: ${message.content}`)
                    .join('\n');
            }
            return content;
        }
        catch {
            return content;
        }
    }
    async processQAPair(content) {
        try {
            const qaPair = JSON.parse(content);
            return `Q: ${qaPair.question}\nA: ${qaPair.answer}`;
        }
        catch {
            return content;
        }
    }
    async generateEmbedding(content) {
        const hash = this.simpleHash(content);
        return Array.from({ length: 384 }, (_, i) => Math.sin(hash + i) / 1000);
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash;
    }
    mapToResponse(trainingData) {
        return {
            id: trainingData.id,
            title: trainingData.title,
            type: trainingData.type,
            status: trainingData.status,
            content: trainingData.content,
            filePath: trainingData.filePath,
            embeddings: trainingData.embeddings,
            createdAt: trainingData.createdAt,
            updatedAt: trainingData.updatedAt,
        };
    }
};
exports.AiTrainingService = AiTrainingService;
exports.AiTrainingService = AiTrainingService = AiTrainingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiTrainingService);
//# sourceMappingURL=ai-training.service.js.map