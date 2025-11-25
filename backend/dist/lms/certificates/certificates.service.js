"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let CertificatesService = class CertificatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCertificate(enrollmentId, userId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        instructor: {
                            select: {
                                firstName: true,
                                lastName: true,
                                username: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        if (enrollment.userId !== userId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        if (enrollment.status !== client_1.EnrollmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Course must be completed to generate certificate');
        }
        if (enrollment.progress < 100) {
            throw new common_1.BadRequestException('All lessons must be completed');
        }
        const existing = await this.prisma.certificate.findUnique({
            where: { enrollmentId },
        });
        if (existing) {
            return existing;
        }
        const certificateNumber = await this.generateCertificateNumber();
        const certificate = await this.prisma.certificate.create({
            data: {
                enrollmentId,
                userId,
                courseId: enrollment.courseId,
                certificateNumber,
                courseName: enrollment.course.title,
                instructorName: `${enrollment.course.instructor.firstName || ''} ${enrollment.course.instructor.lastName || enrollment.course.instructor.username}`.trim(),
                completionDate: enrollment.completedAt || new Date(),
                verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${certificateNumber}`,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        slug: true,
                        thumbnail: true,
                    },
                },
            },
        });
        return certificate;
    }
    async getMyCertificates(userId) {
        return this.prisma.certificate.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        title: true,
                        slug: true,
                        thumbnail: true,
                    },
                },
            },
            orderBy: { issueDate: 'desc' },
        });
    }
    async getCertificate(id, userId) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        slug: true,
                        thumbnail: true,
                        duration: true,
                    },
                },
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        if (certificate.userId !== userId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        return certificate;
    }
    async verifyCertificate(certificateNumber) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { certificateNumber },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                        thumbnail: true,
                    },
                },
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        return {
            valid: true,
            certificate,
        };
    }
    async generateCertificateNumber() {
        const prefix = 'LMS';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        const number = `${prefix}-${timestamp}-${random}`;
        const existing = await this.prisma.certificate.findUnique({
            where: { certificateNumber: number },
        });
        if (existing) {
            return this.generateCertificateNumber();
        }
        return number;
    }
    async getCertificateStats(userId) {
        const [total, thisMonth, thisYear] = await Promise.all([
            this.prisma.certificate.count({ where: { userId } }),
            this.prisma.certificate.count({
                where: {
                    userId,
                    issueDate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            this.prisma.certificate.count({
                where: {
                    userId,
                    issueDate: {
                        gte: new Date(new Date().getFullYear(), 0, 1),
                    },
                },
            }),
        ]);
        return {
            total,
            thisMonth,
            thisYear,
        };
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map