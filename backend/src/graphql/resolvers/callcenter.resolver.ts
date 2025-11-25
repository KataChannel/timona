import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CallCenterRecord,
  CallCenterConfig,
  CallCenterSyncLog,
  PaginatedCallCenterRecords,
  SyncCallCenterResponse,
} from '../models/callcenter.model';
import {
  CreateCallCenterConfigInput,
  UpdateCallCenterConfigInput,
  SyncCallCenterInput,
  CallCenterRecordFiltersInput,
} from '../inputs/callcenter.input';
import { PaginationInput } from '../models/pagination.model';
import { CallCenterService } from '../../services/callcenter.service';

@Resolver(() => CallCenterRecord)
export class CallCenterResolver {
  constructor(private readonly callCenterService: CallCenterService) {}

  // ============================================================================
  // CONFIG QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => CallCenterConfig, { name: 'getCallCenterConfig' })
  @UseGuards(JwtAuthGuard)
  async getConfig(): Promise<CallCenterConfig> {
    return this.callCenterService.getConfig() as any;
  }

  @Mutation(() => CallCenterConfig, { name: 'createCallCenterConfig' })
  @UseGuards(JwtAuthGuard)
  async createConfig(
    @Args('input') input: CreateCallCenterConfigInput,
  ): Promise<CallCenterConfig> {
    return this.callCenterService.createConfig(input) as any;
  }

  @Mutation(() => CallCenterConfig, { name: 'updateCallCenterConfig' })
  @UseGuards(JwtAuthGuard)
  async updateConfig(
    @Args('id') id: string,
    @Args('input') input: UpdateCallCenterConfigInput,
  ): Promise<CallCenterConfig> {
    return this.callCenterService.updateConfig(id, input) as any;
  }

  @Mutation(() => CallCenterConfig, { name: 'deleteCallCenterConfig' })
  @UseGuards(JwtAuthGuard)
  async deleteConfig(@Args('id') id: string): Promise<CallCenterConfig> {
    return this.callCenterService.deleteConfig(id) as any;
  }

  // ============================================================================
  // SYNC MUTATIONS
  // ============================================================================

  @Mutation(() => SyncCallCenterResponse, { name: 'syncCallCenterData' })
  @UseGuards(JwtAuthGuard)
  async syncData(
    @Args('input', { nullable: true }) input?: SyncCallCenterInput,
  ): Promise<SyncCallCenterResponse> {
    return this.callCenterService.syncCallCenterData(input);
  }

  // ============================================================================
  // RECORD QUERIES
  // ============================================================================

  @Query(() => PaginatedCallCenterRecords, { name: 'getCallCenterRecords' })
  @UseGuards(JwtAuthGuard)
  async getRecords(
    @Args('pagination', { defaultValue: { page: 1, limit: 20 } })
    pagination: PaginationInput,
    @Args('filters', { nullable: true })
    filters?: CallCenterRecordFiltersInput,
  ): Promise<PaginatedCallCenterRecords> {
    return this.callCenterService.getRecords(pagination, filters) as any;
  }

  @Query(() => CallCenterRecord, { name: 'getCallCenterRecordById' })
  @UseGuards(JwtAuthGuard)
  async getRecordById(@Args('id') id: string): Promise<CallCenterRecord> {
    return this.callCenterService.getRecordById(id) as any;
  }

  // ============================================================================
  // SYNC LOG QUERIES
  // ============================================================================

  @Query(() => [CallCenterSyncLog], { name: 'getCallCenterSyncLogs' })
  @UseGuards(JwtAuthGuard)
  async getSyncLogs(
    @Args('pagination', { defaultValue: { page: 1, limit: 20 } })
    pagination: PaginationInput,
  ) {
    const result = await this.callCenterService.getSyncLogs(pagination);
    return result.items;
  }
}
