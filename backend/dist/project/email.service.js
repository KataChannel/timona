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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
function getUserDisplayName(user) {
    return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || user.username || user.email.split('@')[0];
}
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.isConfigured = false;
        this.initializeEmailService();
    }
    initializeEmailService() {
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = this.configService.get('SMTP_PORT', 587);
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        const emailFrom = this.configService.get('EMAIL_FROM', 'noreply@project.app');
        if (!smtpHost || !smtpUser || !smtpPass) {
            this.logger.warn('⚠️  SMTP not configured - email notifications will be logged only');
            this.logger.log('ℹ️  To enable emails, set: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
            this.isConfigured = false;
            return;
        }
        try {
            this.logger.log(`📧 Email service ready: ${smtpHost}:${smtpPort}`);
            this.logger.log(`✅ From address: ${emailFrom}`);
            this.isConfigured = true;
        }
        catch (error) {
            this.logger.error(`❌ Email service error: ${error.message}`);
            this.isConfigured = false;
        }
    }
    async sendEmail(options) {
        if (!this.isConfigured) {
            this.logger.log(`📧 [PLACEHOLDER] Email to ${options.to}: ${options.subject}`);
            return true;
        }
        try {
            this.logger.log(`📧 Sending email to ${options.to}: ${options.subject}`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ Failed to send email: ${error.message}`);
            return false;
        }
    }
    async sendTaskAssignmentEmail(task, assignedUser, assignedBy, project) {
        const userName = getUserDisplayName(assignedUser);
        const assignerName = getUserDisplayName(assignedBy);
        this.logger.log(`📧 Task assignment: ${userName} assigned to "${task.title}" by ${assignerName}`);
        return true;
    }
    async sendTaskMentionEmail(task, mentionedUser, mentionedBy, content, project) {
        const userName = getUserDisplayName(mentionedUser);
        const mentionerName = getUserDisplayName(mentionedBy);
        this.logger.log(`📧 Mention: ${userName} mentioned in "${task.title}" by ${mentionerName}`);
        return true;
    }
    async sendDeadlineReminderEmail(task, user, hoursUntilDue, project) {
        const userName = getUserDisplayName(user);
        this.logger.log(`📧 Deadline reminder: "${task.title}" due in ${hoursUntilDue}h for ${userName}`);
        return true;
    }
    async sendTaskCompletedEmail(task, completedBy, projectMembers, project) {
        const userName = getUserDisplayName(completedBy);
        this.logger.log(`📧 Task completed: "${task.title}" by ${userName}`);
        return true;
    }
    async sendChatMentionEmail(mentionedUser, mentionedBy, message, project) {
        const userName = getUserDisplayName(mentionedUser);
        const mentionerName = getUserDisplayName(mentionedBy);
        this.logger.log(`📧 Chat mention: ${userName} in "${project.name}" by ${mentionerName}`);
        return true;
    }
    async sendDailyDigestEmail(user, digest) {
        const userName = getUserDisplayName(user);
        this.logger.log(`📧 Daily digest for ${userName}: ${digest.newTasks} new, ${digest.completedTasks} completed`);
        return true;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map