import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsDateString, IsEnum, IsNotEmpty, IsBoolean, IsNumber, IsArray, MaxLength } from 'class-validator';
import { DocumentType } from '../../models/hr/enums.model';

@InputType()
export class CreateEmployeeDocumentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  employeeProfileId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => DocumentType)
  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  fileId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  fileName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileMimeType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingAuthority?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  accessibleBy?: string[];

  @Field()
  @IsNotEmpty()
  @IsString()
  uploadedBy: string;
}

@InputType()
export class UpdateEmployeeDocumentInput {
  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuingAuthority?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  verifiedAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  accessibleBy?: string[];
}
