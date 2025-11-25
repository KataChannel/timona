"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DataImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataImportService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const prisma_service_1 = require("../prisma/prisma.service");
let DataImportService = DataImportService_1 = class DataImportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DataImportService_1.name);
    }
    parseExcel(buffer) {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            this.logger.log(`Parsed ${data.length} rows from Excel`);
            return data;
        }
        catch (error) {
            this.logger.error('Error parsing Excel:', error);
            throw new Error(`Failed to parse Excel: ${error.message}`);
        }
    }
    parseJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const result = Array.isArray(data) ? data : [data];
            this.logger.log(`Parsed ${result.length} rows from JSON`);
            return result;
        }
        catch (error) {
            this.logger.error('Error parsing JSON:', error);
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
    }
    parseText(text, delimiter = '\t') {
        try {
            const lines = text.trim().split('\n');
            if (lines.length === 0)
                return [];
            const headers = lines[0].split(delimiter);
            const data = lines.slice(1).map((line, index) => {
                const values = line.split(delimiter);
                const row = {};
                headers.forEach((header, i) => {
                    row[header.trim()] = values[i]?.trim() || '';
                });
                return row;
            });
            this.logger.log(`Parsed ${data.length} rows from text`);
            return data;
        }
        catch (error) {
            this.logger.error('Error parsing text:', error);
            throw new Error(`Failed to parse text: ${error.message}`);
        }
    }
    mapData(sourceData, config) {
        return sourceData.map((row) => {
            const mappedRow = {};
            Object.entries(config.fieldMappings).forEach(([sourceField, targetField]) => {
                let value = row[sourceField];
                if (config.transformations?.[targetField]) {
                    value = config.transformations[targetField](value);
                }
                mappedRow[targetField] = value;
            });
            return mappedRow;
        });
    }
    async importToDatabase(modelName, data, config) {
        const result = {
            success: true,
            totalRows: data.length,
            successRows: 0,
            errors: [],
        };
        try {
            const mappedData = config ? this.mapData(data, config) : data;
            const model = this.prisma[modelName];
            if (!model) {
                throw new Error(`Model ${modelName} not found`);
            }
            for (let i = 0; i < mappedData.length; i++) {
                try {
                    await model.create({
                        data: mappedData[i],
                    });
                    result.successRows++;
                }
                catch (error) {
                    this.logger.error(`Error importing row ${i + 1}:`, error);
                    result.errors.push({
                        row: i + 1,
                        error: error.message,
                    });
                }
            }
            result.success = result.errors.length === 0;
            this.logger.log(`Import completed: ${result.successRows}/${result.totalRows} rows successful`);
            return result;
        }
        catch (error) {
            this.logger.error('Import error:', error);
            throw error;
        }
    }
    async bulkImportToDatabase(modelName, data, config) {
        const result = {
            success: true,
            totalRows: data.length,
            successRows: 0,
            errors: [],
        };
        try {
            const mappedData = config ? this.mapData(data, config) : data;
            const model = this.prisma[modelName];
            if (!model) {
                throw new Error(`Model ${modelName} not found`);
            }
            await this.prisma.$transaction(async (tx) => {
                const txModel = tx[modelName];
                for (let i = 0; i < mappedData.length; i++) {
                    try {
                        await txModel.create({
                            data: mappedData[i],
                        });
                        result.successRows++;
                    }
                    catch (error) {
                        this.logger.error(`Error importing row ${i + 1}:`, error);
                        result.errors.push({
                            row: i + 1,
                            error: error.message,
                        });
                    }
                }
            });
            result.success = result.errors.length === 0;
            this.logger.log(`Bulk import completed: ${result.successRows}/${result.totalRows} rows successful`);
            return result;
        }
        catch (error) {
            this.logger.error('Bulk import error:', error);
            throw error;
        }
    }
    async exportToExcel(modelName, where, select) {
        try {
            const model = this.prisma[modelName];
            if (!model) {
                throw new Error(`Model ${modelName} not found`);
            }
            const data = await model.findMany({
                where,
                select,
            });
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, modelName);
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            this.logger.log(`Exported ${data.length} rows to Excel`);
            return buffer;
        }
        catch (error) {
            this.logger.error('Export error:', error);
            throw error;
        }
    }
    validateData(data, requiredFields) {
        const errors = [];
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
};
exports.DataImportService = DataImportService;
exports.DataImportService = DataImportService = DataImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DataImportService);
//# sourceMappingURL=data-import.service.js.map