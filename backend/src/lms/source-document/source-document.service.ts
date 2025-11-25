import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../ai/gemini.service';
import { NotificationService } from '../../services/notification.service';
import { PushNotificationService } from '../../services/push-notification.service';
import {
  CreateSourceDocumentInput,
  UpdateSourceDocumentInput,
  SourceDocumentFilterInput,
  LinkDocumentToCourseInput,
  UpdateCourseDocumentLinkInput,
} from './dto/source-document.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SourceDocumentService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
    private notificationService: NotificationService,
    private pushNotificationService: PushNotificationService,
  ) {}

  // Helper method to convert BigInt to Number for GraphQL
  private transformDocument(doc: any) {
    if (!doc) return doc;
    return {
      ...doc,
      fileSize: doc.fileSize ? Number(doc.fileSize) : null,
    };
  }

  // ============== CRUD Operations ==============

  async create(userId: string, input: CreateSourceDocumentInput) {
    // Log input for debugging
    console.log('📄 Creating source document:', {
      title: input.title,
      type: input.type,
      status: input.status,
      userId,
    });

    // Prepare data object explicitly to avoid spread issues
    const data: any = {
      title: input.title,
      type: input.type,
      status: input.status,
      userId,
      fileSize: input.fileSize ? BigInt(input.fileSize) : null,
    };

    // Add optional fields only if they exist
    if (input.description) data.description = input.description;
    if (input.url) data.url = input.url;
    if (input.content) data.content = input.content;
    if (input.fileName) data.fileName = input.fileName;
    if (input.mimeType) data.mimeType = input.mimeType;
    if (input.duration) data.duration = input.duration;
    if (input.thumbnailUrl) data.thumbnailUrl = input.thumbnailUrl;
    if (input.categoryId) data.categoryId = input.categoryId;
    if (input.tags?.length) data.tags = input.tags;

    // Set publishedAt if status is PUBLISHED
    if (input.status === 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    console.log('💾 Prisma create data:', JSON.stringify(data, null, 2));

    const document = await this.prisma.sourceDocument.create({
      data,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return this.transformDocument(document);
  }

  async findAll(filter?: SourceDocumentFilterInput, page = 1, limit = 20) {
    const where: Prisma.SourceDocumentWhereInput = {};

    if (filter) {
      if (filter.types?.length) {
        where.type = { in: filter.types };
      }
      if (filter.statuses?.length) {
        where.status = { in: filter.statuses };
      }
      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }
      if (filter.userId) {
        where.userId = filter.userId;
      }
      if (filter.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
          { content: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
      if (filter.tags?.length) {
        where.tags = { hasSome: filter.tags };
      }
      if (filter.isAiAnalyzed !== undefined) {
        where.isAiAnalyzed = filter.isAiAnalyzed;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.sourceDocument.findMany({
        where,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sourceDocument.count({ where }),
    ]);

    return {
      items: items.map((item) => this.transformDocument(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.sourceDocument.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Source document with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.sourceDocument.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.transformDocument(document);
  }

  async update(id: string, input: UpdateSourceDocumentInput) {
    const existing = await this.findOne(id); // Check exists

    // Prepare update data
    const data: any = {
      ...input,
      fileSize: input.fileSize ? BigInt(input.fileSize) : undefined,
    };

    // Set publishedAt if status changes to PUBLISHED and it wasn't published before
    if (input.status === 'PUBLISHED' && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await this.prisma.sourceDocument.update({
      where: { id },
      data,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    return this.transformDocument(updated);
  }

  async delete(id: string) {
    await this.findOne(id); // Check exists

    return this.prisma.sourceDocument.delete({
      where: { id },
    });
  }

  // ============== Course Linking ==============

  async linkToCourse(userId: string, input: LinkDocumentToCourseInput) {
    // Check if link already exists
    const existing = await this.prisma.courseSourceDocument.findUnique({
      where: {
        courseId_documentId: {
          courseId: input.courseId,
          documentId: input.documentId,
        },
      },
    });

    if (existing) {
      throw new Error('Document already linked to this course');
    }

    // Create link
    const link = await this.prisma.courseSourceDocument.create({
      data: {
        ...input,
        addedBy: userId,
      },
      include: {
        document: {
          include: {
            category: true,
          },
        },
      },
    });

    // Increment usage count
    await this.prisma.sourceDocument.update({
      where: { id: input.documentId },
      data: { usageCount: { increment: 1 } },
    });

    return link;
  }

  async unlinkFromCourse(courseId: string, documentId: string) {
    const link = await this.prisma.courseSourceDocument.findUnique({
      where: {
        courseId_documentId: {
          courseId,
          documentId,
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    await this.prisma.courseSourceDocument.delete({
      where: { id: link.id },
    });

    // Decrement usage count
    await this.prisma.sourceDocument.update({
      where: { id: documentId },
      data: { usageCount: { decrement: 1 } },
    });

    return { success: true };
  }

  async updateCourseLink(
    id: string,
    input: UpdateCourseDocumentLinkInput,
  ) {
    return this.prisma.courseSourceDocument.update({
      where: { id },
      data: input,
      include: {
        document: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async getCourseDocuments(courseId: string) {
    return this.prisma.courseSourceDocument.findMany({
      where: { courseId },
      include: {
        document: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // ============== Stats & Analytics ==============

  async incrementDownloadCount(id: string) {
    const updated = await this.prisma.sourceDocument.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    return this.transformDocument(updated);
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, byType, byStatus, recentlyAdded] = await Promise.all([
      this.prisma.sourceDocument.count({ where }),
      this.prisma.sourceDocument.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.sourceDocument.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.sourceDocument.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      byType,
      byStatus,
      recentlyAdded,
    };
  }

  // ============== AI Analysis ==============

  async analyzeDocument(id: string): Promise<any> {
    const document = await this.findOne(id);

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Get content based on type
    let contentToAnalyze = '';
    
    if (document.type === 'TEXT' && document.content) {
      contentToAnalyze = document.content;
    } else if (document.description) {
      // Fallback to description if no text content
      contentToAnalyze = `${document.title}\n\n${document.description}`;
    } else {
      throw new Error('No content available for analysis');
    }

    // Analyze with Gemini
    const analysis = await this.geminiService.analyzeDocument(
      contentToAnalyze,
      document.type,
    );

    // Update document with analysis results
    const updated = await this.prisma.sourceDocument.update({
      where: { id },
      data: {
        aiSummary: analysis.summary,
        aiKeywords: analysis.keywords,
        aiTopics: analysis.topics,
        isAiAnalyzed: true,
        aiAnalyzedAt: new Date(),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.transformDocument(updated);
  }

  async bulkAnalyze(userId?: string): Promise<{ analyzed: number; failed: number }> {
    const where: Prisma.SourceDocumentWhereInput = {
      isAiAnalyzed: false,
      type: 'TEXT', // Only analyze text documents for now
      ...(userId && { userId }),
    };

    const documents = await this.prisma.sourceDocument.findMany({
      where,
      take: 10, // Limit to 10 at a time to avoid rate limits
    });

    let analyzed = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        await this.analyzeDocument(doc.id);
        analyzed++;
      } catch (error) {
        console.error(`Failed to analyze document ${doc.id}:`, error);
        failed++;
      }
    }

    return { analyzed, failed };
  }

  // ============== Approval Workflow ==============

  /**
   * Request approval for a source document (Instructor -> Admin)
   */
  async requestApproval(documentId: string, userId: string) {
    const document = await this.findOne(documentId);

    if (document.userId !== userId) {
      throw new Error('You do not have permission to request approval for this document');
    }

    if (document.status !== 'DRAFT') {
      throw new Error('Only draft documents can be submitted for approval');
    }

    if (document.approvalRequested) {
      throw new Error('Approval already requested for this document');
    }

    // Update document
    const updated = await this.prisma.sourceDocument.update({
      where: { id: documentId },
      data: {
        approvalRequested: true,
        approvalRequestedAt: new Date(),
        approvalRequestedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get instructor info
    const instructor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, firstName: true, lastName: true },
    });

    const instructorName = instructor?.firstName && instructor?.lastName
      ? `${instructor.firstName} ${instructor.lastName}`
      : instructor?.username || 'Giảng viên';

    // Send notification to all admins
    const admins = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'ADMIN',
            },
          },
        },
      },
      select: { id: true },
    });

    // Send notification and push to each admin
    for (const admin of admins) {
      try {
        await this.notificationService.create({
          userId: admin.id,
          title: 'Yêu cầu phê duyệt tài liệu',
          message: `${instructorName} đã gửi yêu cầu phê duyệt tài liệu "${updated.title}"`,
          type: 'SYSTEM',
          data: {
            documentId: updated.id,
            documentTitle: updated.title,
            instructorId: userId,
            instructorName,
            type: 'document_approval_request',
          },
        });

        // Send push notification
        await this.pushNotificationService.sendToUser(admin.id, {
          title: 'Yêu cầu phê duyệt tài liệu',
          message: `${instructorName} đã gửi yêu cầu phê duyệt tài liệu "${updated.title}"`,
          url: `/admin/lms/documents/approvals`,
          data: {
            documentId: updated.id,
            type: 'document_approval_request',
          },
        });
      } catch (error) {
        console.error(`Failed to notify admin ${admin.id}:`, error);
      }
    }

    return this.transformDocument(updated);
  }

  /**
   * Approve a source document (Admin only)
   */
  async approveDocument(documentId: string, adminUserId: string) {
    const document = await this.findOne(documentId);

    if (!document.approvalRequested) {
      throw new Error('No approval request found for this document');
    }

    if (document.status === 'PUBLISHED') {
      throw new Error('Document is already published');
    }

    // Update document to PUBLISHED
    const updated = await this.prisma.sourceDocument.update({
      where: { id: documentId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        approvedBy: adminUserId,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.transformDocument(updated);
  }

  /**
   * Reject a source document approval request (Admin only)
   */
  async rejectDocument(documentId: string, adminUserId: string, reason: string) {
    const document = await this.findOne(documentId);

    if (!document.approvalRequested) {
      throw new Error('No approval request found for this document');
    }

    // Reset approval request
    const updated = await this.prisma.sourceDocument.update({
      where: { id: documentId },
      data: {
        approvalRequested: false,
        approvalRequestedAt: null,
        rejectionReason: reason,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.transformDocument(updated);
  }
}
