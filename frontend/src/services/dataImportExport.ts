import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

export interface ImportDataResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errors: Array<{ row: number; error: string }>;
}

export interface MappingConfig {
  modelName: string;
  fieldMappings: Record<string, string>;
  transformations?: Record<string, (value: any) => any>;
}

class DataImportExportService {
  /**
   * Import Excel data
   */
  async importExcelData(
    file: File,
    modelName: string,
    mappingConfig?: MappingConfig
  ): Promise<ImportDataResult> {
    const mutation = gql`
      mutation ImportExcelData(
        $file: Upload!
        $modelName: String!
        $mappingConfig: JSON
      ) {
        importExcelData(
          file: $file
          modelName: $modelName
          mappingConfig: $mappingConfig
        ) {
          success
          totalRows
          successRows
          errors {
            row
            error
          }
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          file,
          modelName,
          mappingConfig,
        },
        context: {
          hasUpload: true,
        },
      });

      return data.importExcelData;
    } catch (error: any) {
      console.error('Import Excel error:', error);
      throw new Error(error.message || 'Failed to import Excel data');
    }
  }

  /**
   * Import JSON data
   */
  async importJSONData(
    jsonString: string,
    modelName: string,
    mappingConfig?: MappingConfig
  ): Promise<ImportDataResult> {
    const mutation = gql`
      mutation ImportJSONData(
        $jsonString: String!
        $modelName: String!
        $mappingConfig: JSON
      ) {
        importJSONData(
          jsonString: $jsonString
          modelName: $modelName
          mappingConfig: $mappingConfig
        ) {
          success
          totalRows
          successRows
          errors {
            row
            error
          }
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          jsonString,
          modelName,
          mappingConfig,
        },
      });

      return data.importJSONData;
    } catch (error: any) {
      console.error('Import JSON error:', error);
      throw new Error(error.message || 'Failed to import JSON data');
    }
  }

  /**
   * Import text/CSV data
   */
  async importTextData(
    text: string,
    modelName: string,
    delimiter: string = '\t',
    mappingConfig?: MappingConfig
  ): Promise<ImportDataResult> {
    const mutation = gql`
      mutation ImportTextData(
        $text: String!
        $modelName: String!
        $delimiter: String
        $mappingConfig: JSON
      ) {
        importTextData(
          text: $text
          modelName: $modelName
          delimiter: $delimiter
          mappingConfig: $mappingConfig
        ) {
          success
          totalRows
          successRows
          errors {
            row
            error
          }
        }
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          text,
          modelName,
          delimiter,
          mappingConfig,
        },
      });

      return data.importTextData;
    } catch (error: any) {
      console.error('Import text error:', error);
      throw new Error(error.message || 'Failed to import text data');
    }
  }

  /**
   * Bulk import data
   */
  async bulkImportData(
    data: any[],
    modelName: string,
    mappingConfig?: MappingConfig
  ): Promise<ImportDataResult> {
    const mutation = gql`
      mutation BulkImportData(
        $data: JSON!
        $modelName: String!
        $mappingConfig: JSON
      ) {
        bulkImportData(
          data: $data
          modelName: $modelName
          mappingConfig: $mappingConfig
        ) {
          success
          totalRows
          successRows
          errors {
            row
            error
          }
        }
      }
    `;

    try {
      const { data: result } = await apolloClient.mutate({
        mutation,
        variables: {
          data,
          modelName,
          mappingConfig,
        },
      });

      return result.bulkImportData;
    } catch (error: any) {
      console.error('Bulk import error:', error);
      throw new Error(error.message || 'Failed to bulk import data');
    }
  }

  /**
   * Validate import data
   */
  async validateImportData(
    data: any[],
    requiredFields: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const query = gql`
      query ValidateImportData($data: JSON!, $requiredFields: [String!]!) {
        validateImportData(data: $data, requiredFields: $requiredFields) {
          valid
          errors
        }
      }
    `;

    try {
      const { data: result } = await apolloClient.query({
        query,
        variables: {
          data,
          requiredFields,
        },
      });

      return result.validateImportData;
    } catch (error: any) {
      console.error('Validation error:', error);
      throw new Error(error.message || 'Failed to validate data');
    }
  }

  /**
   * Export data to Excel (returns base64)
   */
  async exportDataToExcel(
    modelName: string,
    where?: any,
    select?: any
  ): Promise<string> {
    const mutation = gql`
      mutation ExportDataToExcel(
        $modelName: String!
        $where: JSON
        $select: JSON
      ) {
        exportDataToExcel(modelName: $modelName, where: $where, select: $select)
      }
    `;

    try {
      const { data } = await apolloClient.mutate({
        mutation,
        variables: {
          modelName,
          where,
          select,
        },
      });

      return data.exportDataToExcel;
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error(error.message || 'Failed to export data');
    }
  }

  /**
   * Download Excel file từ base64
   */
  downloadExcelFile(base64Data: string, filename: string = 'export.xlsx') {
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    link.download = filename;
    link.click();
  }
}

export default new DataImportExportService();
