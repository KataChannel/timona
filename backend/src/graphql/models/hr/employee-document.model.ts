import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { DocumentType } from './enums.model';

@ObjectType()
export class EmployeeDocument {
  @Field(() => ID)
  id: string;

  @Field()
  employeeProfileId: string;

  @Field()
  userId: string;

  @Field(() => DocumentType)
  documentType: DocumentType;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  // File Reference
  @Field()
  fileId: string;

  @Field()
  fileName: string;

  @Field()
  fileUrl: string;

  @Field(() => Int, { nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  fileMimeType?: string;

  // Document Metadata
  @Field({ nullable: true })
  documentNumber?: string;

  @Field({ nullable: true })
  issueDate?: Date;

  @Field({ nullable: true })
  expiryDate?: Date;

  @Field({ nullable: true })
  issuingAuthority?: string;

  // Verification
  @Field({ defaultValue: false })
  isVerified: boolean;

  @Field({ nullable: true })
  verifiedBy?: string;

  @Field({ nullable: true })
  verifiedAt?: Date;

  @Field({ nullable: true })
  verificationNotes?: string;

  // Access Control
  @Field({ defaultValue: false })
  isConfidential: boolean;

  @Field(() => [String], { nullable: true })
  accessibleBy?: string[];

  // Metadata
  @Field()
  uploadedBy: string;

  @Field()
  uploadedAt: Date;

  @Field()
  updatedAt: Date;
}
