import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeeProfileInput,
  UpdateEmployeeProfileInput,
  CreateEmploymentHistoryInput,
  UpdateEmploymentHistoryInput,
  CreateOnboardingChecklistInput,
  UpdateOnboardingChecklistInput,
  CreateOffboardingProcessInput,
  UpdateOffboardingProcessInput,
} from '../graphql/inputs/hr';
import {
  OnboardingStatus,
  OffboardingStatus,
  ClearanceStatus,
  EmploymentEventType,
} from '../graphql/models/hr/enums.model';

@Injectable()
export class HRService {
  private readonly logger = new Logger(HRService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // EMPLOYEE PROFILE METHODS
  // ============================================

  async createEmployeeProfile(input: CreateEmployeeProfileInput) {
    this.logger.log(`Creating employee profile for user: ${input.userId}`);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${input.userId} not found`);
    }

    // Check if employee profile already exists
    const existingProfile = await this.prisma.employeeProfile.findUnique({
      where: { userId: input.userId },
    });

    if (existingProfile) {
      throw new BadRequestException(`Employee profile already exists for user ${input.userId}`);
    }

    // Check if employee code is unique
    const existingCode = await this.prisma.employeeProfile.findUnique({
      where: { employeeCode: input.employeeCode },
    });

    if (existingCode) {
      throw new BadRequestException(`Employee code ${input.employeeCode} already exists`);
    }

    // Create employee profile
    const profile = await this.prisma.employeeProfile.create({
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        probationEndDate: input.probationEndDate ? new Date(input.probationEndDate) : undefined,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        citizenIdIssueDate: input.citizenIdIssueDate ? new Date(input.citizenIdIssueDate) : undefined,
        passportIssueDate: input.passportIssueDate ? new Date(input.passportIssueDate) : undefined,
        passportExpiryDate: input.passportExpiryDate ? new Date(input.passportExpiryDate) : undefined,
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Employee profile created with ID: ${profile.id}`);
    return profile;
  }

  async getEmployeeProfile(id: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isActive: true,
          },
        },
        employmentHistory: {
          orderBy: { eventDate: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        onboardingChecklist: true,
        offboardingProcesses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Employee profile with ID ${id} not found`);
    }

    return profile;
  }

  async getEmployeeProfileByUserId(userId: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isActive: true,
          },
        },
        employmentHistory: {
          orderBy: { eventDate: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        onboardingChecklist: true,
        offboardingProcesses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Employee profile for user ${userId} not found`);
    }

    return profile;
  }

  async getEmployeeProfileByCode(employeeCode: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { employeeCode },
      include: {
        user: true,
        employmentHistory: {
          orderBy: { eventDate: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Employee with code ${employeeCode} not found`);
    }

    return profile;
  }

  async listEmployeeProfiles(filters?: {
    department?: string;
    position?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.department) {
      where.department = filters.department;
    }

    if (filters?.position) {
      where.position = filters.position;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employeeProfile.findMany({
        where,
        skip: filters?.skip || 0,
        take: filters?.take || 50,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employeeProfile.count({ where }),
    ]);

    return {
      employees,
      total,
      hasMore: (filters?.skip || 0) + employees.length < total,
    };
  }

  async updateEmployeeProfile(id: string, input: UpdateEmployeeProfileInput) {
    this.logger.log(`Updating employee profile: ${id}`);

    const existing = await this.prisma.employeeProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee profile with ID ${id} not found`);
    }

    const updated = await this.prisma.employeeProfile.update({
      where: { id },
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        probationEndDate: input.probationEndDate ? new Date(input.probationEndDate) : undefined,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        citizenIdIssueDate: input.citizenIdIssueDate ? new Date(input.citizenIdIssueDate) : undefined,
        passportIssueDate: input.passportIssueDate ? new Date(input.passportIssueDate) : undefined,
        passportExpiryDate: input.passportExpiryDate ? new Date(input.passportExpiryDate) : undefined,
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Employee profile updated: ${id}`);
    return updated;
  }

  async deleteEmployeeProfile(id: string) {
    const existing = await this.prisma.employeeProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee profile with ID ${id} not found`);
    }

    await this.prisma.employeeProfile.delete({
      where: { id },
    });

    this.logger.log(`Employee profile deleted: ${id}`);
    return { success: true, message: 'Employee profile deleted successfully' };
  }

  // ============================================
  // EMPLOYMENT HISTORY METHODS
  // ============================================

  async createEmploymentHistory(input: CreateEmploymentHistoryInput) {
    this.logger.log(`Creating employment history for employee: ${input.employeeProfileId}`);

    // Verify employee profile exists
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: input.employeeProfileId },
    });

    if (!profile) {
      throw new NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
    }

    const history = await this.prisma.employmentHistory.create({
      data: {
        ...input,
        eventDate: new Date(input.eventDate),
        effectiveDate: new Date(input.effectiveDate),
        contractStartDate: input.contractStartDate ? new Date(input.contractStartDate) : undefined,
        contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : undefined,
        lastWorkingDay: input.lastWorkingDay ? new Date(input.lastWorkingDay) : undefined,
        approvedAt: input.approvedAt ? new Date(input.approvedAt) : undefined,
      },
    });

    this.logger.log(`Employment history created with ID: ${history.id}`);
    return history;
  }

  async getEmploymentHistory(employeeProfileId: string) {
    return this.prisma.employmentHistory.findMany({
      where: { employeeProfileId },
      orderBy: { eventDate: 'desc' },
    });
  }

  async updateEmploymentHistory(id: string, input: UpdateEmploymentHistoryInput) {
    const existing = await this.prisma.employmentHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employment history with ID ${id} not found`);
    }

    const updated = await this.prisma.employmentHistory.update({
      where: { id },
      data: {
        ...input,
        eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
        contractStartDate: input.contractStartDate ? new Date(input.contractStartDate) : undefined,
        contractEndDate: input.contractEndDate ? new Date(input.contractEndDate) : undefined,
        lastWorkingDay: input.lastWorkingDay ? new Date(input.lastWorkingDay) : undefined,
        approvedAt: input.approvedAt ? new Date(input.approvedAt) : undefined,
      },
    });

    return updated;
  }

  // ============================================
  // ONBOARDING METHODS
  // ============================================

  async createOnboardingChecklist(input: CreateOnboardingChecklistInput) {
    this.logger.log(`Creating onboarding checklist for employee: ${input.employeeProfileId}`);

    // Verify employee profile exists
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: input.employeeProfileId },
    });

    if (!profile) {
      throw new NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
    }

    // Check if checklist already exists
    const existing = await this.prisma.onboardingChecklist.findUnique({
      where: { employeeProfileId: input.employeeProfileId },
    });

    if (existing) {
      throw new BadRequestException(`Onboarding checklist already exists for employee ${input.employeeProfileId}`);
    }

    const checklist = await this.prisma.onboardingChecklist.create({
      data: {
        ...input,
        startDate: new Date(input.startDate),
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        status: OnboardingStatus.PENDING,
      },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create onboarding employment history event
    await this.createEmploymentHistory({
      employeeProfileId: input.employeeProfileId,
      userId: input.userId,
      eventType: EmploymentEventType.ONBOARDING,
      eventDate: input.startDate,
      effectiveDate: input.startDate,
      notes: `Onboarding process initiated`,
      processedBy: input.createdBy,
    });

    this.logger.log(`Onboarding checklist created with ID: ${checklist.id}`);
    return checklist;
  }

  async getOnboardingChecklist(id: string) {
    const checklist = await this.prisma.onboardingChecklist.findUnique({
      where: { id },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException(`Onboarding checklist with ID ${id} not found`);
    }

    return checklist;
  }

  async getOnboardingChecklistByEmployee(employeeProfileId: string) {
    const checklist = await this.prisma.onboardingChecklist.findUnique({
      where: { employeeProfileId },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException(`Onboarding checklist for employee ${employeeProfileId} not found`);
    }

    return checklist;
  }

  async listOnboardingChecklists(filters?: {
    status?: OnboardingStatus;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const [checklists, total] = await Promise.all([
      this.prisma.onboardingChecklist.findMany({
        where,
        skip: filters?.skip || 0,
        take: filters?.take || 50,
        include: {
          employeeProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.onboardingChecklist.count({ where }),
    ]);

    return {
      checklists,
      total,
      hasMore: (filters?.skip || 0) + checklists.length < total,
    };
  }

  async updateOnboardingChecklist(id: string, input: UpdateOnboardingChecklistInput) {
    this.logger.log(`Updating onboarding checklist: ${id}`);

    const existing = await this.prisma.onboardingChecklist.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Onboarding checklist with ID ${id} not found`);
    }

    const updated = await this.prisma.onboardingChecklist.update({
      where: { id },
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        actualCompletionDate: input.actualCompletionDate ? new Date(input.actualCompletionDate) : undefined,
      },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Onboarding checklist updated: ${id}`);
    return updated;
  }

  async completeOnboardingTask(checklistId: string, taskId: string, completedBy: string) {
    const checklist = await this.prisma.onboardingChecklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException(`Onboarding checklist with ID ${checklistId} not found`);
    }

    // Update task in JSON
    const tasks = checklist.tasks as any[];
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);

    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${taskId} not found in checklist`);
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy,
    };

    // Calculate progress
    const completedCount = tasks.filter((t: any) => t.completed).length;
    const progressPercentage = (completedCount / tasks.length) * 100;

    // Update checklist
    return this.prisma.onboardingChecklist.update({
      where: { id: checklistId },
      data: {
        tasks,
        completedTasks: completedCount,
        progressPercentage,
        status: progressPercentage === 100 ? OnboardingStatus.COMPLETED : OnboardingStatus.IN_PROGRESS,
        actualCompletionDate: progressPercentage === 100 ? new Date() : undefined,
      },
    });
  }

  // ============================================
  // OFFBOARDING METHODS
  // ============================================

  async createOffboardingProcess(input: CreateOffboardingProcessInput) {
    this.logger.log(`Creating offboarding process for employee: ${input.employeeProfileId}`);

    // Verify employee profile exists
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { id: input.employeeProfileId },
    });

    if (!profile) {
      throw new NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
    }

    const process = await this.prisma.offboardingProcess.create({
      data: {
        ...input,
        lastWorkingDay: new Date(input.lastWorkingDay),
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
        noticeGivenDate: input.noticeGivenDate ? new Date(input.noticeGivenDate) : undefined,
        exitInterviewDate: input.exitInterviewDate ? new Date(input.exitInterviewDate) : undefined,
        status: OffboardingStatus.INITIATED,
        clearanceStatus: ClearanceStatus.PENDING,
      },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create offboarding employment history event
    await this.createEmploymentHistory({
      employeeProfileId: input.employeeProfileId,
      userId: input.userId,
      eventType: EmploymentEventType.OFFBOARDING,
      eventDate: new Date().toISOString(),
      effectiveDate: input.lastWorkingDay,
      terminationType: input.exitType,
      terminationReason: input.exitReason,
      lastWorkingDay: input.lastWorkingDay,
      noticePeriodDays: input.noticePeriodDays,
      notes: `Offboarding process initiated`,
      processedBy: input.initiatedBy,
    });

    this.logger.log(`Offboarding process created with ID: ${process.id}`);
    return process;
  }

  async getOffboardingProcess(id: string) {
    const process = await this.prisma.offboardingProcess.findUnique({
      where: { id },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!process) {
      throw new NotFoundException(`Offboarding process with ID ${id} not found`);
    }

    return process;
  }

  async listOffboardingProcesses(filters?: {
    status?: OffboardingStatus;
    clearanceStatus?: ClearanceStatus;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clearanceStatus) {
      where.clearanceStatus = filters.clearanceStatus;
    }

    const [processes, total] = await Promise.all([
      this.prisma.offboardingProcess.findMany({
        where,
        skip: filters?.skip || 0,
        take: filters?.take || 50,
        include: {
          employeeProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.offboardingProcess.count({ where }),
    ]);

    return {
      processes,
      total,
      hasMore: (filters?.skip || 0) + processes.length < total,
    };
  }

  async updateOffboardingProcess(id: string, input: UpdateOffboardingProcessInput) {
    this.logger.log(`Updating offboarding process: ${id}`);

    const existing = await this.prisma.offboardingProcess.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Offboarding process with ID ${id} not found`);
    }

    const updated = await this.prisma.offboardingProcess.update({
      where: { id },
      data: {
        ...input,
        lastWorkingDay: input.lastWorkingDay ? new Date(input.lastWorkingDay) : undefined,
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
        noticeGivenDate: input.noticeGivenDate ? new Date(input.noticeGivenDate) : undefined,
        exitInterviewDate: input.exitInterviewDate ? new Date(input.exitInterviewDate) : undefined,
        paymentDate: input.paymentDate ? new Date(input.paymentDate) : undefined,
        finalApprovedAt: input.finalApprovedAt ? new Date(input.finalApprovedAt) : undefined,
        completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
      },
      include: {
        employeeProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Offboarding process updated: ${id}`);
    return updated;
  }

  async completeOffboarding(id: string, completedBy: string) {
    const process = await this.prisma.offboardingProcess.findUnique({
      where: { id },
    });

    if (!process) {
      throw new NotFoundException(`Offboarding process with ID ${id} not found`);
    }

    if (process.clearanceStatus !== ClearanceStatus.COMPLETE) {
      throw new BadRequestException('Cannot complete offboarding with incomplete clearance');
    }

    const updated = await this.prisma.offboardingProcess.update({
      where: { id },
      data: {
        status: OffboardingStatus.COMPLETED,
        completedAt: new Date(),
        completedBy,
      },
    });

    // Deactivate employee profile
    await this.prisma.employeeProfile.update({
      where: { id: process.employeeProfileId },
      data: { isActive: false },
    });

    // Optionally deactivate user account
    await this.prisma.user.update({
      where: { id: process.userId },
      data: { isActive: false },
    });

    this.logger.log(`Offboarding process completed: ${id}`);
    return updated;
  }

  // ============================================
  // STATISTICS & REPORTS
  // ============================================

  async getHRStatistics() {
    const [
      totalEmployees,
      activeEmployees,
      pendingOnboarding,
      inProgressOnboarding,
      pendingOffboarding,
      inProgressOffboarding,
    ] = await Promise.all([
      this.prisma.employeeProfile.count(),
      this.prisma.employeeProfile.count({ where: { isActive: true } }),
      this.prisma.onboardingChecklist.count({ where: { status: OnboardingStatus.PENDING } }),
      this.prisma.onboardingChecklist.count({ where: { status: OnboardingStatus.IN_PROGRESS } }),
      this.prisma.offboardingProcess.count({ where: { status: OffboardingStatus.INITIATED } }),
      this.prisma.offboardingProcess.count({ where: { status: OffboardingStatus.IN_PROGRESS } }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      onboarding: {
        pending: pendingOnboarding,
        inProgress: inProgressOnboarding,
        total: pendingOnboarding + inProgressOnboarding,
      },
      offboarding: {
        pending: pendingOffboarding,
        inProgress: inProgressOffboarding,
        total: pendingOffboarding + inProgressOffboarding,
      },
    };
  }
}
