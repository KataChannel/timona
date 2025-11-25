import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingDataType, TrainingStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

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

@Injectable()
export class AiTrainingService {
  private readonly logger = new Logger(AiTrainingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new training data for a specific chatbot
   */
  async createTrainingData(
    userId: string,
    chatbotId: string,
    data: CreateTrainingDataDto,
  ): Promise<TrainingDataResponse> {
    try {
      this.logger.log(`Creating training data: ${data.title} for user: ${userId}`);

      // Validate input
      if (!data.content && !data.filePath) {
        throw new BadRequestException('Either content or filePath must be provided');
      }

      // Process content if file path is provided
      let content = data.content;
      if (data.filePath && !content) {
        content = await this.readFileContent(data.filePath);
      }

      // Create training data record
      const trainingData = await this.prisma.trainingData.create({
        data: {
          title: data.title,
          type: data.type,
          content: content,
          filePath: data.filePath,
          status: TrainingStatus.PENDING,
          userId,
          chatbotId,
        },
      });

      this.logger.log(`Training data created with ID: ${trainingData.id}`);

      // Process the data asynchronously
      this.processTrainingData(trainingData.id).catch((error) => {
        this.logger.error(`Failed to process training data ${trainingData.id}:`, error);
      });

      return this.mapToResponse(trainingData);
    } catch (error) {
      this.logger.error('Failed to create training data:', error);
      throw error;
    }
  }

  /**
   * Get all training data for a user
   */
  async getUserTrainingData(userId: string): Promise<TrainingDataResponse[]> {
    try {
      const trainingData = await this.prisma.trainingData.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return trainingData.map(this.mapToResponse);
    } catch (error) {
      this.logger.error('Failed to fetch user training data:', error);
      throw error;
    }
  }

  /**
   * Get specific training data by ID
   */
  async getTrainingDataById(
    userId: string,
    trainingDataId: string,
  ): Promise<TrainingDataResponse> {
    try {
      const trainingData = await this.prisma.trainingData.findFirst({
        where: {
          id: trainingDataId,
          userId,
        },
      });

      if (!trainingData) {
        throw new NotFoundException('Training data not found');
      }

      return this.mapToResponse(trainingData);
    } catch (error) {
      this.logger.error('Failed to fetch training data:', error);
      throw error;
    }
  }

  /**
   * Delete training data
   */
  async deleteTrainingData(userId: string, trainingDataId: string): Promise<void> {
    try {
      const trainingData = await this.prisma.trainingData.findFirst({
        where: {
          id: trainingDataId,
          userId,
        },
      });

      if (!trainingData) {
        throw new NotFoundException('Training data not found');
      }

      await this.prisma.trainingData.delete({
        where: { id: trainingDataId },
      });

      this.logger.log(`Training data ${trainingDataId} deleted`);
    } catch (error) {
      this.logger.error('Failed to delete training data:', error);
      throw error;
    }
  }

  /**
   * Process training data to generate embeddings
   */
  private async processTrainingData(trainingDataId: string): Promise<void> {
    try {
      this.logger.log(`Processing training data: ${trainingDataId}`);

      // Update status to processing
      await this.prisma.trainingData.update({
        where: { id: trainingDataId },
        data: { status: TrainingStatus.PROCESSING },
      });

      const trainingData = await this.prisma.trainingData.findUnique({
        where: { id: trainingDataId },
      });

      if (!trainingData) {
        throw new Error('Training data not found');
      }

      // Process based on type
      let processedContent = trainingData.content;

      switch (trainingData.type) {
        case TrainingDataType.DOCUMENT:
          processedContent = await this.processDocument(trainingData.content);
          break;
        case TrainingDataType.TEXT:
          processedContent = await this.processText(trainingData.content);
          break;
        case TrainingDataType.CONVERSATION:
          processedContent = await this.processConversation(trainingData.content);
          break;
        case TrainingDataType.FAQ:
          processedContent = await this.processQAPair(trainingData.content);
          break;
      }

      // Generate embeddings (placeholder for now)
      const embedding = await this.generateEmbedding(processedContent);

      // Update with processed content and embedding
      await this.prisma.trainingData.update({
        where: { id: trainingDataId },
        data: {
          content: processedContent,
          embeddings: embedding,
          status: TrainingStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      this.logger.log(`Training data ${trainingDataId} processed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process training data ${trainingDataId}:`, error);

      // Update status to failed
      await this.prisma.trainingData.update({
        where: { id: trainingDataId },
        data: {
          status: TrainingStatus.FAILED,
          errorMessage: error.message,
        },
      });
    }
  }

  /**
   * Read file content
   */
  private async readFileContent(filePath: string): Promise<string> {
    try {
      const absolutePath = path.resolve(filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file ${filePath}:`, error);
      throw new BadRequestException(`Unable to read file: ${filePath}`);
    }
  }

  /**
   * Process document content
   */
  private async processDocument(content: string): Promise<string> {
    // Clean and format document content
    return content
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .replace(/\s{2,}/g, ' ') // Remove excessive spaces
      .trim();
  }

  /**
   * Process text content
   */
  private async processText(content: string): Promise<string> {
    // Basic text cleaning
    return content.trim();
  }

  /**
   * Process conversation content
   */
  private async processConversation(content: string): Promise<string> {
    // Format conversation with clear speaker identification
    try {
      const conversation = JSON.parse(content);
      if (Array.isArray(conversation)) {
        return conversation
          .map((message) => `${message.speaker}: ${message.content}`)
          .join('\n');
      }
      return content;
    } catch {
      return content;
    }
  }

  /**
   * Process Q&A pair content
   */
  private async processQAPair(content: string): Promise<string> {
    // Format Q&A pairs
    try {
      const qaPair = JSON.parse(content);
      return `Q: ${qaPair.question}\nA: ${qaPair.answer}`;
    } catch {
      return content;
    }
  }

  /**
   * Generate embedding for content (placeholder implementation)
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    // TODO: Implement actual embedding generation using AI service
    // For now, return a simple hash-based embedding
    const hash = this.simpleHash(content);
    return Array.from({ length: 384 }, (_, i) => Math.sin(hash + i) / 1000);
  }

  /**
   * Simple hash function for placeholder embedding
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Map database model to response DTO
   */
  private mapToResponse(trainingData: any): TrainingDataResponse {
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
}
