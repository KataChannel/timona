import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Task, User, Project } from '@prisma/client';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Helper to get user display name
function getUserDisplayName(user: User): string {
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.lastName || user.username || user.email.split('@')[0];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    this.initializeEmailService();
  }

  /**
   * Initialize email transporter from environment variables
   * Environment variables needed:
   * - SMTP_HOST: SMTP server host (e.g., smtp.gmail.com)
   * - SMTP_PORT: SMTP port (default: 587)
   * - SMTP_USER: SMTP username
   * - SMTP_PASS: SMTP password or app password
   * - EMAIL_FROM: From email address (default: noreply@project.app)
   */
  private initializeEmailService() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@project.app');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('⚠️  SMTP not configured - email notifications will be logged only');
      this.logger.log('ℹ️  To enable emails, set: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      this.isConfigured = false;
      return;
    }

    try {
      // Configuration validated - ready for nodemailer integration
      this.logger.log(`📧 Email service ready: ${smtpHost}:${smtpPort}`);
      this.logger.log(`✅ From address: ${emailFrom}`);
      this.isConfigured = true;
    } catch (error) {
      this.logger.error(`❌ Email service error: ${error.message}`);
      this.isConfigured = false;
    }
  }

  /**
   * Send generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.log(`📧 [PLACEHOLDER] Email to ${options.to}: ${options.subject}`);
      return true;
    }

    try {
      // When nodemailer is installed, real sending will happen here
      this.logger.log(`📧 Sending email to ${options.to}: ${options.subject}`);
      // TODO: Implement actual sending with nodemailer
      // await this.transporter.sendMail(options);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send task assignment notification
   */
  async sendTaskAssignmentEmail(
    task: Task,
    assignedUser: User,
    assignedBy: User,
    project?: Project,
  ): Promise<boolean> {
    const userName = getUserDisplayName(assignedUser);
    const assignerName = getUserDisplayName(assignedBy);
    
    this.logger.log(`📧 Task assignment: ${userName} assigned to "${task.title}" by ${assignerName}`);
    return true; // Placeholder
  }

  /**
   * Send task mention notification
   */
  async sendTaskMentionEmail(
    task: Task,
    mentionedUser: User,
    mentionedBy: User,
    content: string,
    project?: Project,
  ): Promise<boolean> {
    const userName = getUserDisplayName(mentionedUser);
    const mentionerName = getUserDisplayName(mentionedBy);
    
    this.logger.log(`📧 Mention: ${userName} mentioned in "${task.title}" by ${mentionerName}`);
    return true; // Placeholder
  }

  /**
   * Send task deadline reminder
   */
  async sendDeadlineReminderEmail(
    task: Task,
    user: User,
    hoursUntilDue: number,
    project?: Project,
  ): Promise<boolean> {
    const userName = getUserDisplayName(user);
    
    this.logger.log(`📧 Deadline reminder: "${task.title}" due in ${hoursUntilDue}h for ${userName}`);
    return true; // Placeholder
  }

  /**
   * Send task completed notification
   */
  async sendTaskCompletedEmail(
    task: Task,
    completedBy: User,
    projectMembers: User[],
    project?: Project,
  ): Promise<boolean> {
    const userName = getUserDisplayName(completedBy);
    
    this.logger.log(`📧 Task completed: "${task.title}" by ${userName}`);
    return true; // Placeholder
  }

  /**
   * Send project chat mention notification
   */
  async sendChatMentionEmail(
    mentionedUser: User,
    mentionedBy: User,
    message: string,
    project: Project,
  ): Promise<boolean> {
    const userName = getUserDisplayName(mentionedUser);
    const mentionerName = getUserDisplayName(mentionedBy);
    
    this.logger.log(`📧 Chat mention: ${userName} in "${project.name}" by ${mentionerName}`);
    return true; // Placeholder
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigestEmail(
    user: User,
    digest: {
      newTasks: number;
      completedTasks: number;
      upcomingDeadlines: Task[];
      mentions: number;
    },
  ): Promise<boolean> {
    const userName = getUserDisplayName(user);
    
    this.logger.log(`📧 Daily digest for ${userName}: ${digest.newTasks} new, ${digest.completedTasks} completed`);
    return true; // Placeholder
  }
}
