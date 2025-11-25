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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let ProjectChatGateway = class ProjectChatGateway {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.activeConnections = new Map();
        this.onlineUsers = new Map();
    }
    async handleConnection(client) {
        console.log(`[ProjectChat] Client connected: ${client.id}`);
        let token = client.handshake.auth?.token || client.handshake.headers?.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.substring(7);
        }
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                client.userId = payload.sub || payload.id;
                console.log(`[ProjectChat] Authenticated user: ${client.userId}`);
            }
            catch (error) {
                console.error('[ProjectChat] Auth error:', error.message);
            }
        }
    }
    async handleDisconnect(client) {
        console.log(`[ProjectChat] Client disconnected: ${client.id}`);
        const connection = this.activeConnections.get(client.id);
        if (connection) {
            const { userId, projectId } = connection;
            const onlineSet = this.onlineUsers.get(projectId);
            if (onlineSet) {
                onlineSet.delete(userId);
                this.server.to(`project_${projectId}`).emit('user_offline', {
                    userId,
                    projectId,
                    timestamp: new Date(),
                });
            }
            this.activeConnections.delete(client.id);
        }
    }
    async handleJoinProject(data, client) {
        const { projectId } = data;
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (!member) {
            return { success: false, error: 'Not a project member' };
        }
        client.join(`project_${projectId}`);
        this.activeConnections.set(client.id, { userId, projectId });
        if (!this.onlineUsers.has(projectId)) {
            this.onlineUsers.set(projectId, new Set());
        }
        this.onlineUsers.get(projectId).add(userId);
        client.broadcast.to(`project_${projectId}`).emit('user_online', {
            userId,
            projectId,
            timestamp: new Date(),
        });
        const onlineUsersList = Array.from(this.onlineUsers.get(projectId) || []);
        return {
            success: true,
            projectId,
            onlineUsers: onlineUsersList,
        };
    }
    async handleLeaveProject(data, client) {
        const { projectId } = data;
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        client.leave(`project_${projectId}`);
        const onlineSet = this.onlineUsers.get(projectId);
        if (onlineSet) {
            onlineSet.delete(userId);
        }
        client.broadcast.to(`project_${projectId}`).emit('user_offline', {
            userId,
            projectId,
            timestamp: new Date(),
        });
        this.activeConnections.delete(client.id);
        return { success: true };
    }
    async handleLoadMessages(data, client) {
        const userId = client.userId;
        if (!userId) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }
        try {
            const take = data.take || 50;
            const skip = data.skip || 0;
            console.log('[load_messages] Checking membership:', {
                projectId: data.projectId,
                userId,
                userIdType: typeof userId,
            });
            const allMembers = await this.prisma.projectMember.findMany({
                where: { projectId: data.projectId },
                select: { userId: true, role: true },
            });
            console.log('[load_messages] Project members:', allMembers);
            const member = await this.prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: data.projectId,
                        userId: String(userId),
                    },
                },
            });
            console.log('[load_messages] Found member:', member);
            if (!member) {
                client.emit('error', { message: 'Not a project member' });
                return;
            }
            const messages = await this.prisma.chatMessagePM.findMany({
                where: {
                    projectId: data.projectId,
                },
                take,
                skip,
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    replyTo: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            const formattedMessages = messages.map((msg) => ({
                id: msg.id,
                userId: msg.senderId,
                userName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.email,
                userAvatar: msg.sender.avatar,
                content: msg.content,
                createdAt: msg.createdAt,
                isEdited: msg.isEdited,
                reactions: msg.reactions || {},
                replyTo: msg.replyTo ? {
                    id: msg.replyTo.id,
                    content: msg.replyTo.content,
                    userName: `${msg.replyTo.sender.firstName || ''} ${msg.replyTo.sender.lastName || ''}`.trim(),
                } : undefined,
            }));
            client.emit('messages_loaded', formattedMessages);
            console.log(`📨 Loaded ${formattedMessages.length} messages for project ${data.projectId}`);
        }
        catch (error) {
            console.error('Error loading messages:', error);
            client.emit('error', { message: 'Failed to load messages' });
        }
    }
    async handleSendMessage(data, client) {
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const message = await this.prisma.chatMessagePM.create({
                data: {
                    content: data.content,
                    projectId: data.projectId,
                    senderId: userId,
                    mentions: data.mentions || [],
                    replyToId: data.replyToId,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    replyTo: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });
            const formattedMessage = {
                id: message.id,
                userId: message.senderId,
                userName: `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || message.sender.email,
                userAvatar: message.sender.avatar,
                content: message.content,
                createdAt: message.createdAt,
                isEdited: message.isEdited || false,
                reactions: message.reactions || {},
                replyTo: message.replyTo ? {
                    id: message.replyTo.id,
                    content: message.replyTo.content,
                    userName: `${message.replyTo.sender.firstName || ''} ${message.replyTo.sender.lastName || ''}`.trim(),
                } : undefined,
            };
            this.server.to(`project_${data.projectId}`).emit('new_message', formattedMessage);
            if (data.mentions && data.mentions.length > 0) {
                const senderName = `${message.sender.firstName} ${message.sender.lastName}`.trim();
                const notifications = data.mentions.map((mentionedUserId) => ({
                    userId: mentionedUserId,
                    type: 'PROJECT_MENTION',
                    title: 'You were mentioned in a project chat',
                    message: `${senderName} mentioned you: ${data.content.substring(0, 100)}`,
                    projectId: data.projectId,
                    mentionedBy: userId,
                    isRead: false,
                }));
                await this.prisma.notification.createMany({
                    data: notifications,
                });
                data.mentions.forEach((mentionedUserId) => {
                    this.server.to(`user_${mentionedUserId}`).emit('new_notification', {
                        type: 'PROJECT_MENTION',
                        projectId: data.projectId,
                        message: message.content,
                        sender: message.sender,
                    });
                });
            }
            return { success: true, message };
        }
        catch (error) {
            console.error('[ProjectChat] Send message error:', error);
            return { success: false, error: error.message };
        }
    }
    handleTypingStart(data, client) {
        const userId = client.userId;
        if (!userId)
            return;
        client.broadcast.to(`project_${data.projectId}`).emit('user_typing', {
            userId,
            projectId: data.projectId,
            timestamp: new Date(),
        });
    }
    handleTypingStop(data, client) {
        const userId = client.userId;
        if (!userId)
            return;
        client.broadcast.to(`project_${data.projectId}`).emit('user_stopped_typing', {
            userId,
            projectId: data.projectId,
            timestamp: new Date(),
        });
    }
    async handleAddReaction(data, client) {
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const message = await this.prisma.chatMessagePM.findUnique({
                where: { id: data.messageId },
            });
            if (!message) {
                return { success: false, error: 'Message not found' };
            }
            const reactions = message.reactions || {};
            if (!reactions[data.emoji]) {
                reactions[data.emoji] = [];
            }
            if (!reactions[data.emoji].includes(userId)) {
                reactions[data.emoji].push(userId);
            }
            const updatedMessage = await this.prisma.chatMessagePM.update({
                where: { id: data.messageId },
                data: { reactions },
            });
            this.server.to(`project_${data.projectId}`).emit('reaction_added', {
                messageId: data.messageId,
                emoji: data.emoji,
                userId,
                reactions: updatedMessage.reactions,
            });
            return { success: true, reactions: updatedMessage.reactions };
        }
        catch (error) {
            console.error('[ProjectChat] Add reaction error:', error);
            return { success: false, error: error.message };
        }
    }
    async handleRemoveReaction(data, client) {
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const message = await this.prisma.chatMessagePM.findUnique({
                where: { id: data.messageId },
            });
            if (!message) {
                return { success: false, error: 'Message not found' };
            }
            const reactions = message.reactions || {};
            if (reactions[data.emoji]) {
                reactions[data.emoji] = reactions[data.emoji].filter((id) => id !== userId);
                if (reactions[data.emoji].length === 0) {
                    delete reactions[data.emoji];
                }
            }
            const updatedMessage = await this.prisma.chatMessagePM.update({
                where: { id: data.messageId },
                data: { reactions },
            });
            this.server.to(`project_${data.projectId}`).emit('reaction_removed', {
                messageId: data.messageId,
                emoji: data.emoji,
                userId,
                reactions: updatedMessage.reactions,
            });
            return { success: true, reactions: updatedMessage.reactions };
        }
        catch (error) {
            console.error('[ProjectChat] Remove reaction error:', error);
            return { success: false, error: error.message };
        }
    }
    async handleEditMessage(data, client) {
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const message = await this.prisma.chatMessagePM.findUnique({
                where: { id: data.messageId },
            });
            if (!message) {
                return { success: false, error: 'Message not found' };
            }
            if (message.senderId !== userId) {
                return { success: false, error: 'Not authorized to edit this message' };
            }
            const updatedMessage = await this.prisma.chatMessagePM.update({
                where: { id: data.messageId },
                data: {
                    content: data.content,
                    isEdited: true,
                    editedAt: new Date(),
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            });
            this.server.to(`project_${data.projectId}`).emit('message_edited', updatedMessage);
            return { success: true, message: updatedMessage };
        }
        catch (error) {
            console.error('[ProjectChat] Edit message error:', error);
            return { success: false, error: error.message };
        }
    }
    async handleDeleteMessage(data, client) {
        const userId = client.userId;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const message = await this.prisma.chatMessagePM.findUnique({
                where: { id: data.messageId },
            });
            if (!message) {
                return { success: false, error: 'Message not found' };
            }
            const member = await this.prisma.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: data.projectId,
                        userId,
                    },
                },
            });
            const canDelete = message.senderId === userId ||
                member?.role === 'owner' ||
                member?.role === 'admin';
            if (!canDelete) {
                return { success: false, error: 'Not authorized to delete this message' };
            }
            await this.prisma.chatMessagePM.delete({
                where: { id: data.messageId },
            });
            this.server.to(`project_${data.projectId}`).emit('message_deleted', {
                messageId: data.messageId,
                projectId: data.projectId,
            });
            return { success: true };
        }
        catch (error) {
            console.error('[ProjectChat] Delete message error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendSystemMessage(projectId, content) {
        const message = await this.prisma.chatMessagePM.create({
            data: {
                content,
                projectId,
                senderId: 'system',
                mentions: [],
            },
        });
        this.server.to(`project_${projectId}`).emit('system_message', message);
    }
    getOnlineUsers(projectId) {
        return Array.from(this.onlineUsers.get(projectId) || []);
    }
};
exports.ProjectChatGateway = ProjectChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ProjectChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_project'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_project'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleLeaveProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('load_messages'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleLoadMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('add_reaction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleAddReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remove_reaction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleRemoveReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('edit_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectChatGateway.prototype, "handleDeleteMessage", null);
exports.ProjectChatGateway = ProjectChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/project-chat',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], ProjectChatGateway);
//# sourceMappingURL=project-chat.gateway.js.map