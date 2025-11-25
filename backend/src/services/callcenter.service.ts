import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  CreateCallCenterConfigInput,
  UpdateCallCenterConfigInput,
  SyncCallCenterInput,
  CallCenterRecordFiltersInput,
} from '../graphql/inputs/callcenter.input';
import { PaginationInput } from '../graphql/models/pagination.model';

interface ExternalCDRResponse {
  status: string;
  result_in_page: number;
  start_offset: string;
  next_offset: number;
  data: ExternalCDRRecord[];
}

interface ExternalCDRRecord {
  uuid: string;
  direction: string;
  caller_id_number?: string;
  outbound_caller_id_number?: string;
  destination_number?: string;
  start_epoch?: string;
  end_epoch?: string;
  answer_epoch?: string;
  duration?: string;
  billsec?: string;
  sip_hangup_disposition?: string;
  record_path?: string | null;
  call_status: string;
}

@Injectable()
export class CallCenterService {
  private readonly logger = new Logger(CallCenterService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CONFIG MANAGEMENT
  // ============================================================================

  async getConfig() {
    // Get first config or create default
    let config = await this.prisma.callCenterConfig.findFirst();

    if (!config) {
      this.logger.log('No config found, creating default config');
      config = await this.prisma.callCenterConfig.create({
        data: {
          apiUrl: 'https://pbx01.onepos.vn:8080/api/v2/cdrs',
          domain: 'tazaspa102019',
          syncMode: 'MANUAL',
          isActive: false,
          defaultDaysBack: 30,
          batchSize: 200,
        },
      });
    }

    return config;
  }

  async createConfig(input: CreateCallCenterConfigInput) {
    this.logger.log('Creating call center config');

    return this.prisma.callCenterConfig.create({
      data: input,
    });
  }

  async updateConfig(id: string, input: UpdateCallCenterConfigInput) {
    this.logger.log(`Updating call center config: ${id}`);
    this.logger.log(`Update input received: ${JSON.stringify(input)}`);

    // Filter out undefined values to ensure boolean false is preserved
    const updateData = Object.fromEntries(
      Object.entries(input).filter(([_, value]) => value !== undefined)
    );

    this.logger.log(`Update data after filtering: ${JSON.stringify(updateData)}`);

    const updated = await this.prisma.callCenterConfig.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated config result: ${JSON.stringify(updated)}`);
    return updated;
  }

  async deleteConfig(id: string) {
    this.logger.log(`Deleting call center config: ${id}`);

    return this.prisma.callCenterConfig.delete({
      where: { id },
    });
  }

  // ============================================================================
  // SYNC FUNCTIONALITY
  // ============================================================================

  async syncCallCenterData(input?: SyncCallCenterInput) {
    const startTime = Date.now();
    const config = input?.configId
      ? await this.prisma.callCenterConfig.findUnique({
          where: { id: input.configId },
        })
      : await this.getConfig();

    if (!config) {
      throw new HttpException('Config not found', HttpStatus.NOT_FOUND);
    }

    if (!config.isActive) {
      throw new HttpException('Config is not active', HttpStatus.BAD_REQUEST);
    }

    // Calculate date range
    const toDate = input?.toDate || new Date();
    const fromDate =
      input?.fromDate ||
      new Date(Date.now() - config.defaultDaysBack * 24 * 60 * 60 * 1000);

    // Create sync log
    const syncLog = await this.prisma.callCenterSyncLog.create({
      data: {
        configId: config.id,
        syncType: input?.fullSync ? 'MANUAL' : config.syncMode,
        status: 'running',
        fromDate,
        toDate,
        offset: 0,
      },
    });

    try {
      this.logger.log(
        `Starting sync from ${fromDate.toISOString()} to ${toDate.toISOString()}`,
      );

      let totalFetched = 0;
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        // Build API URL
        const apiUrl = this.buildApiUrl(config, fromDate, toDate, offset);
        this.logger.log(`Fetching from: ${apiUrl}`);

        // Fetch data from external API
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const result: ExternalCDRResponse = await response.json();

        if (result.status !== 'success') {
          throw new Error(`API returned error status: ${result.status}`);
        }

        const records = result.data || [];
        totalFetched += records.length;

        this.logger.log(
          `Fetched ${records.length} records (offset: ${offset})`,
        );

        // Process each record
        for (const record of records) {
          try {
            const existing = await this.prisma.callCenterRecord.findUnique({
              where: { externalUuid: record.uuid },
            });

            const data = {
              externalUuid: record.uuid,
              direction: record.direction.toUpperCase() as any,
              callerIdNumber: record.caller_id_number,
              outboundCallerIdNumber: record.outbound_caller_id_number,
              destinationNumber: record.destination_number,
              startEpoch: record.start_epoch,
              endEpoch: record.end_epoch,
              answerEpoch: record.answer_epoch,
              duration: record.duration,
              billsec: record.billsec,
              sipHangupDisposition: record.sip_hangup_disposition,
              callStatus: record.call_status.toUpperCase() as any,
              recordPath: record.record_path,
              domain: config.domain,
              rawData: record as any,
            };

            if (existing) {
              await this.prisma.callCenterRecord.update({
                where: { id: existing.id },
                data,
              });
              totalUpdated++;
            } else {
              await this.prisma.callCenterRecord.create({
                data,
              });
              totalCreated++;
            }
          } catch (error) {
            this.logger.error(
              `Error processing record ${record.uuid}: ${error.message}`,
            );
            totalSkipped++;
          }
        }

        // Check if there are more records
        if (records.length < config.batchSize) {
          hasMore = false;
        } else {
          offset = result.next_offset;
        }

        // Update sync log progress
        await this.prisma.callCenterSyncLog.update({
          where: { id: syncLog.id },
          data: {
            offset,
            recordsFetched: totalFetched,
            recordsCreated: totalCreated,
            recordsUpdated: totalUpdated,
            recordsSkipped: totalSkipped,
          },
        });
      }

      // Mark sync as completed
      const duration = Date.now() - startTime;
      await this.prisma.callCenterSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          duration,
        },
      });

      // Update config
      await this.prisma.callCenterConfig.update({
        where: { id: config.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'success',
          lastSyncError: null,
          totalRecordsSynced: config.totalRecordsSynced + totalCreated,
        },
      });

      this.logger.log(
        `Sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`,
      );

      return {
        success: true,
        message: 'Sync completed successfully',
        syncLogId: syncLog.id,
        recordsFetched: totalFetched,
        recordsCreated: totalCreated,
        recordsUpdated: totalUpdated,
      };
    } catch (error) {
      this.logger.error(`Sync failed: ${error.message}`);

      // Mark sync as failed
      await this.prisma.callCenterSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'error',
          errorMessage: error.message,
          errorDetails: { stack: error.stack },
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });

      // Update config
      await this.prisma.callCenterConfig.update({
        where: { id: config.id },
        data: {
          lastSyncStatus: 'error',
          lastSyncError: error.message,
        },
      });

      throw new HttpException(
        `Sync failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildApiUrl(
    config: any,
    fromDate: Date,
    toDate: Date,
    offset: number,
  ): string {
    const params = new URLSearchParams({
      domain: config.domain,
      limit: config.batchSize.toString(),
      from: this.formatDate(fromDate),
      to: this.formatDate(toDate),
      offset: offset.toString(),
    });

    return `${config.apiUrl}?${params.toString()}`;
  }

  private formatDate(date: Date): string {
    // Format: 2025-09-01 00:00:00
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // ============================================================================
  // CRON JOB
  // ============================================================================

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledSync() {
    this.logger.log('Running scheduled sync check');

    const config = await this.getConfig();

    if (!config || !config.isActive || config.syncMode !== 'SCHEDULED') {
      this.logger.log('Scheduled sync is not enabled');
      return;
    }

    try {
      await this.syncCallCenterData();
    } catch (error) {
      this.logger.error(`Scheduled sync failed: ${error.message}`);
    }
  }

  // ============================================================================
  // QUERY RECORDS
  // ============================================================================

  async getRecords(
    pagination: PaginationInput,
    filters?: CallCenterRecordFiltersInput,
  ) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters) {
      if (filters.direction) {
        where.direction = filters.direction;
      }
      if (filters.callStatus) {
        where.callStatus = filters.callStatus;
      }
      if (filters.callerIdNumber) {
        where.callerIdNumber = { contains: filters.callerIdNumber };
      }
      if (filters.destinationNumber) {
        where.destinationNumber = { contains: filters.destinationNumber };
      }
      if (filters.domain) {
        where.domain = filters.domain;
      }
      if (filters.startDateFrom || filters.startDateTo) {
        where.syncedAt = {};
        if (filters.startDateFrom) {
          where.syncedAt.gte = filters.startDateFrom;
        }
        if (filters.startDateTo) {
          where.syncedAt.lte = filters.startDateTo;
        }
      }
      if (filters.search) {
        where.OR = [
          { callerIdNumber: { contains: filters.search } },
          { destinationNumber: { contains: filters.search } },
          { outboundCallerIdNumber: { contains: filters.search } },
        ];
      }
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.callCenterRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { syncedAt: 'desc' },
      }),
      this.prisma.callCenterRecord.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getRecordById(id: string) {
    return this.prisma.callCenterRecord.findUnique({
      where: { id },
    });
  }

  async getSyncLogs(pagination: PaginationInput) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.callCenterSyncLog.findMany({
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.callCenterSyncLog.count(),
    ]);

    return {
      items,
      total: totalItems,
    };
  }
}
