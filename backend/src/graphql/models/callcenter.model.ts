import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

// Enums
export enum CallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  LOCAL = 'LOCAL',
}

export enum CallStatus {
  ANSWER = 'ANSWER',
  CANCELED = 'CANCELED',
  BUSY = 'BUSY',
  NO_ANSWER = 'NO_ANSWER',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

export enum CallCenterSyncMode {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
}

// Register enums
registerEnumType(CallDirection, {
  name: 'CallDirection',
  description: 'Direction of the call',
});

registerEnumType(CallStatus, {
  name: 'CallStatus',
  description: 'Status of the call',
});

registerEnumType(CallCenterSyncMode, {
  name: 'CallCenterSyncMode',
  description: 'Sync mode for call center data',
});

// Models
@ObjectType()
export class CallCenterRecord {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  externalUuid: string;

  @Field(() => CallDirection)
  direction: CallDirection;

  @Field(() => String, { nullable: true })
  callerIdNumber?: string;

  @Field(() => String, { nullable: true })
  outboundCallerIdNumber?: string;

  @Field(() => String, { nullable: true })
  destinationNumber?: string;

  @Field(() => String, { nullable: true })
  startEpoch?: string;

  @Field(() => String, { nullable: true })
  endEpoch?: string;

  @Field(() => String, { nullable: true })
  answerEpoch?: string;

  @Field(() => String, { nullable: true })
  duration?: string;

  @Field(() => String, { nullable: true })
  billsec?: string;

  @Field(() => String, { nullable: true })
  sipHangupDisposition?: string;

  @Field(() => CallStatus)
  callStatus: CallStatus;

  @Field(() => String, { nullable: true })
  recordPath?: string;

  @Field(() => String, { nullable: true })
  domain?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  rawData?: any;

  @Field(() => Date)
  syncedAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class CallCenterConfig {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  apiUrl: string;

  @Field(() => String)
  domain: string;

  @Field(() => String, { nullable: true })
  apiKey?: string;

  @Field(() => CallCenterSyncMode)
  syncMode: CallCenterSyncMode;

  @Field(() => String, { nullable: true })
  cronExpression?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Int)
  defaultDaysBack: number;

  @Field(() => Int)
  batchSize: number;

  @Field(() => Date, { nullable: true })
  lastSyncAt?: Date;

  @Field(() => String, { nullable: true })
  lastSyncStatus?: string;

  @Field(() => String, { nullable: true })
  lastSyncError?: string;

  @Field(() => Int)
  totalRecordsSynced: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class CallCenterSyncLog {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  configId?: string;

  @Field(() => CallCenterSyncMode)
  syncType: CallCenterSyncMode;

  @Field(() => String)
  status: string;

  @Field(() => Date)
  fromDate: Date;

  @Field(() => Date)
  toDate: Date;

  @Field(() => Int)
  offset: number;

  @Field(() => Int)
  recordsFetched: number;

  @Field(() => Int)
  recordsCreated: number;

  @Field(() => Int)
  recordsUpdated: number;

  @Field(() => Int)
  recordsSkipped: number;

  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  errorDetails?: any;

  @Field(() => Date)
  startedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Int, { nullable: true })
  duration?: number;
}

// Pagination
@ObjectType()
export class CallCenterRecordPaginationInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

@ObjectType()
export class PaginatedCallCenterRecords {
  @Field(() => [CallCenterRecord])
  items: CallCenterRecord[];

  @Field(() => CallCenterRecordPaginationInfo)
  pagination: CallCenterRecordPaginationInfo;
}

// Sync response
@ObjectType()
export class SyncCallCenterResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  syncLogId?: string;

  @Field(() => Int)
  recordsFetched: number;

  @Field(() => Int)
  recordsCreated: number;

  @Field(() => Int)
  recordsUpdated: number;

  @Field(() => String, { nullable: true })
  error?: string;
}
