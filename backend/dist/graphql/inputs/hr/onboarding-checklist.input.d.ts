import { OnboardingStatus } from '../../models/hr/enums.model';
export declare class CreateOnboardingChecklistInput {
    employeeProfileId: string;
    userId: string;
    checklistTemplate?: string;
    tasks: any;
    totalTasks?: number;
    startDate: string;
    targetDate?: string;
    assignedTo?: string;
    buddyId?: string;
    hrNotes?: string;
    createdBy?: string;
}
export declare class UpdateOnboardingChecklistInput {
    checklistTemplate?: string;
    tasks?: any;
    totalTasks?: number;
    completedTasks?: number;
    progressPercentage?: number;
    status?: OnboardingStatus;
    startDate?: string;
    targetDate?: string;
    actualCompletionDate?: string;
    assignedTo?: string;
    buddyId?: string;
    employeeFeedback?: string;
    managerFeedback?: string;
    hrNotes?: string;
}
