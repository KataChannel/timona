"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CallCenterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallCenterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let CallCenterService = CallCenterService_1 = class CallCenterService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CallCenterService_1.name);
    }
    async getConfig() {
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
    async createConfig(input) {
        this.logger.log('Creating call center config');
        return this.prisma.callCenterConfig.create({
            data: input,
        });
    }
    async updateConfig(id, input) {
        this.logger.log(`Updating call center config: ${id}`);
        this.logger.log(`Update input received: ${JSON.stringify(input)}`);
        const updateData = Object.fromEntries(Object.entries(input).filter(([_, value]) => value !== undefined));
        this.logger.log(`Update data after filtering: ${JSON.stringify(updateData)}`);
        const updated = await this.prisma.callCenterConfig.update({
            where: { id },
            data: updateData,
        });
        this.logger.log(`Updated config result: ${JSON.stringify(updated)}`);
        return updated;
    }
    async deleteConfig(id) {
        this.logger.log(`Deleting call center config: ${id}`);
        return this.prisma.callCenterConfig.delete({
            where: { id },
        });
    }
    async syncCallCenterData(input) {
        const startTime = Date.now();
        const config = input?.configId
            ? await this.prisma.callCenterConfig.findUnique({
                where: { id: input.configId },
            })
            : await this.getConfig();
        if (!config) {
            throw new common_1.HttpException('Config not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (!config.isActive) {
            throw new common_1.HttpException('Config is not active', common_1.HttpStatus.BAD_REQUEST);
        }
        const toDate = input?.toDate || new Date();
        const fromDate = input?.fromDate ||
            new Date(Date.now() - config.defaultDaysBack * 24 * 60 * 60 * 1000);
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
            this.logger.log(`Starting sync from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
            let totalFetched = 0;
            let totalCreated = 0;
            let totalUpdated = 0;
            let totalSkipped = 0;
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const apiUrl = this.buildApiUrl(config, fromDate, toDate, offset);
                this.logger.log(`Fetching from: ${apiUrl}`);
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.statusText}`);
                }
                const result = await response.json();
                if (result.status !== 'success') {
                    throw new Error(`API returned error status: ${result.status}`);
                }
                const records = result.data || [];
                totalFetched += records.length;
                this.logger.log(`Fetched ${records.length} records (offset: ${offset})`);
                for (const record of records) {
                    try {
                        const existing = await this.prisma.callCenterRecord.findUnique({
                            where: { externalUuid: record.uuid },
                        });
                        const data = {
                            externalUuid: record.uuid,
                            direction: record.direction.toUpperCase(),
                            callerIdNumber: record.caller_id_number,
                            outboundCallerIdNumber: record.outbound_caller_id_number,
                            destinationNumber: record.destination_number,
                            startEpoch: record.start_epoch,
                            endEpoch: record.end_epoch,
                            answerEpoch: record.answer_epoch,
                            duration: record.duration,
                            billsec: record.billsec,
                            sipHangupDisposition: record.sip_hangup_disposition,
                            callStatus: record.call_status.toUpperCase(),
                            recordPath: record.record_path,
                            domain: config.domain,
                            rawData: record,
                        };
                        if (existing) {
                            await this.prisma.callCenterRecord.update({
                                where: { id: existing.id },
                                data,
                            });
                            totalUpdated++;
                        }
                        else {
                            await this.prisma.callCenterRecord.create({
                                data,
                            });
                            totalCreated++;
                        }
                    }
                    catch (error) {
                        this.logger.error(`Error processing record ${record.uuid}: ${error.message}`);
                        totalSkipped++;
                    }
                }
                if (records.length < config.batchSize) {
                    hasMore = false;
                }
                else {
                    offset = result.next_offset;
                }
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
            const duration = Date.now() - startTime;
            await this.prisma.callCenterSyncLog.update({
                where: { id: syncLog.id },
                data: {
                    status: 'success',
                    completedAt: new Date(),
                    duration,
                },
            });
            await this.prisma.callCenterConfig.update({
                where: { id: config.id },
                data: {
                    lastSyncAt: new Date(),
                    lastSyncStatus: 'success',
                    lastSyncError: null,
                    totalRecordsSynced: config.totalRecordsSynced + totalCreated,
                },
            });
            this.logger.log(`Sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`);
            return {
                success: true,
                message: 'Sync completed successfully',
                syncLogId: syncLog.id,
                recordsFetched: totalFetched,
                recordsCreated: totalCreated,
                recordsUpdated: totalUpdated,
            };
        }
        catch (error) {
            this.logger.error(`Sync failed: ${error.message}`);
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
            await this.prisma.callCenterConfig.update({
                where: { id: config.id },
                data: {
                    lastSyncStatus: 'error',
                    lastSyncError: error.message,
                },
            });
            throw new common_1.HttpException(`Sync failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    buildApiUrl(config, fromDate, toDate, offset) {
        const params = new URLSearchParams({
            domain: config.domain,
            limit: config.batchSize.toString(),
            from: this.formatDate(fromDate),
            to: this.formatDate(toDate),
            offset: offset.toString(),
        });
        return `${config.apiUrl}?${params.toString()}`;
    }
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    async handleScheduledSync() {
        this.logger.log('Running scheduled sync check');
        const config = await this.getConfig();
        if (!config || !config.isActive || config.syncMode !== 'SCHEDULED') {
            this.logger.log('Scheduled sync is not enabled');
            return;
        }
        try {
            await this.syncCallCenterData();
        }
        catch (error) {
            this.logger.error(`Scheduled sync failed: ${error.message}`);
        }
    }
    async getRecords(pagination, filters) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getRecordById(id) {
        return this.prisma.callCenterRecord.findUnique({
            where: { id },
        });
    }
    async getSyncLogs(pagination) {
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
};
exports.CallCenterService = CallCenterService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallCenterService.prototype, "handleScheduledSync", null);
exports.CallCenterService = CallCenterService = CallCenterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CallCenterService);
//# sourceMappingURL=callcenter.service.js.map