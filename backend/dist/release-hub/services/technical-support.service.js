"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TechnicalSupportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalSupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../../services/notification.service");
let TechnicalSupportService = TechnicalSupportService_1 = class TechnicalSupportService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(TechnicalSupportService_1.name);
    }
    async createTicket(input) {
        try {
            console.log('📝 [TechnicalSupportService] Received input:', JSON.stringify(input, null, 2));
            console.log('📝 [TechnicalSupportService] Input keys:', Object.keys(input));
            console.log('📝 [TechnicalSupportService] subject:', input.subject, 'type:', typeof input.subject);
            console.log('📝 [TechnicalSupportService] description:', input.description, 'type:', typeof input.description);
            console.log('📝 [TechnicalSupportService] category:', input.category, 'type:', typeof input.category);
            if (!input.subject || !input.description || !input.category) {
                throw new Error('Missing required fields: subject, description, and category are required');
            }
            const ticketNumber = await this.generateTicketNumber();
            const data = {
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
            if (input.customerId)
                data.customerId = input.customerId;
            if (input.customerEmail)
                data.customerEmail = input.customerEmail;
            if (input.customerName)
                data.customerName = input.customerName;
            if (input.customerPhone)
                data.customerPhone = input.customerPhone;
            if (input.environment)
                data.environment = input.environment;
            if (input.browserInfo)
                data.browserInfo = input.browserInfo;
            if (input.osInfo)
                data.osInfo = input.osInfo;
            if (input.deviceInfo)
                data.deviceInfo = input.deviceInfo;
            if (input.errorLogs)
                data.errorLogs = input.errorLogs;
            if (input.relatedUrl)
                data.relatedUrl = input.relatedUrl;
            if (input.relatedOrderId)
                data.relatedOrderId = input.relatedOrderId;
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
        }
        catch (error) {
            this.logger.error(`Error creating ticket: ${error.message}`);
            throw error;
        }
    }
    async findAll(where, take = 20, skip = 0) {
        const whereClause = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }
    async findByTicketNumber(ticketNumber) {
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
            throw new common_1.NotFoundException(`Ticket ${ticketNumber} not found`);
        }
        return ticket;
    }
    async update(id, input) {
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
        }
        catch (error) {
            this.logger.error(`Error updating ticket: ${error.message}`);
            throw error;
        }
    }
    async assignTicket(ticketId, assignedToId) {
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
        await this.notificationService.create({
            userId: assignedToId,
            type: 'SYSTEM',
            title: 'Ticket mới được giao',
            message: `Bạn được giao ticket #${ticket.ticketNumber} - ${ticket.subject}`,
            data: { ticketId, ticketNumber: ticket.ticketNumber },
        });
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
    async resolveTicket(ticketId, resolution, resolvedById) {
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
    async createMessage(input) {
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
            const updateData = {
                lastResponseAt: new Date(),
            };
            if (!message.ticket.firstResponseAt) {
                updateData.firstResponseAt = new Date();
            }
            await this.prisma.technicalSupportTicket.update({
                where: { id: input.ticketId },
                data: updateData,
            });
            if (!input.isInternal) {
                if (input.authorId && message.ticket.customerId !== input.authorId) {
                    await this.notificationService.create({
                        userId: message.ticket.customerId,
                        type: 'SYSTEM',
                        title: 'Phản hồi mới từ hỗ trợ',
                        message: `Bạn có phản hồi mới cho ticket #${message.ticket.ticketNumber}`,
                        data: { ticketId: input.ticketId, messageId: message.id },
                    });
                }
                else if (message.ticket.assignedToId) {
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
        }
        catch (error) {
            this.logger.error(`Error creating message: ${error.message}`);
            throw error;
        }
    }
    async rateTicket(input) {
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
    async getMyTickets(userId, status) {
        const whereClause = {
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
    async generateTicketNumber() {
        const year = new Date().getFullYear();
        const count = await this.prisma.technicalSupportTicket.count();
        const nextNumber = (count + 1).toString().padStart(5, '0');
        return `SUP-${year}-${nextNumber}`;
    }
};
exports.TechnicalSupportService = TechnicalSupportService;
exports.TechnicalSupportService = TechnicalSupportService = TechnicalSupportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], TechnicalSupportService);
//# sourceMappingURL=technical-support.service.js.map