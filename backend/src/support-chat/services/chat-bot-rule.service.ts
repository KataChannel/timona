import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatBotRuleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chatBotRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });
  }

  async matchRule(message: string, platform: string) {
    const rules = await this.findAll();
    
    for (const rule of rules) {
      if (rule.keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
        return rule;
      }
    }
    
    return null;
  }
}
