import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportTicketService {
  constructor(private prisma: PrismaService) {}

  async createTicket(data: any) {
    return this.prisma.supportTicket.create({ data });
  }

  async findAll(params?: any) {
    return this.prisma.supportTicket.findMany(params);
  }

  async findOne(id: string) {
    return this.prisma.supportTicket.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.supportTicket.update({ where: { id }, data });
  }
}
