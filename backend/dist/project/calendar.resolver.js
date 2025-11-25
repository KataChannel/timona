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
exports.CalendarResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let CalendarResolver = class CalendarResolver {
    constructor(calendarService) {
        this.calendarService = calendarService;
    }
    async getCalendarTasks(userId, startDate, endDate, projectId) {
        const data = await this.calendarService.getCalendarTasks(userId, startDate, endDate, projectId);
        return JSON.stringify(data);
    }
    async getMonthView(userId, year, month, projectId) {
        const data = await this.calendarService.getMonthView(userId, year, month, projectId);
        return JSON.stringify(data);
    }
    async getWeekView(userId, startDate, projectId) {
        const data = await this.calendarService.getWeekView(userId, startDate, projectId);
        return JSON.stringify(data);
    }
    async exportICalendar(userId, projectId) {
        return await this.calendarService.generateICalExport(userId, projectId);
    }
    async getUpcomingTasks(userId, hours) {
        const tasks = await this.calendarService.getUpcomingTasks(userId, hours);
        return JSON.stringify(tasks);
    }
    async getCalendarStatistics(userId, startDate, endDate, projectId) {
        const stats = await this.calendarService.getCalendarStatistics(userId, startDate, endDate, projectId);
        return JSON.stringify(stats);
    }
};
exports.CalendarResolver = CalendarResolver;
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'calendarTasks',
        description: 'Get tasks for calendar view (returned as JSON string)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('startDate')),
    __param(2, (0, graphql_1.Args)('endDate')),
    __param(3, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getCalendarTasks", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'calendarMonthView',
        description: 'Get month view for calendar',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('year')),
    __param(2, (0, graphql_1.Args)('month')),
    __param(3, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getMonthView", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'calendarWeekView',
        description: 'Get week view for calendar',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('startDate')),
    __param(2, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getWeekView", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'exportICalendar',
        description: 'Export tasks as iCal format (.ics file)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "exportICalendar", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'upcomingTasks',
        description: 'Get upcoming tasks for reminders',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('hours', { defaultValue: 24 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getUpcomingTasks", null);
__decorate([
    (0, graphql_1.Query)(() => String, {
        name: 'calendarStatistics',
        description: 'Get calendar statistics for a period',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, graphql_1.Args)('startDate')),
    __param(2, (0, graphql_1.Args)('endDate')),
    __param(3, (0, graphql_1.Args)('projectId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, String]),
    __metadata("design:returntype", Promise)
], CalendarResolver.prototype, "getCalendarStatistics", null);
exports.CalendarResolver = CalendarResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService])
], CalendarResolver);
//# sourceMappingURL=calendar.resolver.js.map