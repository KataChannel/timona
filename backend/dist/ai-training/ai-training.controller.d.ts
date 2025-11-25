import { AiTrainingService } from './ai-training.service';
import type { CreateTrainingDataDto } from './ai-training.service';
export declare class AiTrainingController {
    private readonly aiTrainingService;
    private readonly logger;
    constructor(aiTrainingService: AiTrainingService);
    createTrainingData(req: any, chatbotId: string, createTrainingDataDto: CreateTrainingDataDto): Promise<import("./ai-training.service").TrainingDataResponse>;
    getUserTrainingData(req: any): Promise<import("./ai-training.service").TrainingDataResponse[]>;
    getTrainingDataById(req: any, id: string): Promise<import("./ai-training.service").TrainingDataResponse>;
    deleteTrainingData(req: any, id: string): Promise<{
        message: string;
    }>;
}
