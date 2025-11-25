import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileService } from '../services/file.service';
import { UpdateFileInput, FileFiltersInput } from '../graphql/inputs/file.input';

@Controller('api/files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  /**
   * Upload single file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId: string,
    @Body('metadata') metadataStr: string,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : undefined;
    const userId = req.user.id;

    const uploadedFile = await this.fileService.uploadFile(
      file,
      userId,
      folderId,
      metadata,
    );

    return {
      success: true,
      data: uploadedFile,
      message: 'File uploaded successfully',
    };
  }

  /**
   * Upload multiple files
   */
  @Post('upload/bulk')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderId') folderId: string,
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const userId = req.user.id;
    const uploadedFiles = await Promise.all(
      files.map((file) =>
        this.fileService.uploadFile(file, userId, folderId),
      ),
    );

    return {
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`,
    };
  }

  /**
   * Get file by ID
   */
  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    const file = await this.fileService.getFile(id, userId);
    return {
      success: true,
      data: file,
    };
  }

  /**
   * Get files with filters
   */
  @Get()
  async getFiles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('folderId') folderId: string,
    @Query('fileType') fileType: string,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const filters: FileFiltersInput = {};
    
    if (folderId) filters.folderId = folderId;
    if (fileType) filters.fileType = fileType as any;
    if (search) filters.search = search;

    const result = await this.fileService.getFiles(
      { page, limit, filters },
      userId,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update file metadata
   */
  @Put(':id')
  async updateFile(
    @Param('id') id: string,
    @Body() input: Partial<UpdateFileInput>,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const updated = await this.fileService.updateFile(
      { id, ...input } as UpdateFileInput,
      userId,
    );

    return {
      success: true,
      data: updated,
      message: 'File updated successfully',
    };
  }

  /**
   * Delete file
   */
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.fileService.deleteFile(id, userId);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  /**
   * Get storage stats
   */
  @Get('stats/overview')
  async getStorageStats(@Request() req: any) {
    const userId = req.user.id;
    const stats = await this.fileService.getStorageStats(userId);

    return {
      success: true,
      data: stats,
    };
  }
}
