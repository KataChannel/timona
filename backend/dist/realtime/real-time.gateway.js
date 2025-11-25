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
var RealTimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const presence_service_1 = require("./presence.service");
const collaboration_service_1 = require("./collaboration.service");
const real_time_notification_service_1 = require("./real-time-notification.service");
let RealTimeGateway = RealTimeGateway_1 = class RealTimeGateway {
    constructor(presenceService, collaborationService, notificationService) {
        this.presenceService = presenceService;
        this.collaborationService = collaborationService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(RealTimeGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const user = await this.extractUserFromSocket(client);
            if (!user) {
                client.disconnect();
                return;
            }
            client.user = user;
            await this.presenceService.userConnected(user.id, client.id);
            this.logger.log(`User ${user.email} connected with socket ${client.id}`);
            client.join(`user-${user.id}`);
            client.emit('connection:success', {
                userId: user.id,
                socketId: client.id,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.user) {
            await this.presenceService.userDisconnected(client.user.id, client.id);
            this.logger.log(`User ${client.user.email} disconnected`);
        }
    }
    async handleJoinTask(client, data) {
        if (!client.user)
            return;
        await client.join(`task-${data.taskId}`);
        await this.presenceService.joinTask(client.user.id, data.taskId, client.id);
        client.to(`task-${data.taskId}`).emit('presence:joined', {
            userId: client.user.id,
            userName: client.user.firstName + ' ' + client.user.lastName,
            userEmail: client.user.email,
            taskId: data.taskId,
            timestamp: new Date(),
        });
        const currentPresence = await this.presenceService.getTaskPresence(data.taskId);
        client.emit('presence:current', {
            taskId: data.taskId,
            users: currentPresence,
            timestamp: new Date(),
        });
    }
    async handleLeaveTask(client, data) {
        if (!client.user)
            return;
        await client.leave(`task-${data.taskId}`);
        await this.presenceService.leaveTask(client.user.id, data.taskId, client.id);
        client.to(`task-${data.taskId}`).emit('presence:left', {
            userId: client.user.id,
            taskId: data.taskId,
            timestamp: new Date(),
        });
    }
    async handleTaskEditStart(client, data) {
        if (!client.user)
            return;
        await this.collaborationService.startEditing(client.user.id, data.taskId, data.field);
        client.to(`task-${data.taskId}`).emit('task:edit:started', {
            userId: client.user.id,
            userName: client.user.firstName + ' ' + client.user.lastName,
            taskId: data.taskId,
            field: data.field,
            timestamp: new Date(),
        });
    }
    async handleTaskEditStop(client, data) {
        if (!client.user)
            return;
        await this.collaborationService.stopEditing(client.user.id, data.taskId, data.field);
        client.to(`task-${data.taskId}`).emit('task:edit:stopped', {
            userId: client.user.id,
            taskId: data.taskId,
            field: data.field,
            timestamp: new Date(),
        });
    }
    async handleTaskEditTyping(client, data) {
        if (!client.user)
            return;
        client.to(`task-${data.taskId}`).emit('task:edit:typing', {
            userId: client.user.id,
            userName: client.user.firstName + ' ' + client.user.lastName,
            taskId: data.taskId,
            field: data.field,
            content: data.content.substring(0, 100),
            timestamp: new Date(),
        });
    }
    async handleTaskEditOperation(client, data) {
        if (!client.user)
            return;
        try {
            const transformedOperation = await this.collaborationService.applyOperation(data.taskId, data.operation, data.version, client.user.id);
            client.to(`task-${data.taskId}`).emit('task:edit:operation:applied', {
                operation: transformedOperation,
                userId: client.user.id,
                taskId: data.taskId,
                newVersion: transformedOperation.version,
                timestamp: new Date(),
            });
            client.emit('task:edit:operation:confirmed', {
                operation: transformedOperation,
                taskId: data.taskId,
                newVersion: transformedOperation.version,
            });
        }
        catch (error) {
            client.emit('task:edit:operation:error', {
                error: error.message,
                taskId: data.taskId,
                operation: data.operation,
            });
        }
    }
    async handleNotificationSubscribe(client, data) {
        if (!client.user)
            return;
        await this.notificationService.subscribe(client.user.id, data.types, client.id);
        client.emit('notification:subscribed', {
            types: data.types,
            timestamp: new Date(),
        });
    }
    async broadcastToTask(taskId, event, data) {
        this.server.to(`task-${taskId}`).emit(event, data);
    }
    async broadcastToUser(userId, event, data) {
        this.server.to(`user-${userId}`).emit(event, data);
    }
    async broadcastToRoom(room, event, data) {
        this.server.to(room).emit(event, data);
    }
    async extractUserFromSocket(socket) {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token)
                return null;
            const decoded = this.validateJwtToken(token);
            if (!decoded)
                return null;
            return await this.getUserById(decoded.userId);
        }
        catch (error) {
            this.logger.error(`Token validation error: ${error.message}`);
            return null;
        }
    }
    validateJwtToken(token) {
        return null;
    }
    async getUserById(userId) {
        return null;
    }
};
exports.RealTimeGateway = RealTimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealTimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleJoinTask", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleLeaveTask", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:edit:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleTaskEditStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:edit:stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleTaskEditStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:edit:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleTaskEditTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('task:edit:operation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleTaskEditOperation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeGateway.prototype, "handleNotificationSubscribe", null);
exports.RealTimeGateway = RealTimeGateway = RealTimeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.NODE_ENV === 'development' ? /.*/ : (process.env.FRONTEND_URL || 'http://localhost:3000'),
            credentials: true,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
        namespace: '/realtime'
    }),
    __metadata("design:paramtypes", [presence_service_1.PresenceService,
        collaboration_service_1.CollaborationService,
        real_time_notification_service_1.RealTimeNotificationService])
], RealTimeGateway);
//# sourceMappingURL=real-time.gateway.js.map