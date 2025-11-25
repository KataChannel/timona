import { InputType, Field, Int } from '@nestjs/graphql';
import { CallCenterSyncMode, CallDirection, CallStatus } from '../models/callcenter.model';

@InputType()
export class CreateCallCenterConfigInput {
  @Field(() => String)
  apiUrl: string;

  @Field(() => String)
  domain: string;

  @Field(() => String, { nullable: true })
  apiKey?: string;

  @Field(() => CallCenterSyncMode, { defaultValue: CallCenterSyncMode.MANUAL })
  syncMode: CallCenterSyncMode;

  @Field(() => String, { nullable: true })
  cronExpression?: string;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => Int, { defaultValue: 30 })
  defaultDaysBack: number;

  @Field(() => Int, { defaultValue: 200 })
  batchSize: number;
}

@InputType()
export class UpdateCallCenterConfigInput {
  @Field(() => String, { nullable: true })
  apiUrl?: string;

  @Field(() => String, { nullable: true })
  domain?: string;

  @Field(() => String, { nullable: true })
  apiKey?: string;

  @Field(() => CallCenterSyncMode, { nullable: true })
  syncMode?: CallCenterSyncMode;

  @Field(() => String, { nullable: true })
  cronExpression?: string;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  defaultDaysBack?: number;

  @Field(() => Int, { nullable: true })
  batchSize?: number;
}

@InputType()
export class SyncCallCenterInput {
  @Field(() => String, { nullable: true })
  configId?: string;

  @Field(() => Date, { nullable: true })
  fromDate?: Date;

  @Field(() => Date, { nullable: true })
  toDate?: Date;

  @Field(() => Boolean, { defaultValue: false })
  fullSync?: boolean; // If true, sync all available data
}

@InputType()
export class CallCenterRecordFiltersInput {
  @Field(() => CallDirection, { nullable: true })
  direction?: CallDirection;

  @Field(() => CallStatus, { nullable: true })
  callStatus?: CallStatus;

  @Field(() => String, { nullable: true })
  callerIdNumber?: string;

  @Field(() => String, { nullable: true })
  destinationNumber?: string;

  @Field(() => String, { nullable: true })
  domain?: string;

  @Field(() => Date, { nullable: true })
  startDateFrom?: Date;

  @Field(() => Date, { nullable: true })
  startDateTo?: Date;

  @Field(() => String, { nullable: true })
  search?: string; // Search in caller, destination, etc.
}
