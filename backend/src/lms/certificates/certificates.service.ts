import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate certificate when user completes a course
   */
  async generateCertificate(enrollmentId: string, userId: string) {
    // Verify enrollment exists and belongs to user
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
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Course must be completed to generate certificate');
    }

    if (enrollment.progress < 100) {
      throw new BadRequestException('All lessons must be completed');
    }

    // Check if certificate already exists
    const existing = await this.prisma.certificate.findUnique({
      where: { enrollmentId },
    });

    if (existing) {
      return existing;
    }

    // Generate unique certificate number
    const certificateNumber = await this.generateCertificateNumber();

    // Create certificate
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

  /**
   * Get user's certificates
   */
  async getMyCertificates(userId: string) {
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

  /**
   * Get single certificate
   */
  async getCertificate(id: string, userId: string) {
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
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.userId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    return certificate;
  }

  /**
   * Verify certificate by number (public endpoint)
   */
  async verifyCertificate(certificateNumber: string) {
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
      throw new NotFoundException('Certificate not found');
    }

    return {
      valid: true,
      certificate,
    };
  }

  /**
   * Generate unique certificate number
   */
  private async generateCertificateNumber(): Promise<string> {
    const prefix = 'LMS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const number = `${prefix}-${timestamp}-${random}`;

    // Ensure uniqueness
    const existing = await this.prisma.certificate.findUnique({
      where: { certificateNumber: number },
    });

    if (existing) {
      return this.generateCertificateNumber(); // Recursive retry
    }

    return number;
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats(userId: string) {
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
}
