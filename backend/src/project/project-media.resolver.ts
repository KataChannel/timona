import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectMediaService } from './project-media.service';
import { ProjectMediaType, ChatMediaType } from './dto/media.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Simplified file upload type
interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProjectMediaResolver {
  constructor(private readonly projectMediaService: ProjectMediaService) {}

  @Mutation(() => ProjectMediaType, {
    name: 'uploadProjectFile',
    description: 'Upload file to project - Use Dynamic GraphQL createOne instead',
  })
  async uploadProjectFile(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('filename') filename: string,
    @Args('mimetype') mimetype: string,
    @Args('size') size: number,
    @Args('url') url: string,
    @Args('caption', { nullable: true }) caption: string,
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    // This is a placeholder - actual file upload should be done via REST API endpoint
    // Then use this mutation to save metadata
    return {
      id: 'temp',
      type: 'DOCUMENT',
      url,
      filename,
      size,
      mimeType: mimetype,
      caption,
      projectId,
      uploadedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Mutation(() => ProjectMediaType, {
    name: 'uploadTaskFile',
    description: 'Upload file to task - Use Dynamic GraphQL createOne instead',
  })
  async uploadTaskFile(
    @Args('taskId', { type: () => ID }) taskId: string,
    @Args('filename') filename: string,
    @Args('mimetype') mimetype: string,
    @Args('size') size: number,
    @Args('url') url: string,
    @Args('caption', { nullable: true }) caption: string,
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    // Placeholder - actual upload via REST
    return {
      id: 'temp',
      type: 'DOCUMENT',
      url,
      filename,
      size,
      mimeType: mimetype,
      caption,
      taskId,
      uploadedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Mutation(() => ChatMediaType, {
    name: 'uploadChatFile',
    description: 'Upload file to chat message - Use Dynamic GraphQL createOne instead',
  })
  async uploadChatFile(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('filename') filename: string,
    @Args('mimetype') mimetype: string,
    @Args('size') size: number,
    @Args('url') url: string,
    @Args('caption', { nullable: true }) caption: string,
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    // Placeholder - actual upload via REST
    return {
      id: 'temp',
      type: 'DOCUMENT',
      url,
      filename,
      size,
      mimeType: mimetype,
      caption,
      messageId,
      uploadedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  @Query(() => [ProjectMediaType], {
    name: 'taskFiles',
    description: 'Get all files for a task',
  })
  async getTaskFiles(
    @Args('taskId', { type: () => ID }) taskId: string,
  ): Promise<any[]> {
    return await this.projectMediaService.getTaskFiles(taskId);
  }

  @Query(() => [ProjectMediaType], {
    name: 'projectFiles',
    description: 'Get all files for a project',
  })
  async getProjectFiles(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<any[]> {
    return await this.projectMediaService.getProjectFiles(projectId);
  }

  @Mutation(() => Boolean, {
    name: 'deleteProjectFile',
    description: 'Delete a project/task/chat file',
  })
  async deleteProjectFile(
    @Args('fileId', { type: () => ID }) fileId: string,
    @Args('type') type: 'task' | 'project' | 'chat',
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return await this.projectMediaService.deleteFile(fileId, userId, type);
  }

  /**
   * Helper to convert stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
