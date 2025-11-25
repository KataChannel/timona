import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AiTrainingService } from './ai-training.service';
import type { CreateTrainingDataDto } from './ai-training.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-training')
@UseGuards(JwtAuthGuard)
export class AiTrainingController {
  private readonly logger = new Logger(AiTrainingController.name);
  
  constructor(private readonly aiTrainingService: AiTrainingService) {}

  @Post(':chatbotId')
  async createTrainingData(
    @Request() req,
    @Param('chatbotId') chatbotId: string,
    @Body() createTrainingDataDto: CreateTrainingDataDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.aiTrainingService.createTrainingData(
      userId,
      chatbotId,
      createTrainingDataDto,
    );
  }

  @Get()
  async getUserTrainingData(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.aiTrainingService.getUserTrainingData(userId);
  }

  @Get(':id')
  async getTrainingDataById(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.aiTrainingService.getTrainingDataById(userId, id);
  }

  @Delete(':id')
  async deleteTrainingData(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    await this.aiTrainingService.deleteTrainingData(userId, id);
    return { message: 'Training data deleted successfully' };
  }
}
