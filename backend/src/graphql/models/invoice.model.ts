import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class ExtListhoadon {
  @Field(() => ID)
  id: string;

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
  hdon?: string;

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

  @Field(() => String, { nullable: true })
  nbdctdtu?: string;

  @Field(() => String, { nullable: true })
  nbfax?: string;

  @Field(() => String, { nullable: true })
  nbwebsite?: string;

  // Buyer Information
  @Field(() => String, { nullable: true })
  nmdchi?: string;

  @Field(() => String, { nullable: true })
  nmmst?: string;

  @Field(() => String, { nullable: true })
  nmten?: string;

  @Field(() => String, { nullable: true })
  nmstkhoan?: string;

  @Field(() => String, { nullable: true })
  nmsdthoai?: string;

  @Field(() => String, { nullable: true })
  nmdctdtu?: string;

  @Field(() => String, { nullable: true })
  nmcmnd?: string;

  // Process Information
  @Field(() => Date, { nullable: true })
  tdlap?: Date;

  @Field(() => Float, { nullable: true })
  tgia?: number;

  // Amounts
  @Field(() => Float, { nullable: true })
  tgtcthue?: number;

  @Field(() => Float, { nullable: true })
  tgtthue?: number;

  @Field(() => String, { nullable: true })
  tgtttbchu?: string;

  @Field(() => Float, { nullable: true })
  tgtttbso?: number;

  @Field(() => Float, { nullable: true })
  tgtphi?: number;

  @Field(() => Float, { nullable: true })
  tgtkcthue?: number;

  @Field(() => Float, { nullable: true })
  tgtkhac?: number;

  // Status and Processing
  @Field(() => String, { nullable: true })
  thdon?: string;

  @Field(() => String, { nullable: true })
  thlap?: string;

  @Field(() => String, { nullable: true })
  tlhdon?: string;

  @Field(() => String, { nullable: true })
  tthai?: string;

  @Field(() => String, { nullable: true })
  tttbao?: string;

  @Field(() => String, { nullable: true })
  ttxly?: string;

  // Additional Fields
  @Field(() => String, { nullable: true })
  mhso?: string;

  @Field(() => Boolean, { nullable: true })
  ladhddt?: boolean;

  @Field(() => String, { nullable: true })
  mkhang?: string;

  @Field(() => String, { nullable: true })
  qrcode?: string;

  @Field(() => String, { nullable: true })
  gchu?: string;

  @Field(() => String, { nullable: true })
  msttcgp?: string;

  // Brand name from configuration
  @Field(() => String, { nullable: true })
  brandname?: string;

  // Duplicate Handling
  @Field(() => String, { nullable: true })
  hdTrung?: string;

  @Field(() => Boolean, { nullable: true })
  isHDTrung?: boolean;

  // Timestamps
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relationships
  @Field(() => [ExtDetailhoadon], { nullable: true })
  details?: ExtDetailhoadon[];
}

@ObjectType()
export class ExtDetailhoadon {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  idhdon: string;

  // Item Information
  @Field(() => Float, { nullable: true })
  dgia?: number;

  @Field(() => String, { nullable: true })
  dvtinh?: string;

  @Field(() => Float, { nullable: true })
  ltsuat?: number;

  @Field(() => Float, { nullable: true })
  sluong?: number;

  @Field(() => String, { nullable: true })
  stbchu?: string;

  @Field(() => Float, { nullable: true })
  stckhau?: number;

  @Field(() => Int, { nullable: true })
  stt?: number;

  @Field(() => String, { nullable: true })
  tchat?: string;

  @Field(() => String, { nullable: true })
  ten?: string;

  @Field(() => Float, { nullable: true })
  thtcthue?: number;

  @Field(() => Float, { nullable: true })
  thtien?: number;

  @Field(() => Float, { nullable: true })
  tlckhau?: number;

  @Field(() => Float, { nullable: true })
  tsuat?: number;

  @Field(() => Float, { nullable: true })
  tthue?: number;

  @Field(() => Int, { nullable: true })
  sxep?: number;

  @Field(() => String, { nullable: true })
  dvtte?: string;

  @Field(() => Float, { nullable: true })
  tgia?: number;

  @Field(() => String, { nullable: true })
  tthhdtrung?: string;

  // Timestamps
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relationships
  @Field(() => ExtListhoadon, { nullable: true })
  invoice?: ExtListhoadon;
}

@ObjectType()
export class InvoiceStats {
  @Field(() => Int)
  totalInvoices: number;

  @Field(() => Int)
  totalDetails: number;

  @Field(() => Date, { nullable: true })
  lastSyncDate?: Date;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  totalTax: number;
}

@ObjectType()
export class InvoiceSearchResult {
  @Field(() => [ExtListhoadon])
  invoices: ExtListhoadon[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  size: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class DatabaseSyncResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => Int)
  invoicesSaved: number;

  @Field(() => Int)
  detailsSaved: number;

  @Field(() => [String])
  errors: string[];

  @Field(() => String)
  message: string;
}

@ObjectType()
export class ImportError {
  @Field(() => Int)
  row: number;

  @Field(() => String)
  error: string;

  @Field(() => String, { nullable: true })
  data?: string;
}

@ObjectType()
export class ImportStatistics {
  @Field(() => Int)
  totalInvoices: number;

  @Field(() => Int)
  totalDetails: number;

  @Field(() => Int)
  invoicesCreated: number;

  @Field(() => Int)
  detailsCreated: number;

  @Field(() => Int)
  duplicatesSkipped: number;

  @Field(() => Int)
  validationErrors: number;
}

@ObjectType()
export class InvoiceCreated {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  shdon: string;

  @Field(() => String)
  khhdon: string;

  @Field(() => String)
  nbten: string;

  @Field(() => String)
  nmten: string;

  @Field(() => Float)
  tgtttbso: number;

  @Field(() => Int)
  detailsCount: number;

  @Field(() => String)
  status: string; // 'created' | 'duplicate' | 'error'
}

@ObjectType()
export class ImportResult {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => Int)
  totalRows: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  errorCount: number;

  @Field(() => [ImportError])
  errors: ImportError[];

  @Field(() => [String])
  invoiceIds: string[];

  @Field(() => String)
  message: string;

  @Field(() => ImportStatistics)
  statistics: ImportStatistics;

  @Field(() => [InvoiceCreated])
  invoicesCreated: InvoiceCreated[];
}
