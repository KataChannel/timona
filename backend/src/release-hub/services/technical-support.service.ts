import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../services/notification.service';
import {
  CreateTechnicalSupportTicketInput,
  UpdateTechnicalSupportTicketInput,
  CreateTechnicalSupportMessageInput,
  RateTicketInput,
  TechnicalSupportTicketWhereInput,
} from '../dto/technical-support.input';

@Injectable()
export class TechnicalSupportService {
  private readonly logger = new Logger(TechnicalSupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createTicket(input: CreateTechnicalSupportTicketInput) {
    try {
      // Debug: Log received input
      console.log('📝 [TechnicalSupportService] Received input:', JSON.stringify(input, null, 2));
      console.log('📝 [TechnicalSupportService] Input keys:', Object.keys(input));
      console.log('📝 [TechnicalSupportService] subject:', input.subject, 'type:', typeof input.subject);
      console.log('📝 [TechnicalSupportService] description:', input.description, 'type:', typeof input.description);
      console.log('📝 [TechnicalSupportService] category:', input.category, 'type:', typeof input.category);
      
      // Validate required fields
      if (!input.subject || !input.description || !input.category) {
        throw new Error('Missing required fields: subject, description, and category are required');
      }

      // Generate ticket number
      const ticketNumber = await this.generateTicketNumber();

      // Build data object, only include defined values
      const data: any = {
        ticketNumber,
        subject: input.subject,
        description: input.description,
        category: input.category,
        priority: input.priority || 'MEDIUM',
        status: 'OPEN',
        attachmentUrls: input.attachmentUrls || [],
        screenshotUrls: input.screenshotUrls || [],
        tags: input.tags || [],
      };

      // Only add optional fields if they have values
      if (input.customerId) data.customerId = input.customerId;
      if (input.customerEmail) data.customerEmail = input.customerEmail;
      if (input.customerName) data.customerName = input.customerName;
      if (input.customerPhone) data.customerPhone = input.customerPhone;
      if (input.environment) data.environment = input.environment;
      if (input.browserInfo) data.browserInfo = input.browserInfo;
      if (input.osInfo) data.osInfo = input.osInfo;
      if (input.deviceInfo) data.deviceInfo = input.deviceInfo;
      if (input.errorLogs) data.errorLogs = input.errorLogs;
      if (input.relatedUrl) data.relatedUrl = input.relatedUrl;
      if (input.relatedOrderId) data.relatedOrderId = input.relatedOrderId;

      const ticket = await this.prisma.technicalSupportTicket.create({
        data,
        include: {
          customer: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Gửi notification cho customer
      if (ticket.customerId) {
        await this.notificationService.create({
          userId: ticket.customerId,
          type: 'SYSTEM',
          title: 'Ticket hỗ trợ đã được tạo',
          message: `Ticket #${ticketNumber} - ${input.subject} đã được tạo thành công. Chúng tôi sẽ phản hồi sớm nhất.`,
          data: { ticketId: ticket.id, ticketNumber },
        });
      }

      this.logger.log(`Created support ticket: ${ticketNumber}`);
      return ticket;
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw error;
    }
  }

  async findAll(where?: TechnicalSupportTicketWhereInput, take = 20, skip = 0) {
    const whereClause: any = {};

    if (where?.status) {
      whereClause.status = where.status;
    }

    if (where?.priority) {
      whereClause.priority = where.priority;
    }

    if (where?.category) {
      whereClause.category = where.category;
    }

    if (where?.customerId) {
      whereClause.customerId = where.customerId;
    }

    if (where?.assignedToId) {
      whereClause.assignedToId = where.assignedToId;
    }

    if (where?.search) {
      whereClause.OR = [
        { ticketNumber: { contains: where.search, mode: 'insensitive' } },
        { subject: { contains: where.search, mode: 'insensitive' } },
        { description: { contains: where.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.technicalSupportTicket.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.technicalSupportTicket.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        relatedOrder: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByTicketNumber(ticketNumber: string) {
    const ticket = await this.prisma.technicalSupportTicket.findUnique({
      where: { ticketNumber },
      include: {
        customer: true,
        assignedTo: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} not found`);
    }

    return ticket;
  }

  async update(id: string, input: UpdateTechnicalSupportTicketInput) {
    try {
      const ticket = await this.prisma.technicalSupportTicket.update({
        where: { id },
        data: {
          ...input,
          resolvedAt: input.status === 'RESOLVED' ? new Date() : undefined,
          closedAt: input.status === 'CLOSED' ? new Date() : undefined,
        },
      });

      this.logger.log(`Updated ticket: ${ticket.ticketNumber}`);
      return ticket;
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`);
      throw error;
    }
  }

  async assignTicket(ticketId: string, assignedToId: string) {
    const ticket = await this.prisma.technicalSupportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
        assignedAt: new Date(),
        status: 'IN_PROGRESS',
      },
      include: {
        customer: true,
        assignedTo: true,
      },
    });

    // Notify assigned agent
    await this.notificationService.create({
      userId: assignedToId,
      type: 'SYSTEM',
      title: 'Ticket mới được giao',
      message: `Bạn được giao ticket #${ticket.ticketNumber} - ${ticket.subject}`,
      data: { ticketId, ticketNumber: ticket.ticketNumber },
    });

    // Notify customer
    if (ticket.customerId) {
      await this.notificationService.create({
        userId: ticket.customerId,
        type: 'SYSTEM',
        title: 'Ticket đang được xử lý',
        message: `Ticket #${ticket.ticketNumber} của bạn đã được giao cho nhân viên hỗ trợ.`,
        data: { ticketId, ticketNumber: ticket.ticketNumber },
      });
    }

    return ticket;
  }

  async resolveTicket(ticketId: string, resolution: string, resolvedById: string) {
    const ticket = await this.prisma.technicalSupportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolution,
        resolvedById,
        resolvedAt: new Date(),
      },
      include: {
        customer: true,
      },
    });

    // Notify customer
    if (ticket.customerId) {
      await this.notificationService.create({
        userId: ticket.customerId,
        type: 'SYSTEM',
        title: 'Ticket đã được giải quyết',
        message: `Ticket #${ticket.ticketNumber} đã được giải quyết. Vui lòng đánh giá chất lượng hỗ trợ.`,
        data: { ticketId, ticketNumber: ticket.ticketNumber },
      });
    }

    return ticket;
  }

  async createMessage(input: CreateTechnicalSupportMessageInput) {
    try {
      const message = await this.prisma.technicalSupportMessage.create({
        data: {
          ...input,
          attachmentUrls: input.attachmentUrls || [],
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          ticket: {
            include: {
              customer: true,
              assignedTo: true,
            },
          },
        },
      });

      // Update ticket timestamps
      const updateData: any = {
        lastResponseAt: new Date(),
      };

      if (!message.ticket.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }

      await this.prisma.technicalSupportTicket.update({
        where: { id: input.ticketId },
        data: updateData,
      });

      // Notify relevant parties (không notify nếu là internal note)
      if (!input.isInternal) {
        if (input.authorId && message.ticket.customerId !== input.authorId) {
          // Agent replied, notify customer
          await this.notificationService.create({
            userId: message.ticket.customerId!,
            type: 'SYSTEM',
            title: 'Phản hồi mới từ hỗ trợ',
            message: `Bạn có phản hồi mới cho ticket #${message.ticket.ticketNumber}`,
            data: { ticketId: input.ticketId, messageId: message.id },
          });
        } else if (message.ticket.assignedToId) {
          // Customer replied, notify assigned agent
          await this.notificationService.create({
            userId: message.ticket.assignedToId,
            type: 'SYSTEM',
            title: 'Khách hàng đã phản hồi',
            message: `Ticket #${message.ticket.ticketNumber} có phản hồi mới từ khách hàng`,
            data: { ticketId: input.ticketId, messageId: message.id },
          });
        }
      }

      this.logger.log(`Created message for ticket: ${message.ticket.ticketNumber}`);
      return message;
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw error;
    }
  }

  async rateTicket(input: RateTicketInput) {
    const ticket = await this.prisma.technicalSupportTicket.update({
      where: { id: input.ticketId },
      data: {
        customerRating: input.rating,
        customerFeedback: input.feedback,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    this.logger.log(`Ticket rated: ${ticket.ticketNumber} - ${input.rating}/5`);
    return ticket;
  }

  async getMyTickets(userId: string, status?: string) {
    const whereClause: any = {
      customerId: userId,
    };

    if (status) {
      whereClause.status = status;
    }

    return this.prisma.technicalSupportTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.technicalSupportTicket.count();
    const nextNumber = (count + 1).toString().padStart(5, '0');
    return `SUP-${year}-${nextNumber}`;
  }
}
