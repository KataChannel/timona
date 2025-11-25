import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectMediaService } from './project-media.service';
import { PrismaService } from '../prisma/prisma.service';

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Upload Controller for Project Management
 * Handles file uploads for tasks, projects, and chat
 * 
 * Endpoints:
 * - POST /api/project/upload/task/:taskId
 * - POST /api/project/upload/project/:projectId
 * - POST /api/project/upload/chat/:messageId
 */
@Controller('api/project/upload')
@UseGuards(JwtAuthGuard)
export class ProjectUploadController {
  constructor(
    private mediaService: ProjectMediaService,
    private prisma: PrismaService,
  ) {}

  /**
   * Upload file for a task
   * POST /api/project/upload/task/:taskId
   */
  @Post('task/:taskId')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadTaskFiles(
    @Param('taskId') taskId: string,
    @UploadedFiles() files: UploadedFile[],
    @Req() request: any,
  ) {
    // Verify task exists and user has permission
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Upload files
    const uploadedFiles = [];
    for (const file of files) {
      const uploadedFile = await this.mediaService.uploadFile(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        request.user.id,
        { taskId },
      );
      uploadedFiles.push(uploadedFile);
    }

    return {
      success: true,
      files: uploadedFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: f.url,
        size: f.size,
        mimeType: f.mimeType,
        uploadedAt: f.createdAt,
      })),
    };
  }

  /**
   * Upload file for a project
   * POST /api/project/upload/project/:projectId
   */
  @Post('project/:projectId')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadProjectFiles(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: UploadedFile[],
    @Req() request: any,
  ) {
    // Verify project exists and user has permission
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Check if user is member
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: request.user.id,
        },
      },
    });

    if (!member) {
      throw new BadRequestException('You are not a member of this project');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Upload files
    const uploadedFiles = [];
    for (const file of files) {
      const uploadedFile = await this.mediaService.uploadFile(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        request.user.id,
        { projectId },
      );
      uploadedFiles.push(uploadedFile);
    }

    return {
      success: true,
      files: uploadedFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: f.url,
        size: f.size,
        mimeType: f.mimeType,
        uploadedAt: f.createdAt,
      })),
    };
  }

  /**
   * Upload file for chat message
   * POST /api/project/upload/chat/:messageId
   */
  @Post('chat/:messageId')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadChatFiles(
    @Param('messageId') messageId: string,
    @UploadedFiles() files: UploadedFile[],
    @Req() request: any,
  ) {
    // Verify message exists
    const message = await this.prisma.chatMessagePM.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new BadRequestException('Message not found');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Upload files
    const uploadedFiles = [];
    for (const file of files) {
      const uploadedFile = await this.mediaService.uploadFile(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        request.user.id,
        { messageId },
      );
      uploadedFiles.push(uploadedFile);
    }

    return {
      success: true,
      files: uploadedFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: f.url,
        size: f.size,
        mimeType: f.mimeType,
        uploadedAt: f.createdAt,
      })),
    };
  }
}


