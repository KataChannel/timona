import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatQuickReplyService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.chatQuickReply.findMany({ where: { isActive: true } });
  }

  async create(data: any) {
    return this.prisma.chatQuickReply.create({ data });
  }

  async incrementUsage(id: string) {
    return this.prisma.chatQuickReply.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }
}
