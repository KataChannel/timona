import { Resolver, Query, Mutation, Args, ID, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FileService } from '../../services/file.service';
import { File, FileFolder, FileUploadResponse, PaginatedFiles, PaginatedFolders, FileStorageStats, FileShare } from '../models/file.model';
import {
  CreateFolderInput,
  UpdateFolderInput,
  UpdateFileInput,
  GetFilesInput,
  CreateFileShareInput,
  MoveFilesInput,
  BulkDeleteFilesInput,
  BulkUpdateFilesInput,
} from '../inputs/file.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import GraphQLJSON from 'graphql-type-json';
import { FileUpload } from '../scalars/upload.scalar';

@Resolver(() => File)
@UseGuards(JwtAuthGuard)
export class FileResolver {
  constructor(private fileService: FileService) {}

  /**
   * Upload single file
   */
  @Mutation(() => FileUploadResponse)
  async uploadFile(
    @Args('file', { type: () => GraphQLJSON }) file: any,
    @Args('folderId', { type: () => ID, nullable: true }) folderId: string,
    @Args('metadata', { type: () => GraphQLJSON, nullable: true }) metadata: any,
    @Context() context: any,
  ): Promise<FileUploadResponse> {
    try {
      const userId = context.req.user.id;
      
      // Convert file upload to Express.Multer.File format
      const multerFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: file.filename || file.originalname || 'file',
        encoding: file.encoding || '7bit',
        mimetype: file.mimetype || file.mimeType || 'application/octet-stream',
        size: file.size || 0,
        buffer: file.buffer || Buffer.from([]),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const uploadedFile = await this.fileService.uploadFile(
        multerFile,
        userId,
        folderId,
        metadata,
      );

      return {
        file: uploadedFile as any,
        success: true,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      return {
        file: null as any,
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get file by ID
   */
  @Query(() => File, { name: 'file' })
  async getFile(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<File> {
    const userId = context.req.user.id;
    return this.fileService.getFile(id, userId) as any;
  }

  /**
   * Get files with pagination and filters
   */
  @Query(() => PaginatedFiles, { name: 'files' })
  async getFiles(
    @Args('input', { type: () => GetFilesInput, nullable: true }) input: GetFilesInput,
    @Context() context: any,
  ): Promise<PaginatedFiles> {
    const userId = context.req.user.id;
    return this.fileService.getFiles(input || {}, userId) as any;
  }

  /**
   * Update file metadata
   */
  @Mutation(() => File)
  async updateFile(
    @Args('input', { type: () => UpdateFileInput }) input: UpdateFileInput,
    @Context() context: any,
  ): Promise<File> {
    const userId = context.req.user.id;
    return this.fileService.updateFile(input, userId) as any;
  }

  /**
   * Delete file
   */
  @Mutation(() => Boolean)
  async deleteFile(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.fileService.deleteFile(id, userId);
  }

  /**
   * Move files to folder
   */
  @Mutation(() => [File])
  async moveFiles(
    @Args('input', { type: () => MoveFilesInput }) input: MoveFilesInput,
    @Context() context: any,
  ): Promise<File[]> {
    const userId = context.req.user.id;
    return this.fileService.moveFiles(input, userId) as any;
  }

  /**
   * Bulk delete files
   */
  @Mutation(() => Int)
  async bulkDeleteFiles(
    @Args('input', { type: () => BulkDeleteFilesInput }) input: BulkDeleteFilesInput,
    @Context() context: any,
  ): Promise<number> {
    const userId = context.req.user.id;
    return this.fileService.bulkDeleteFiles(input, userId);
  }

  /**
   * Bulk update files
   */
  @Mutation(() => [File])
  async bulkUpdateFiles(
    @Args('input', { type: () => BulkUpdateFilesInput }) input: BulkUpdateFilesInput,
    @Context() context: any,
  ): Promise<File[]> {
    const userId = context.req.user.id;
    return this.fileService.bulkUpdateFiles(input, userId) as any;
  }

  /**
   * Get storage statistics
   */
  @Query(() => FileStorageStats, { name: 'fileStorageStats' })
  async getStorageStats(@Context() context: any): Promise<FileStorageStats> {
    const userId = context.req.user.id;
    return this.fileService.getStorageStats(userId);
  }

  /**
   * Create file share
   */
  @Mutation(() => FileShare)
  async createFileShare(
    @Args('input', { type: () => CreateFileShareInput }) input: CreateFileShareInput,
    @Context() context: any,
  ): Promise<FileShare> {
    const userId = context.req.user.id;
    return this.fileService.createFileShare(input, userId) as any;
  }
}
