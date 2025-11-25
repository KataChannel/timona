import { DocumentType } from './enums.model';
export declare class EmployeeDocument {
    id: string;
    employeeProfileId: string;
    userId: string;
    documentType: DocumentType;
    title: string;
    description?: string;
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileMimeType?: string;
    documentNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingAuthority?: string;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
    verificationNotes?: string;
    isConfidential: boolean;
    accessibleBy?: string[];
    uploadedBy: string;
    uploadedAt: Date;
    updatedAt: Date;
}
