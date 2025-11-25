import { OnboardingStatus } from './enums.model';
export declare class OnboardingChecklist {
    id: string;
    employeeProfileId: string;
    userId: string;
    checklistTemplate?: string;
    tasks: any;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    status: OnboardingStatus;
    startDate: Date;
    targetDate?: Date;
    actualCompletionDate?: Date;
    assignedTo?: string;
    buddyId?: string;
    remindersSent: number;
    lastReminderAt?: Date;
    employeeFeedback?: string;
    managerFeedback?: string;
    hrNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}
