import { PrismaService } from '../../prisma/prisma.service';
export declare class CertificatesService {
    private prisma;
    constructor(prisma: PrismaService);
    generateCertificate(enrollmentId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        grade: string | null;
        issueDate: Date;
        courseId: string;
        enrollmentId: string;
        certificateNumber: string;
        courseName: string;
        instructorName: string;
        completionDate: Date;
        verificationUrl: string | null;
    }>;
    getMyCertificates(userId: string): Promise<({
        course: {
            title: string;
            slug: string;
            thumbnail: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        grade: string | null;
        issueDate: Date;
        courseId: string;
        enrollmentId: string;
        certificateNumber: string;
        courseName: string;
        instructorName: string;
        completionDate: Date;
        verificationUrl: string | null;
    })[]>;
    getCertificate(id: string, userId: string): Promise<{
        user: {
            username: string;
            firstName: string;
            lastName: string;
        };
        course: {
            title: string;
            slug: string;
            thumbnail: string;
            duration: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        grade: string | null;
        issueDate: Date;
        courseId: string;
        enrollmentId: string;
        certificateNumber: string;
        courseName: string;
        instructorName: string;
        completionDate: Date;
        verificationUrl: string | null;
    }>;
    verifyCertificate(certificateNumber: string): Promise<{
        valid: boolean;
        certificate: {
            user: {
                username: string;
                firstName: string;
                lastName: string;
            };
            course: {
                title: string;
                thumbnail: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            grade: string | null;
            issueDate: Date;
            courseId: string;
            enrollmentId: string;
            certificateNumber: string;
            courseName: string;
            instructorName: string;
            completionDate: Date;
            verificationUrl: string | null;
        };
    }>;
    private generateCertificateNumber;
    getCertificateStats(userId: string): Promise<{
        total: number;
        thisMonth: number;
        thisYear: number;
    }>;
}
