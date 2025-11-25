import { ConfigService } from '@nestjs/config';
import { Task, User, Project } from '@prisma/client';
interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    private isConfigured;
    constructor(configService: ConfigService);
    private initializeEmailService;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendTaskAssignmentEmail(task: Task, assignedUser: User, assignedBy: User, project?: Project): Promise<boolean>;
    sendTaskMentionEmail(task: Task, mentionedUser: User, mentionedBy: User, content: string, project?: Project): Promise<boolean>;
    sendDeadlineReminderEmail(task: Task, user: User, hoursUntilDue: number, project?: Project): Promise<boolean>;
    sendTaskCompletedEmail(task: Task, completedBy: User, projectMembers: User[], project?: Project): Promise<boolean>;
    sendChatMentionEmail(mentionedUser: User, mentionedBy: User, message: string, project: Project): Promise<boolean>;
    sendDailyDigestEmail(user: User, digest: {
        newTasks: number;
        completedTasks: number;
        upcomingDeadlines: Task[];
        mentions: number;
    }): Promise<boolean>;
}
export {};
