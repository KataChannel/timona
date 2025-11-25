import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

export interface ImportDataResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errors: Array<{ row: number; error: string }>;
  data?: any[];
}

export interface MappingConfig {
  modelName: string;
  fieldMappings: Record<string, string>; // source field -> target field
  transformations?: Record<string, (value: any) => any>;
}

@Injectable()
export class DataImportService {
  private readonly logger = new Logger(DataImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse Excel data từ buffer
   */
  parseExcel(buffer: Buffer): any[] {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      this.logger.log(`Parsed ${data.length} rows from Excel`);
      return data;
    } catch (error) {
      this.logger.error('Error parsing Excel:', error);
      throw new Error(`Failed to parse Excel: ${error.message}`);
    }
  }

  /**
   * Parse JSON data từ string
   */
  parseJSON(jsonString: string): any[] {
    try {
      const data = JSON.parse(jsonString);
      const result = Array.isArray(data) ? data : [data];
      this.logger.log(`Parsed ${result.length} rows from JSON`);
      return result;
    } catch (error) {
      this.logger.error('Error parsing JSON:', error);
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }

  /**
   * Parse text data (CSV/TSV)
   */
  parseText(text: string, delimiter: string = '\t'): any[] {
    try {
      const lines = text.trim().split('\n');
      if (lines.length === 0) return [];

      const headers = lines[0].split(delimiter);
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(delimiter);
        const row: any = {};
        headers.forEach((header, i) => {
          row[header.trim()] = values[i]?.trim() || '';
        });
        return row;
      });

      this.logger.log(`Parsed ${data.length} rows from text`);
      return data;
    } catch (error) {
      this.logger.error('Error parsing text:', error);
      throw new Error(`Failed to parse text: ${error.message}`);
    }
  }

  /**
   * Map và transform data theo config
   */
  mapData(sourceData: any[], config: MappingConfig): any[] {
    return sourceData.map((row) => {
      const mappedRow: any = {};
      
      Object.entries(config.fieldMappings).forEach(([sourceField, targetField]) => {
        let value = row[sourceField];
        
        // Apply transformation nếu có
        if (config.transformations?.[targetField]) {
          value = config.transformations[targetField](value);
        }
        
        mappedRow[targetField] = value;
      });

      return mappedRow;
    });
  }

  /**
   * Import data vào database sử dụng Dynamic GraphQL
   */
  async importToDatabase(
    modelName: string,
    data: any[],
    config?: MappingConfig,
  ): Promise<ImportDataResult> {
    const result: ImportDataResult = {
      success: true,
      totalRows: data.length,
      successRows: 0,
      errors: [],
    };

    try {
      // Map data nếu có config
      const mappedData = config ? this.mapData(data, config) : data;

      // Get Prisma model
      const model = (this.prisma as any)[modelName];
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }

      // Import từng row
      for (let i = 0; i < mappedData.length; i++) {
        try {
          await model.create({
            data: mappedData[i],
          });
          result.successRows++;
        } catch (error) {
          this.logger.error(`Error importing row ${i + 1}:`, error);
          result.errors.push({
            row: i + 1,
            error: error.message,
          });
        }
      }

      result.success = result.errors.length === 0;
      this.logger.log(
        `Import completed: ${result.successRows}/${result.totalRows} rows successful`,
      );

      return result;
    } catch (error) {
      this.logger.error('Import error:', error);
      throw error;
    }
  }

  /**
   * Bulk import với transaction
   */
  async bulkImportToDatabase(
    modelName: string,
    data: any[],
    config?: MappingConfig,
  ): Promise<ImportDataResult> {
    const result: ImportDataResult = {
      success: true,
      totalRows: data.length,
      successRows: 0,
      errors: [],
    };

    try {
      // Map data nếu có config
      const mappedData = config ? this.mapData(data, config) : data;

      // Get Prisma model
      const model = (this.prisma as any)[modelName];
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }

      // Bulk create
      await this.prisma.$transaction(async (tx) => {
        const txModel = (tx as any)[modelName];
        
        for (let i = 0; i < mappedData.length; i++) {
          try {
            await txModel.create({
              data: mappedData[i],
            });
            result.successRows++;
          } catch (error) {
            this.logger.error(`Error importing row ${i + 1}:`, error);
            result.errors.push({
              row: i + 1,
              error: error.message,
            });
          }
        }
      });

      result.success = result.errors.length === 0;
      this.logger.log(
        `Bulk import completed: ${result.successRows}/${result.totalRows} rows successful`,
      );

      return result;
    } catch (error) {
      this.logger.error('Bulk import error:', error);
      throw error;
    }
  }

  /**
   * Export data từ database ra Excel
   */
  async exportToExcel(
    modelName: string,
    where?: any,
    select?: any,
  ): Promise<Buffer> {
    try {
      // Get Prisma model
      const model = (this.prisma as any)[modelName];
      if (!model) {
        throw new Error(`Model ${modelName} not found`);
      }

      // Fetch data
      const data = await model.findMany({
        where,
        select,
      });

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, modelName);

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      this.logger.log(`Exported ${data.length} rows to Excel`);
      return buffer;
    } catch (error) {
      this.logger.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Validate data trước khi import
   */
  validateData(
    data: any[],
    requiredFields: string[],
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('Data is empty or not an array');
      return { valid: false, errors };
    }

    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          errors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
