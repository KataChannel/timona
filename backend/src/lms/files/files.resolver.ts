import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FilesService, UploadResult } from './files.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { FileUploadType, FileUploadResult } from './entities/file-upload.entity';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@Resolver()
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  @Mutation(() => FileUploadResult)
  @UseGuards(JwtAuthGuard)
  async uploadCourseThumbnail(
    @CurrentUser() user: any,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Args('courseId', { type: () => String, nullable: true }) courseId?: string,
  ): Promise<UploadResult> {
    return this.filesService.uploadCourseThumbnail(file, user.id, courseId);
  }

  @Mutation(() => FileUploadResult)
  @UseGuards(JwtAuthGuard)
  async uploadLessonVideo(
    @CurrentUser() user: any,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Args('courseId', { type: () => String }) courseId: string,
  ): Promise<UploadResult> {
    return this.filesService.uploadLessonVideo(file, user.id, courseId);
  }

  @Mutation(() => FileUploadResult)
  @UseGuards(JwtAuthGuard)
  async uploadCourseMaterial(
    @CurrentUser() user: any,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Args('courseId', { type: () => String }) courseId: string,
  ): Promise<UploadResult> {
    return this.filesService.uploadCourseMaterial(file, user.id, courseId);
  }

  @Mutation(() => Boolean, { name: 'deleteLMSFile' })
  @UseGuards(JwtAuthGuard)
  async deleteLMSFile(
    @CurrentUser() user: any,
    @Args('fileId', { type: () => String }) fileId: string,
    @Args('bucket', { type: () => String }) bucket: string,
  ): Promise<boolean> {
    return this.filesService.deleteFile(fileId, bucket, user.id);
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(
    @Args('fileId', { type: () => String }) fileId: string,
    @Args('bucket', { type: () => String }) bucket: string,
    @Args('expiresIn', { type: () => Number, nullable: true }) expiresIn?: number,
  ): Promise<string> {
    return this.filesService.getPresignedUrl(fileId, bucket, expiresIn);
  }
}
