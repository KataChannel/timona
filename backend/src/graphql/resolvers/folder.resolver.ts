import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FileService } from '../../services/file.service';
import { FileFolder, PaginatedFolders } from '../models/file.model';
import { CreateFolderInput, UpdateFolderInput } from '../inputs/file.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Resolver(() => FileFolder)
@UseGuards(JwtAuthGuard)
export class FolderResolver {
  constructor(private fileService: FileService) {}

  /**
   * Create a new folder
   */
  @Mutation(() => FileFolder)
  async createFolder(
    @Args('input', { type: () => CreateFolderInput }) input: CreateFolderInput,
    @Context() context: any,
  ): Promise<FileFolder> {
    const userId = context.req.user.id;
    return this.fileService.createFolder(input, userId) as any;
  }

  /**
   * Get folder by ID
   */
  @Query(() => FileFolder, { name: 'folder' })
  async getFolder(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<FileFolder> {
    const userId = context.req.user.id;
    return this.fileService.getFolder(id, userId) as any;
  }

  /**
   * Get all folders for user
   */
  @Query(() => [FileFolder], { name: 'folders' })
  async getFolders(@Context() context: any): Promise<FileFolder[]> {
    const userId = context.req.user.id;
    return this.fileService.getFolders(userId) as any;
  }

  /**
   * Update folder
   */
  @Mutation(() => FileFolder)
  async updateFolder(
    @Args('input', { type: () => UpdateFolderInput }) input: UpdateFolderInput,
    @Context() context: any,
  ): Promise<FileFolder> {
    const userId = context.req.user.id;
    return this.fileService.updateFolder(input, userId) as any;
  }

  /**
   * Delete folder
   */
  @Mutation(() => Boolean)
  async deleteFolder(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.fileService.deleteFolder(id, userId);
  }
}
