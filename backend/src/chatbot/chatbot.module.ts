import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GrokModule } from '../grok/grok.module';
import { AuthModule } from '../auth/auth.module';
import { GraphQLResolversModule } from '../graphql/graphql.module';

@Module({
  imports: [PrismaModule, GrokModule, AuthModule, GraphQLResolversModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
