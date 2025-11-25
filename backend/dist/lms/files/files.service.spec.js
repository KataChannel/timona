"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const files_service_1 = require("./files.service");
const minio_service_1 = require("../../minio/minio.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
describe('FilesService', () => {
    let service;
    let minioService;
    let prismaService;
    const mockMinioService = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
        getPresignedUrl: jest.fn(),
    };
    const mockPrismaService = {
        course: {
            findUnique: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                files_service_1.FilesService,
                {
                    provide: minio_service_1.MinioService,
                    useValue: mockMinioService,
                },
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(files_service_1.FilesService);
        minioService = module.get(minio_service_1.MinioService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('uploadFile', () => {
        const createMockFile = (mimetype, size) => {
            const buffer = Buffer.alloc(size);
            const readable = new stream_1.Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                },
            });
            return {
                createReadStream: () => readable,
                filename: 'test-file.jpg',
                mimetype,
                encoding: '7bit',
            };
        };
        it('should upload an image file successfully', async () => {
            const mockFile = createMockFile('image/jpeg', 1024 * 1024);
            const expectedUrl = 'https://minio.example.com/uploads/test-file.jpg';
            mockMinioService.uploadFile.mockResolvedValue(expectedUrl);
            const result = await service.uploadFile(mockFile, 'user-1', 'image');
            expect(result).toMatchObject({
                url: expectedUrl,
                filename: 'test-file.jpg',
                mimetype: 'image/jpeg',
                bucket: 'uploads',
            });
            expect(result.id).toBeDefined();
            expect(result.size).toBe(1024 * 1024);
        });
        it('should upload a video file successfully', async () => {
            const mockFile = createMockFile('video/mp4', 50 * 1024 * 1024);
            const expectedUrl = 'https://minio.example.com/uploads/video.mp4';
            mockMinioService.uploadFile.mockResolvedValue(expectedUrl);
            const result = await service.uploadFile(mockFile, 'user-1', 'video');
            expect(result).toMatchObject({
                url: expectedUrl,
                mimetype: 'video/mp4',
                bucket: 'uploads',
            });
            expect(mockMinioService.uploadFile).toHaveBeenCalledWith('uploads', expect.stringMatching(/\.mp4$/), expect.any(Buffer), 'video/mp4');
        });
        it('should upload a document file successfully', async () => {
            const mockFile = createMockFile('application/pdf', 2 * 1024 * 1024);
            const expectedUrl = 'https://minio.example.com/uploads/doc.pdf';
            mockMinioService.uploadFile.mockResolvedValue(expectedUrl);
            const result = await service.uploadFile(mockFile, 'user-1', 'document');
            expect(result.mimetype).toBe('application/pdf');
            expect(result.bucket).toBe('uploads');
        });
        it('should throw BadRequestException for invalid image type', async () => {
            const mockFile = createMockFile('application/json', 1024);
            await expect(service.uploadFile(mockFile, 'user-1', 'image')).rejects.toThrow(common_1.BadRequestException);
            await expect(service.uploadFile(mockFile, 'user-1', 'image')).rejects.toThrow(/Invalid file type/);
        });
        it('should throw BadRequestException for invalid video type', async () => {
            const mockFile = createMockFile('image/jpeg', 1024);
            await expect(service.uploadFile(mockFile, 'user-1', 'video')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException if video file size exceeds limit', async () => {
            const mockFile = createMockFile('video/mp4', 600 * 1024 * 1024);
            await expect(service.uploadFile(mockFile, 'user-1', 'video')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException if document file size exceeds limit', async () => {
            const mockFile = createMockFile('application/pdf', 15 * 1024 * 1024);
            await expect(service.uploadFile(mockFile, 'user-1', 'document')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should handle upload errors gracefully', async () => {
            const mockFile = createMockFile('image/jpeg', 1024 * 1024);
            mockMinioService.uploadFile.mockRejectedValue(new Error('MinIO error'));
            await expect(service.uploadFile(mockFile, 'user-1', 'image')).rejects.toThrow(new common_1.BadRequestException('Failed to upload file'));
        });
    });
    describe('uploadLessonVideo', () => {
        const createMockVideoFile = () => {
            const buffer = Buffer.alloc(1024 * 1024);
            const readable = new stream_1.Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                },
            });
            return {
                createReadStream: () => readable,
                filename: 'lesson-video.mp4',
                mimetype: 'video/mp4',
                encoding: '7bit',
            };
        };
        it('should upload video for authorized instructor', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'user-1',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockMinioService.uploadFile.mockResolvedValue('https://minio.example.com/video.mp4');
            const mockFile = createMockVideoFile();
            const result = await service.uploadLessonVideo(mockFile, 'user-1', 'course-1');
            expect(result).toBeDefined();
            expect(result.mimetype).toBe('video/mp4');
            expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
                where: { id: 'course-1' },
            });
        });
        it('should throw BadRequestException if course not found', async () => {
            mockPrismaService.course.findUnique.mockResolvedValue(null);
            const mockFile = createMockVideoFile();
            await expect(service.uploadLessonVideo(mockFile, 'user-1', 'non-existent')).rejects.toThrow(new common_1.BadRequestException('Not authorized to upload to this course'));
        });
        it('should throw BadRequestException if user is not instructor', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'different-user',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            const mockFile = createMockVideoFile();
            await expect(service.uploadLessonVideo(mockFile, 'user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Not authorized to upload to this course'));
        });
    });
    describe('uploadCourseThumbnail', () => {
        const createMockImageFile = () => {
            const buffer = Buffer.alloc(1024 * 1024);
            const readable = new stream_1.Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                },
            });
            return {
                createReadStream: () => readable,
                filename: 'thumbnail.jpg',
                mimetype: 'image/jpeg',
                encoding: '7bit',
            };
        };
        it('should upload thumbnail without courseId', async () => {
            mockMinioService.uploadFile.mockResolvedValue('https://minio.example.com/thumb.jpg');
            const mockFile = createMockImageFile();
            const result = await service.uploadCourseThumbnail(mockFile, 'user-1');
            expect(result).toBeDefined();
            expect(result.mimetype).toBe('image/jpeg');
            expect(mockPrismaService.course.findUnique).not.toHaveBeenCalled();
        });
        it('should upload thumbnail with courseId and authorization check', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'user-1',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockMinioService.uploadFile.mockResolvedValue('https://minio.example.com/thumb.jpg');
            const mockFile = createMockImageFile();
            const result = await service.uploadCourseThumbnail(mockFile, 'user-1', 'course-1');
            expect(result).toBeDefined();
            expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
                where: { id: 'course-1' },
            });
        });
        it('should throw BadRequestException if user is not authorized', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'different-user',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            const mockFile = createMockImageFile();
            await expect(service.uploadCourseThumbnail(mockFile, 'user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Not authorized'));
        });
    });
    describe('uploadCourseMaterial', () => {
        const createMockDocumentFile = () => {
            const buffer = Buffer.alloc(1024 * 1024);
            const readable = new stream_1.Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                },
            });
            return {
                createReadStream: () => readable,
                filename: 'material.pdf',
                mimetype: 'application/pdf',
                encoding: '7bit',
            };
        };
        it('should upload course material for authorized instructor', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'user-1',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            mockMinioService.uploadFile.mockResolvedValue('https://minio.example.com/material.pdf');
            const mockFile = createMockDocumentFile();
            const result = await service.uploadCourseMaterial(mockFile, 'user-1', 'course-1');
            expect(result).toBeDefined();
            expect(result.mimetype).toBe('application/pdf');
        });
        it('should throw BadRequestException if not authorized', async () => {
            const mockCourse = {
                id: 'course-1',
                instructorId: 'different-user',
            };
            mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
            const mockFile = createMockDocumentFile();
            await expect(service.uploadCourseMaterial(mockFile, 'user-1', 'course-1')).rejects.toThrow(new common_1.BadRequestException('Not authorized'));
        });
    });
    describe('deleteFile', () => {
        it('should delete file successfully', async () => {
            mockMinioService.deleteFile.mockResolvedValue(undefined);
            const result = await service.deleteFile('file-123', 'uploads', 'user-1');
            expect(result).toBe(true);
            expect(mockMinioService.deleteFile).toHaveBeenCalledWith('uploads', 'file-123');
        });
        it('should throw BadRequestException on delete error', async () => {
            mockMinioService.deleteFile.mockRejectedValue(new Error('MinIO delete error'));
            await expect(service.deleteFile('file-123', 'uploads', 'user-1')).rejects.toThrow(new common_1.BadRequestException('Failed to delete file'));
        });
    });
    describe('getPresignedUrl', () => {
        it('should generate presigned URL with default expiration', async () => {
            const expectedUrl = 'https://minio.example.com/presigned/file-123?expires=3600';
            mockMinioService.getPresignedUrl.mockResolvedValue(expectedUrl);
            const result = await service.getPresignedUrl('file-123', 'uploads');
            expect(result).toBe(expectedUrl);
            expect(mockMinioService.getPresignedUrl).toHaveBeenCalledWith('uploads', 'file-123', 3600);
        });
        it('should generate presigned URL with custom expiration', async () => {
            const expectedUrl = 'https://minio.example.com/presigned/file-123?expires=7200';
            mockMinioService.getPresignedUrl.mockResolvedValue(expectedUrl);
            const result = await service.getPresignedUrl('file-123', 'uploads', 7200);
            expect(result).toBe(expectedUrl);
            expect(mockMinioService.getPresignedUrl).toHaveBeenCalledWith('uploads', 'file-123', 7200);
        });
        it('should throw BadRequestException on presigned URL error', async () => {
            mockMinioService.getPresignedUrl.mockRejectedValue(new Error('MinIO error'));
            await expect(service.getPresignedUrl('file-123', 'uploads')).rejects.toThrow(new common_1.BadRequestException('Failed to generate presigned URL'));
        });
    });
});
//# sourceMappingURL=files.service.spec.js.map