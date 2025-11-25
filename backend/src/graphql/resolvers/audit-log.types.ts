import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class AuditLogUser {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}

@ObjectType()
export class AuditLog {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  sessionId?: string;

  @Field()
  action: string;

  @Field()
  resourceType: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field({ nullable: true })
  entityName?: string;

  @Field({ nullable: true })
  parentResourceType?: string;

  @Field({ nullable: true })
  parentResourceId?: string;

  @Field({ nullable: true })
  operationType?: string;

  @Field()
  severity: string;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  batchId?: string;

  @Field({ nullable: true })
  batchSize?: number;

  @Field({ nullable: true })
  batchIndex?: number;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  method?: string;

  @Field({ nullable: true })
  endpoint?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  oldValues?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  newValues?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  details?: any;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  errorCode?: string;

  @Field({ nullable: true })
  responseTime?: number;

  @Field({ nullable: true })
  requestSize?: number;

  @Field({ nullable: true })
  responseSize?: number;

  @Field({ nullable: true })
  dbQueryTime?: number;

  @Field({ nullable: true })
  dbQueryCount?: number;

  @Field({ nullable: true })
  memoryUsage?: number;

  @Field({ nullable: true })
  cpuUsage?: number;

  @Field({ nullable: true })
  statusCode?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  performanceData?: any;

  @Field()
  requiresReview: boolean;

  @Field()
  sensitiveData: boolean;

  @Field({ nullable: true })
  retentionPeriod?: number;

  @Field({ nullable: true })
  correlationId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  sessionInfo?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  clientInfo?: any;

  @Field()
  timestamp: Date;

  @Field()
  createdAt: Date;

  @Field(() => AuditLogUser, { nullable: true })
  user?: AuditLogUser;
}

@InputType()
export class AuditLogFilter {
  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  resourceType?: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  operationType?: string;

  @Field({ nullable: true })
  severity?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  dateFrom?: Date;

  @Field({ nullable: true })
  dateTo?: Date;

  @Field({ nullable: true })
  correlationId?: string;

  @Field({ nullable: true })
  batchId?: string;

  @Field({ nullable: true })
  sensitiveData?: boolean;

  @Field({ nullable: true })
  requiresReview?: boolean;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class PaginatedAuditLogs {
  @Field(() => [AuditLog])
  logs: AuditLog[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
export class OperationTypeCount {
  @Field()
  operationType: string;

  @Field(() => Int)
  _count: {
    operationType: number;
  };
}

@ObjectType()
export class SeverityCount {
  @Field()
  severity: string;

  @Field(() => Int)
  _count: {
    severity: number;
  };
}

@ObjectType()
export class ResourceTypeCount {
  @Field()
  resourceType: string;

  @Field(() => Int)
  _count: {
    resourceType: number;
  };
}

@ObjectType()
export class AuditLogStats {
  @Field(() => Int)
  totalLogs: number;

  @Field()
  successRate: number;

  @Field(() => [OperationTypeCount])
  operationsByType: OperationTypeCount[];

  @Field(() => [SeverityCount])
  severityBreakdown: SeverityCount[];

  @Field(() => [ResourceTypeCount])
  topResources: ResourceTypeCount[];

  @Field({ nullable: true })
  averageResponseTime?: number;
}