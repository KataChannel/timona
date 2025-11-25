import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CreateInvoiceInput {
  @Field(() => String, { nullable: true })
  idServer?: string;

  // Basic Invoice Info
  @Field(() => String, { nullable: true })
  nbmst?: string;

  @Field(() => String, { nullable: true })
  khmshdon?: string;

  @Field(() => String, { nullable: true })
  khhdon?: string;

  @Field(() => String, { nullable: true })
  shdon?: string;

  @Field(() => String, { nullable: true })
  cqt?: string;

  @Field(() => String, { nullable: true })
  hthdon?: string;

  @Field(() => String, { nullable: true })
  htttoan?: string;

  // Seller Information
  @Field(() => String, { nullable: true })
  nbdchi?: string;

  @Field(() => String, { nullable: true })
  nbten?: string;

  @Field(() => String, { nullable: true })
  nbstkhoan?: string;

  @Field(() => String, { nullable: true })
  nbsdthoai?: string;

  // Buyer Information
  @Field(() => String, { nullable: true })
  nmdchi?: string;

  @Field(() => String, { nullable: true })
  nmmst?: string;

  @Field(() => String, { nullable: true })
  nmten?: string;

  @Field(() => String, { nullable: true })
  nmstkhoan?: string;

  // Process Information
  @Field(() => Date, { nullable: true })
  tdlap?: Date;

  // Amounts
  @Field(() => Float, { nullable: true })
  tgtcthue?: number;

  @Field(() => Float, { nullable: true })
  tgtthue?: number;

  @Field(() => String, { nullable: true })
  tgtttbchu?: string;

  @Field(() => Float, { nullable: true })
  tgtttbso?: number;

  // Status
  @Field(() => String, { nullable: true })
  tthai?: string;

  @Field(() => String, { nullable: true })
  gchu?: string;

  @Field(() => Boolean, { nullable: true })
  ladhddt?: boolean;

  // Brand name from configuration
  @Field(() => String, { nullable: true })
  brandname?: string;
}

@InputType()
export class CreateInvoiceDetailInput {
  @Field(() => String)
  idhdon: string;

  @Field(() => Float, { nullable: true })
  dgia?: number;

  @Field(() => String, { nullable: true })
  dvtinh?: string;

  @Field(() => Float, { nullable: true })
  sluong?: number;

  @Field(() => Int, { nullable: true })
  stt?: number;

  @Field(() => String, { nullable: true })
  ten?: string;

  @Field(() => Float, { nullable: true })
  thtien?: number;

  @Field(() => Float, { nullable: true })
  tsuat?: number;

  @Field(() => Float, { nullable: true })
  tthue?: number;
}

@InputType()
export class InvoiceSearchInput {
  @Field(() => String, { nullable: true })
  nbmst?: string;

  @Field(() => String, { nullable: true })
  nmmst?: string;

  @Field(() => String, { nullable: true })
  khmshdon?: string;

  @Field(() => String, { nullable: true })
  shdon?: string;

  @Field(() => Date, { nullable: true })
  fromDate?: Date;

  @Field(() => Date, { nullable: true })
  toDate?: Date;

  @Field(() => String, { nullable: true })
  tthai?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  size?: number;

  @Field(() => String, { nullable: true, defaultValue: 'tdlap' })
  sortBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  sortOrder?: string;
}

@InputType()
export class BulkInvoiceInput {
  @Field(() => [CreateInvoiceInput])
  invoices: CreateInvoiceInput[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  skipExisting?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  includeDetails?: boolean;

  @Field(() => String, { nullable: true })
  bearerToken?: string;
}