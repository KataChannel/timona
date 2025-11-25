import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import type { CreateChatbotDto, SendMessageDto } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  private readonly logger = new Logger(ChatbotController.name);
  
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  async createChatbot(
    @Request() req,
    @Body() createChatbotDto: CreateChatbotDto,
  ) {
    this.logger.debug(`Request user object: ${JSON.stringify(req.user)}`);
    this.logger.debug(`User sub: ${req.user?.sub}`);
    this.logger.debug(`User id: ${req.user?.id}`);
    
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      this.logger.error('No userId found in request');
      throw new Error('User ID not found in request');
    }
    
    return this.chatbotService.createChatbot(userId, createChatbotDto);
  }

  @Get()
  async getUserChatbots(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.getUserChatbots(userId);
  }

  @Get(':id')
  async getChatbotById(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.getChatbotById(userId, id);
  }

  @Put(':id')
  async updateChatbot(
    @Request() req,
    @Param('id') id: string,
    @Body() updateChatbotDto: Partial<CreateChatbotDto>,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.updateChatbot(userId, id, updateChatbotDto);
  }

  @Delete(':id')
  async deleteChatbot(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    await this.chatbotService.deleteChatbot(userId, id);
    return { message: 'Chatbot deleted successfully' };
  }

  @Post(':id/message')
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.sendMessage(userId, id, sendMessageDto);
  }

  @Get(':id/conversations')
  async getChatbotConversations(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.getChatbotConversations(userId, id);
  }

  @Get('conversation/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.chatbotService.getConversation(userId, id);
  }
}
