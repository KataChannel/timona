import { DocumentType } from '../../models/hr/enums.model';
export declare class CreateEmployeeDocumentInput {
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
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
    isConfidential?: boolean;
    accessibleBy?: string[];
    uploadedBy: string;
}
export declare class UpdateEmployeeDocumentInput {
    documentType?: DocumentType;
    title?: string;
    description?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
    isVerified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    isConfidential?: boolean;
    accessibleBy?: string[];
}
