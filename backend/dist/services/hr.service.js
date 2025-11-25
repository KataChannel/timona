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
var HRService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_model_1 = require("../graphql/models/hr/enums.model");
let HRService = HRService_1 = class HRService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(HRService_1.name);
    }
    async createEmployeeProfile(input) {
        this.logger.log(`Creating employee profile for user: ${input.userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: input.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${input.userId} not found`);
        }
        const existingProfile = await this.prisma.employeeProfile.findUnique({
            where: { userId: input.userId },
        });
        if (existingProfile) {
            throw new common_1.BadRequestException(`Employee profile already exists for user ${input.userId}`);
        }
        const existingCode = await this.prisma.employeeProfile.findUnique({
            where: { employeeCode: input.employeeCode },
        });
        if (existingCode) {
            throw new common_1.BadRequestException(`Employee code ${input.employeeCode} already exists`);
        }
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
    async getEmployeeProfile(id) {
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
            throw new common_1.NotFoundException(`Employee profile with ID ${id} not found`);
        }
        return profile;
    }
    async getEmployeeProfileByUserId(userId) {
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
            throw new common_1.NotFoundException(`Employee profile for user ${userId} not found`);
        }
        return profile;
    }
    async getEmployeeProfileByCode(employeeCode) {
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
            throw new common_1.NotFoundException(`Employee with code ${employeeCode} not found`);
        }
        return profile;
    }
    async listEmployeeProfiles(filters) {
        const where = {};
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
    async updateEmployeeProfile(id, input) {
        this.logger.log(`Updating employee profile: ${id}`);
        const existing = await this.prisma.employeeProfile.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee profile with ID ${id} not found`);
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
    async deleteEmployeeProfile(id) {
        const existing = await this.prisma.employeeProfile.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee profile with ID ${id} not found`);
        }
        await this.prisma.employeeProfile.delete({
            where: { id },
        });
        this.logger.log(`Employee profile deleted: ${id}`);
        return { success: true, message: 'Employee profile deleted successfully' };
    }
    async createEmploymentHistory(input) {
        this.logger.log(`Creating employment history for employee: ${input.employeeProfileId}`);
        const profile = await this.prisma.employeeProfile.findUnique({
            where: { id: input.employeeProfileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
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
    async getEmploymentHistory(employeeProfileId) {
        return this.prisma.employmentHistory.findMany({
            where: { employeeProfileId },
            orderBy: { eventDate: 'desc' },
        });
    }
    async updateEmploymentHistory(id, input) {
        const existing = await this.prisma.employmentHistory.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employment history with ID ${id} not found`);
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
    async createOnboardingChecklist(input) {
        this.logger.log(`Creating onboarding checklist for employee: ${input.employeeProfileId}`);
        const profile = await this.prisma.employeeProfile.findUnique({
            where: { id: input.employeeProfileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
        }
        const existing = await this.prisma.onboardingChecklist.findUnique({
            where: { employeeProfileId: input.employeeProfileId },
        });
        if (existing) {
            throw new common_1.BadRequestException(`Onboarding checklist already exists for employee ${input.employeeProfileId}`);
        }
        const checklist = await this.prisma.onboardingChecklist.create({
            data: {
                ...input,
                startDate: new Date(input.startDate),
                targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
                status: enums_model_1.OnboardingStatus.PENDING,
            },
            include: {
                employeeProfile: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        await this.createEmploymentHistory({
            employeeProfileId: input.employeeProfileId,
            userId: input.userId,
            eventType: enums_model_1.EmploymentEventType.ONBOARDING,
            eventDate: input.startDate,
            effectiveDate: input.startDate,
            notes: `Onboarding process initiated`,
            processedBy: input.createdBy,
        });
        this.logger.log(`Onboarding checklist created with ID: ${checklist.id}`);
        return checklist;
    }
    async getOnboardingChecklist(id) {
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
            throw new common_1.NotFoundException(`Onboarding checklist with ID ${id} not found`);
        }
        return checklist;
    }
    async getOnboardingChecklistByEmployee(employeeProfileId) {
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
            throw new common_1.NotFoundException(`Onboarding checklist for employee ${employeeProfileId} not found`);
        }
        return checklist;
    }
    async listOnboardingChecklists(filters) {
        const where = {};
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
    async updateOnboardingChecklist(id, input) {
        this.logger.log(`Updating onboarding checklist: ${id}`);
        const existing = await this.prisma.onboardingChecklist.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Onboarding checklist with ID ${id} not found`);
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
    async completeOnboardingTask(checklistId, taskId, completedBy) {
        const checklist = await this.prisma.onboardingChecklist.findUnique({
            where: { id: checklistId },
        });
        if (!checklist) {
            throw new common_1.NotFoundException(`Onboarding checklist with ID ${checklistId} not found`);
        }
        const tasks = checklist.tasks;
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) {
            throw new common_1.NotFoundException(`Task with ID ${taskId} not found in checklist`);
        }
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            completed: true,
            completedAt: new Date().toISOString(),
            completedBy,
        };
        const completedCount = tasks.filter((t) => t.completed).length;
        const progressPercentage = (completedCount / tasks.length) * 100;
        return this.prisma.onboardingChecklist.update({
            where: { id: checklistId },
            data: {
                tasks,
                completedTasks: completedCount,
                progressPercentage,
                status: progressPercentage === 100 ? enums_model_1.OnboardingStatus.COMPLETED : enums_model_1.OnboardingStatus.IN_PROGRESS,
                actualCompletionDate: progressPercentage === 100 ? new Date() : undefined,
            },
        });
    }
    async createOffboardingProcess(input) {
        this.logger.log(`Creating offboarding process for employee: ${input.employeeProfileId}`);
        const profile = await this.prisma.employeeProfile.findUnique({
            where: { id: input.employeeProfileId },
        });
        if (!profile) {
            throw new common_1.NotFoundException(`Employee profile with ID ${input.employeeProfileId} not found`);
        }
        const process = await this.prisma.offboardingProcess.create({
            data: {
                ...input,
                lastWorkingDay: new Date(input.lastWorkingDay),
                effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
                noticeGivenDate: input.noticeGivenDate ? new Date(input.noticeGivenDate) : undefined,
                exitInterviewDate: input.exitInterviewDate ? new Date(input.exitInterviewDate) : undefined,
                status: enums_model_1.OffboardingStatus.INITIATED,
                clearanceStatus: enums_model_1.ClearanceStatus.PENDING,
            },
            include: {
                employeeProfile: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        await this.createEmploymentHistory({
            employeeProfileId: input.employeeProfileId,
            userId: input.userId,
            eventType: enums_model_1.EmploymentEventType.OFFBOARDING,
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
    async getOffboardingProcess(id) {
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
            throw new common_1.NotFoundException(`Offboarding process with ID ${id} not found`);
        }
        return process;
    }
    async listOffboardingProcesses(filters) {
        const where = {};
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
    async updateOffboardingProcess(id, input) {
        this.logger.log(`Updating offboarding process: ${id}`);
        const existing = await this.prisma.offboardingProcess.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Offboarding process with ID ${id} not found`);
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
    async completeOffboarding(id, completedBy) {
        const process = await this.prisma.offboardingProcess.findUnique({
            where: { id },
        });
        if (!process) {
            throw new common_1.NotFoundException(`Offboarding process with ID ${id} not found`);
        }
        if (process.clearanceStatus !== enums_model_1.ClearanceStatus.COMPLETE) {
            throw new common_1.BadRequestException('Cannot complete offboarding with incomplete clearance');
        }
        const updated = await this.prisma.offboardingProcess.update({
            where: { id },
            data: {
                status: enums_model_1.OffboardingStatus.COMPLETED,
                completedAt: new Date(),
                completedBy,
            },
        });
        await this.prisma.employeeProfile.update({
            where: { id: process.employeeProfileId },
            data: { isActive: false },
        });
        await this.prisma.user.update({
            where: { id: process.userId },
            data: { isActive: false },
        });
        this.logger.log(`Offboarding process completed: ${id}`);
        return updated;
    }
    async getHRStatistics() {
        const [totalEmployees, activeEmployees, pendingOnboarding, inProgressOnboarding, pendingOffboarding, inProgressOffboarding,] = await Promise.all([
            this.prisma.employeeProfile.count(),
            this.prisma.employeeProfile.count({ where: { isActive: true } }),
            this.prisma.onboardingChecklist.count({ where: { status: enums_model_1.OnboardingStatus.PENDING } }),
            this.prisma.onboardingChecklist.count({ where: { status: enums_model_1.OnboardingStatus.IN_PROGRESS } }),
            this.prisma.offboardingProcess.count({ where: { status: enums_model_1.OffboardingStatus.INITIATED } }),
            this.prisma.offboardingProcess.count({ where: { status: enums_model_1.OffboardingStatus.IN_PROGRESS } }),
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
};
exports.HRService = HRService;
exports.HRService = HRService = HRService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HRService);
//# sourceMappingURL=hr.service.js.map