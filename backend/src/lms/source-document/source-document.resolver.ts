import { Resolver, Query, Mutation, Args, ID, Int, Context, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SourceDocumentService } from './source-document.service';
import { MinioService } from '../../minio/minio.service';
import {
  SourceDocument,
  CourseSourceDocument,
} from './entities/source-document.entity';
import { FileUploadResult } from '../files/entities/file-upload.entity';
import {
  CreateSourceDocumentInput,
  UpdateSourceDocumentInput,
  SourceDocumentFilterInput,
  LinkDocumentToCourseInput,
  UpdateCourseDocumentLinkInput,
} from './dto/source-document.dto';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Resolver(() => SourceDocument)
export class SourceDocumentResolver {
  constructor(
    private readonly sourceDocumentService: SourceDocumentService,
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @ResolveField('user')
  async user(@Parent() sourceDocument: SourceDocument) {
    if (!sourceDocument.userId) return null;
    return this.prisma.user.findUnique({
      where: { id: sourceDocument.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async createSourceDocument(
    @CurrentUser() user: any,
    @Args('input') input: CreateSourceDocumentInput,
  ) {
    return this.sourceDocumentService.create(user.id, input);
  }

  @Query(() => [SourceDocument])
  async sourceDocuments(
    @Args('filter', { nullable: true }) filter?: SourceDocumentFilterInput,
    @Args('page', { type: () => Int, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit?: number,
  ) {
    const result = await this.sourceDocumentService.findAll(filter, page, limit);
    console.log('📄 Source documents query:', {
      filter,
      page,
      limit,
      totalItems: result.items.length,
      totalCount: result.total,
    });
    return result.items;
  }

  @Query(() => SourceDocument)
  async sourceDocument(@Args('id', { type: () => ID }) id: string) {
    return this.sourceDocumentService.findOne(id);
  }

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async updateSourceDocument(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSourceDocumentInput,
  ) {
    return this.sourceDocumentService.update(id, input);
  }

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async deleteSourceDocument(@Args('id', { type: () => ID }) id: string) {
    return this.sourceDocumentService.delete(id);
  }

  // ============== Course Linking ==============

  @Mutation(() => CourseSourceDocument)
  @UseGuards(JwtAuthGuard)
  async linkDocumentToCourse(
    @CurrentUser() user: any,
    @Args('input') input: LinkDocumentToCourseInput,
  ) {
    return this.sourceDocumentService.linkToCourse(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unlinkDocumentFromCourse(
    @Args('courseId', { type: () => ID }) courseId: string,
    @Args('documentId', { type: () => ID }) documentId: string,
  ) {
    const result = await this.sourceDocumentService.unlinkFromCourse(
      courseId,
      documentId,
    );
    return result.success;
  }

  @Mutation(() => CourseSourceDocument)
  @UseGuards(JwtAuthGuard)
  async updateCourseDocumentLink(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCourseDocumentLinkInput,
  ) {
    return this.sourceDocumentService.updateCourseLink(id, input);
  }

  @Query(() => [CourseSourceDocument])
  async courseDocuments(@Args('courseId', { type: () => ID }) courseId: string) {
    return this.sourceDocumentService.getCourseDocuments(courseId);
  }

  // ============== Stats ==============

  @Mutation(() => SourceDocument)
  async incrementDocumentDownload(@Args('id', { type: () => ID }) id: string) {
    return this.sourceDocumentService.incrementDownloadCount(id);
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async sourceDocumentStats(
    @CurrentUser() user: any,
  ) {
    const stats = await this.sourceDocumentService.getStats(user.id);
    return JSON.stringify(stats);
  }

  // ============== Approval Workflow ==============

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async requestDocumentApproval(
    @CurrentUser() user: any,
    @Args('documentId', { type: () => ID }) documentId: string,
  ) {
    return this.sourceDocumentService.requestApproval(documentId, user.id);
  }

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async approveDocument(
    @CurrentUser() user: any,
    @Args('documentId', { type: () => ID }) documentId: string,
  ) {
    return this.sourceDocumentService.approveDocument(documentId, user.id);
  }

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async rejectDocument(
    @CurrentUser() user: any,
    @Args('documentId', { type: () => ID }) documentId: string,
    @Args('reason', { type: () => String }) reason: string,
  ) {
    return this.sourceDocumentService.rejectDocument(documentId, user.id, reason);
  }

  // ============== File Upload ==============

  @Mutation(() => FileUploadResult)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: Promise<FileUpload>,
    @Args('bucket', { type: () => String }) bucket: string,
  ): Promise<FileUploadResult> {
    const { createReadStream, filename, mimetype } = await file;
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const stream = createReadStream();
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          
          // Generate unique file name
          const timestamp = Date.now();
          const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
          const uniqueFileName = `${timestamp}-${safeName}`;
          
          // Upload to MinIO using service method
          const url = await this.minioService.uploadFile(
            bucket,
            uniqueFileName,
            buffer,
            mimetype,
          );
          
          resolve({
            id: `${bucket}-${uniqueFileName}`,
            url,
            filename,
            mimetype,
            size: buffer.length,
            bucket,
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async uploadSourceDocumentFile(
    @Args('documentId', { type: () => ID }) documentId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<string> {
    const { createReadStream, filename, mimetype } = await file;
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const stream = createReadStream();
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const url = await this.minioService.uploadSourceDocument(
            documentId,
            buffer,
            filename,
            mimetype,
          );
          
          // Update document with file info
          await this.sourceDocumentService.update(documentId, {
            url,
            fileName: filename,
            fileSize: buffer.length,
            mimeType: mimetype,
          });
          
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async uploadDocumentThumbnail(
    @Args('documentId', { type: () => ID }) documentId: string,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: Promise<FileUpload>,
  ): Promise<string> {
    const { createReadStream, mimetype } = await file;
    
    const chunks: Buffer[] = [];
    const stream = createReadStream();
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const url = await this.minioService.uploadDocumentThumbnail(
            documentId,
            buffer,
            mimetype,
          );
          
          // Update document with thumbnail
          await this.sourceDocumentService.update(documentId, {
            thumbnailUrl: url,
          });
          
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // ============== AI Analysis ==============

  @Mutation(() => SourceDocument)
  @UseGuards(JwtAuthGuard)
  async analyzeSourceDocument(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<any> {
    return this.sourceDocumentService.analyzeDocument(id);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async bulkAnalyzeDocuments(
    @CurrentUser() user: any,
  ): Promise<string> {
    const result = await this.sourceDocumentService.bulkAnalyze(user.id);
    return JSON.stringify(result);
  }
}
