import { PrismaService } from '../prisma/prisma.service';
import { TrainingDataType, TrainingStatus } from '@prisma/client';
export interface CreateTrainingDataDto {
    title: string;
    type: TrainingDataType;
    content?: string;
    filePath?: string;
}
export interface TrainingDataResponse {
    id: string;
    title: string;
    type: TrainingDataType;
    status: TrainingStatus;
    content?: string;
    filePath?: string;
    embeddings?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AiTrainingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createTrainingData(userId: string, chatbotId: string, data: CreateTrainingDataDto): Promise<TrainingDataResponse>;
    getUserTrainingData(userId: string): Promise<TrainingDataResponse[]>;
    getTrainingDataById(userId: string, trainingDataId: string): Promise<TrainingDataResponse>;
    deleteTrainingData(userId: string, trainingDataId: string): Promise<void>;
    private processTrainingData;
    private readFileContent;
    private processDocument;
    private processText;
    private processConversation;
    private processQAPair;
    private generateEmbedding;
    private simpleHash;
    private mapToResponse;
}
