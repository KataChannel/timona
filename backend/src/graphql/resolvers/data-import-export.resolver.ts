import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DataImportService, MappingConfig } from '../../services/data-import.service';
import { ImageUploadService, ImageEditOptions, ImageMappingConfig } from '../../services/image-upload.service';
import { SchemaInspectorService } from '../../services/schema-inspector.service';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
@UseGuards(JwtAuthGuard)
export class DataImportExportResolver {
  constructor(
    private readonly dataImportService: DataImportService,
    private readonly schemaInspectorService: SchemaInspectorService,
  ) {}

  @Mutation(() => GraphQLJSON)
  async importExcelData(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args('modelName') modelName: string,
    @Args({ name: 'mappingConfig', type: () => GraphQLJSON, nullable: true })
    mappingConfig?: MappingConfig,
  ) {
    const { createReadStream } = await file;
    const stream = createReadStream();
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse Excel
    const data = this.dataImportService.parseExcel(buffer);

    // Import to database
    const result = await this.dataImportService.importToDatabase(
      modelName,
      data,
      mappingConfig,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async importJSONData(
    @Args('jsonString') jsonString: string,
    @Args('modelName') modelName: string,
    @Args({ name: 'mappingConfig', type: () => GraphQLJSON, nullable: true })
    mappingConfig?: MappingConfig,
  ) {
    // Parse JSON
    const data = this.dataImportService.parseJSON(jsonString);

    // Import to database
    const result = await this.dataImportService.importToDatabase(
      modelName,
      data,
      mappingConfig,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async importTextData(
    @Args('text') text: string,
    @Args('modelName') modelName: string,
    @Args({ name: 'delimiter', nullable: true, defaultValue: '\t' })
    delimiter: string,
    @Args({ name: 'mappingConfig', type: () => GraphQLJSON, nullable: true })
    mappingConfig?: MappingConfig,
  ) {
    // Parse text
    const data = this.dataImportService.parseText(text, delimiter);

    // Import to database
    const result = await this.dataImportService.importToDatabase(
      modelName,
      data,
      mappingConfig,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async bulkImportData(
    @Args({ name: 'data', type: () => GraphQLJSON }) data: any[],
    @Args('modelName') modelName: string,
    @Args({ name: 'mappingConfig', type: () => GraphQLJSON, nullable: true })
    mappingConfig?: MappingConfig,
  ) {
    const result = await this.dataImportService.bulkImportToDatabase(
      modelName,
      data,
      mappingConfig,
    );

    return result;
  }

  @Query(() => GraphQLJSON)
  async validateImportData(
    @Args({ name: 'data', type: () => GraphQLJSON }) data: any[],
    @Args({ name: 'requiredFields', type: () => [String] }) requiredFields: string[],
  ) {
    return this.dataImportService.validateData(data, requiredFields);
  }

  @Mutation(() => String)
  async exportDataToExcel(
    @Args('modelName') modelName: string,
    @Args({ name: 'where', type: () => GraphQLJSON, nullable: true }) where?: any,
    @Args({ name: 'select', type: () => GraphQLJSON, nullable: true }) select?: any,
  ) {
    const buffer = await this.dataImportService.exportToExcel(
      modelName,
      where,
      select,
    );

    // Convert buffer to base64 để return qua GraphQL
    return buffer.toString('base64');
  }
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class ImageUploadResolver {
  constructor(
    private readonly imageUploadService: ImageUploadService,
    private readonly schemaInspectorService: SchemaInspectorService,
  ) {}

  @Mutation(() => GraphQLJSON)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args({ name: 'bucket', nullable: true, defaultValue: 'images' })
    bucket: string,
    @Args({ name: 'editOptions', type: () => GraphQLJSON, nullable: true })
    editOptions?: ImageEditOptions,
  ) {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Validate image
    const validation = await this.imageUploadService.validateImage(buffer);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload image
    const result = await this.imageUploadService.uploadImage(
      buffer,
      filename,
      bucket,
      editOptions,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async uploadAndMapImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
    @Args({ name: 'mappingConfig', type: () => GraphQLJSON })
    mappingConfig: ImageMappingConfig,
    @Args({ name: 'editOptions', type: () => GraphQLJSON, nullable: true })
    editOptions?: ImageEditOptions,
  ) {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Validate image
    const validation = await this.imageUploadService.validateImage(buffer);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload and map image
    const result = await this.imageUploadService.uploadAndMapImage(
      buffer,
      filename,
      mappingConfig,
      editOptions,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async uploadMultipleImages(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: FileUpload[],
    @Args({ name: 'bucket', nullable: true, defaultValue: 'images' })
    bucket: string,
    @Args({ name: 'editOptions', type: () => GraphQLJSON, nullable: true })
    editOptions?: ImageEditOptions,
  ) {
    const images = [];

    for (const file of files) {
      const { createReadStream, filename } = await file;
      const stream = createReadStream();
      
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      images.push({ buffer, filename });
    }

    const results = await this.imageUploadService.uploadMultipleImages(
      images,
      bucket,
      editOptions,
    );

    return results;
  }

  @Mutation(() => GraphQLJSON)
  async copyImageFromUrl(
    @Args('imageUrl') imageUrl: string,
    @Args('filename') filename: string,
    @Args({ name: 'bucket', nullable: true, defaultValue: 'images' })
    bucket: string,
    @Args({ name: 'editOptions', type: () => GraphQLJSON, nullable: true })
    editOptions?: ImageEditOptions,
  ) {
    const result = await this.imageUploadService.copyImageFromUrl(
      imageUrl,
      filename,
      bucket,
      editOptions,
    );

    return result;
  }

  @Mutation(() => GraphQLJSON)
  async batchUploadAndMap(
    @Args({ name: 'items', type: () => GraphQLJSON })
    items: Array<{
      file: any;
      mappingConfig: ImageMappingConfig;
      editOptions?: ImageEditOptions;
    }>,
  ) {
    const processedItems = [];

    for (const item of items) {
      const { createReadStream, filename } = await item.file;
      const stream = createReadStream();
      
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      processedItems.push({
        buffer,
        filename,
        mappingConfig: item.mappingConfig,
        editOptions: item.editOptions,
      });
    }

    const results = await this.imageUploadService.batchUploadAndMap(processedItems);

    return results;
  }

  // ============================================================================
  // SCHEMA INSPECTOR QUERIES
  // ============================================================================

  @Query(() => [String])
  async getAllModels(): Promise<string[]> {
    return this.schemaInspectorService.getAllModels();
  }

  @Query(() => GraphQLJSON)
  async getModelSchema(@Args('modelName') modelName: string) {
    return this.schemaInspectorService.getModelSchema(modelName);
  }

  @Query(() => GraphQLJSON)
  async getMappableFields(@Args('modelName') modelName: string) {
    const fields = await this.schemaInspectorService.getMappableFields(modelName);
    return fields;
  }

  @Query(() => [String])
  async getRequiredFields(@Args('modelName') modelName: string): Promise<string[]> {
    return this.schemaInspectorService.getRequiredFields(modelName);
  }

  @Query(() => GraphQLJSON)
  async suggestMapping(
    @Args({ name: 'sourceFields', type: () => [String] }) sourceFields: string[],
    @Args('modelName') modelName: string,
  ) {
    const targetFields = await this.schemaInspectorService.getMappableFields(modelName);
    const suggestions = this.schemaInspectorService.suggestMapping(sourceFields, targetFields);
    return suggestions;
  }

  @Query(() => GraphQLJSON)
  async validateMapping(
    @Args('modelName') modelName: string,
    @Args({ name: 'mapping', type: () => GraphQLJSON }) mapping: Record<string, string>,
  ) {
    return this.schemaInspectorService.validateMapping(modelName, mapping);
  }
}
