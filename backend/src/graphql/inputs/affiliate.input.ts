import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';
import { IsNotEmpty, IsString, IsOptional, IsUrl, Length, Matches } from 'class-validator';

// ===== AFF USER INPUTS =====
@InputType()
export class CreateAffUserInput {
  @Field(() => $Enums.AffUserRole)
  role: $Enums.AffUserRole;

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  businessType?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => $Enums.AffPaymentMethod, { nullable: true })
  paymentMethod?: $Enums.AffPaymentMethod;

  @Field({ nullable: true })
  bankAccount?: string;

  @Field({ nullable: true })
  paypalEmail?: string;

  @Field({ nullable: true })
  taxId?: string;
}

@InputType()
export class UpdateAffUserInput {
  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  businessType?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => $Enums.AffPaymentMethod, { nullable: true })
  paymentMethod?: $Enums.AffPaymentMethod;

  @Field({ nullable: true })
  bankAccount?: string;

  @Field({ nullable: true })
  paypalEmail?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

// ===== CAMPAIGN INPUTS =====
@InputType()
export class CreateCampaignInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  productName: string;

  @Field()
  productUrl: string;

  @Field({ nullable: true })
  productImage?: string;

  @Field(() => Float)
  commissionRate: number;

  @Field({ defaultValue: 'percentage' })
  commissionType: string;

  @Field(() => Float, { nullable: true })
  fixedAmount?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  maxAffiliates?: number;

  @Field({ defaultValue: true })
  requireApproval: boolean;
}

@InputType()
export class UpdateCampaignInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  productUrl?: string;

  @Field({ nullable: true })
  productImage?: string;

  @Field(() => Float, { nullable: true })
  commissionRate?: number;

  @Field({ nullable: true })
  commissionType?: string;

  @Field(() => Float, { nullable: true })
  fixedAmount?: number;

  @Field(() => $Enums.AffCampaignStatus, { nullable: true })
  status?: $Enums.AffCampaignStatus;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  maxAffiliates?: number;

  @Field({ nullable: true })
  requireApproval?: boolean;
}

@InputType()
export class CampaignSearchInput {
  @Field({ nullable: true })
  query?: string;

  @Field(() => $Enums.AffCampaignStatus, { nullable: true })
  status?: $Enums.AffCampaignStatus;

  @Field({ nullable: true })
  creatorId?: string;

  @Field(() => Float, { nullable: true })
  minCommissionRate?: number;

  @Field(() => Float, { nullable: true })
  maxCommissionRate?: number;

  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  size: number;

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true })
  sortOrder?: string;
}

// ===== CAMPAIGN JOIN INPUTS =====
@InputType()
export class JoinCampaignInput {
  @Field()
  campaignId: string;

  @Field({ nullable: true })
  message?: string; // Application message
}

@InputType()
export class ReviewCampaignApplicationInput {
  @Field()
  applicationId: string;

  @Field()
  action: string; // 'approve' | 'reject'

  @Field({ nullable: true })
  reason?: string;
}

// ===== LINK GENERATION INPUTS =====
@InputType()
export class CreateAffLinkInput {
  @Field()
  @IsNotEmpty({ message: 'Campaign ID is required' })
  @IsString()
  campaignId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Original URL must be a valid URL' })
  originalUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Custom alias must be between 1 and 100 characters' })
  @Matches(/^[a-z0-9-]+$/, { message: 'Custom alias must be lowercase alphanumeric with hyphens only' })
  customAlias?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 200, { message: 'Title must be between 1 and 200 characters' })
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @Field({ nullable: true })
  utmContent?: string;

  @Field({ nullable: true })
  expiresAt?: Date;
}

@InputType()
export class UpdateAffLinkInput {
  @Field({ nullable: true })
  utmSource?: string;

  @Field({ nullable: true })
  utmMedium?: string;

  @Field({ nullable: true })
  utmCampaign?: string;

  @Field({ nullable: true })
  utmContent?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  expiresAt?: Date;
}

// ===== CONVERSION TRACKING INPUTS =====
@InputType()
export class TrackConversionInput {
  @Field()
  trackingCode: string;

  @Field({ nullable: true })
  orderId?: string;

  @Field({ nullable: true })
  customerEmail?: string;

  @Field(() => Float)
  saleAmount: number;

  @Field({ defaultValue: 'sale' })
  conversionType: string;
}

@InputType()
export class ReviewConversionInput {
  @Field()
  conversionId: string;

  @Field(() => $Enums.AffConversionStatus)
  status: $Enums.AffConversionStatus;

  @Field({ nullable: true })
  notes?: string;
}

// ===== PAYMENT REQUEST INPUTS =====
@InputType()
export class CreatePaymentRequestInput {
  @Field(() => Float)
  amount: number;

  @Field(() => $Enums.AffPaymentMethod)
  paymentMethod: $Enums.AffPaymentMethod;

  @Field({ nullable: true })
  accountDetails?: string;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class ProcessPaymentRequestInput {
  @Field()
  paymentRequestId: string;

  @Field(() => $Enums.AffPaymentStatus)
  status: $Enums.AffPaymentStatus;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  adminNotes?: string;
}

// ===== ANALYTICS AND REPORTING INPUTS =====
@InputType()
export class AffDateRangeInput {
  @Field()
  startDate: Date;

  @Field()
  endDate: Date;
}

@InputType()
export class AffAnalyticsInput {
  @Field(() => AffDateRangeInput, { nullable: true })
  dateRange?: AffDateRangeInput;

  @Field({ nullable: true })
  campaignId?: string;

  @Field({ nullable: true })
  affiliateId?: string;

  @Field({ nullable: true })
  groupBy?: string; // 'day', 'week', 'month'
}

// ===== PAGINATION AND FILTERING =====
@InputType()
export class AffPaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  size: number;

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true })
  sortOrder?: string; // 'asc' | 'desc'
}

@InputType()
export class AffLinkSearchInput {
  @Field({ nullable: true })
  campaignId?: string;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => AffPaginationInput, { nullable: true })
  pagination?: AffPaginationInput;
}

@InputType()
export class AffConversionSearchInput {
  @Field({ nullable: true })
  campaignId?: string;

  @Field({ nullable: true })
  affiliateId?: string;

  @Field(() => $Enums.AffConversionStatus, { nullable: true })
  status?: $Enums.AffConversionStatus;

  @Field(() => AffDateRangeInput, { nullable: true })
  dateRange?: AffDateRangeInput;

  @Field(() => AffPaginationInput, { nullable: true })
  pagination?: AffPaginationInput;
}

@InputType()
export class AffPaymentRequestSearchInput {
  @Field({ nullable: true })
  affiliateId?: string;

  @Field(() => $Enums.AffPaymentStatus, { nullable: true })
  status?: $Enums.AffPaymentStatus;

  @Field(() => AffDateRangeInput, { nullable: true })
  dateRange?: AffDateRangeInput;

  @Field(() => AffPaginationInput, { nullable: true })
  pagination?: AffPaginationInput;
}