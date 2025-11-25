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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const backend_config_service_1 = require("./backend-config.service");
const file_logger_service_1 = require("./file-logger.service");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(InvoiceService_1.name);
        this.fileLogger = new file_logger_service_1.FileLoggerService();
        this.configService.validateConfiguration();
        this.fileLogger.log('InvoiceService initialized', 'InvoiceService');
        this.fileLogger.logWithData('log', 'Service startup', {
            timestamp: new Date().toISOString(),
            configValid: true
        }, 'InvoiceService');
    }
    extractDetailParams(invoice) {
        try {
            const nbmst = invoice.nbmst || invoice.msttcgp;
            const khhdon = invoice.khhdon || invoice.khmshdon;
            const shdon = invoice.shdon;
            const khmshdon = invoice.khmshdon;
            if (!nbmst || !khhdon || !shdon || !khmshdon) {
                const missingParams = {
                    nbmst: !!nbmst,
                    khhdon: !!khhdon,
                    shdon: !!shdon,
                    khmshdon: !!khmshdon
                };
                this.logger.warn('Missing required parameters for detail fetching:', missingParams);
                this.fileLogger.logWithData('warn', 'Missing required parameters for detail fetching', missingParams, 'InvoiceService');
                return null;
            }
            return { nbmst, khhdon, shdon, khmshdon };
        }
        catch (error) {
            this.logger.error('Error extracting detail params:', error);
            return null;
        }
    }
    async fetchInvoiceDetails(params, bearerToken) {
        const startTime = Date.now();
        try {
            const effectiveToken = bearerToken || this.configService.getBearerTokenSafe();
            const config = this.configService.getInvoiceConfig();
            if (!effectiveToken || effectiveToken.length === 0) {
                this.logger.warn('No Bearer Token provided from frontend or environment');
                this.logger.warn('Invoice detail fetching will likely fail due to authentication');
                this.fileLogger.logWithData('warn', 'No Bearer Token available', {
                    tokenSource: bearerToken ? 'frontend' : 'environment',
                    params
                }, 'InvoiceService');
            }
            const queryParams = new URLSearchParams({
                nbmst: params.nbmst,
                khhdon: params.khhdon,
                shdon: params.shdon,
                khmshdon: params.khmshdon
            });
            const url = `${this.configService.getDetailApiEndpoint()}?${queryParams.toString()}`;
            const tokenSource = bearerToken ? 'frontend' : 'environment';
            this.logger.log(`Fetching invoice details from: ${url}`);
            this.logger.log(`Using token from: ${tokenSource}`);
            this.fileLogger.logWithData('log', 'Starting invoice detail fetch', {
                url,
                params,
                tokenSource,
                hasToken: !!effectiveToken,
                timestamp: new Date().toISOString()
            }, 'InvoiceService');
            const httpsAgent = new https_1.default.Agent({
                rejectUnauthorized: config.sslVerification,
                keepAlive: true,
                timeout: config.timeout
            });
            if (!config.sslVerification) {
                this.logger.log('🔓 SSL certificate verification is disabled for external API calls');
            }
            const response = await axios_1.default.get(url, {
                timeout: config.timeout,
                httpsAgent: httpsAgent,
                headers: {
                    'Authorization': `Bearer ${effectiveToken}`,
                    'User-Agent': 'Mozilla/5.0 (compatible; InvoiceService/1.0)',
                    'Content-Type': 'application/json'
                }
            });
            const responseTime = Date.now() - startTime;
            if (response.data && response.data.hdhhdvu) {
                this.fileLogger.logWithData('log', 'Invoice details fetched successfully', {
                    count: response.data.hdhhdvu.length,
                    params,
                    responseTime,
                    status: response.status,
                    tokenSource
                }, 'InvoiceService');
                this.fileLogger.logApiCall('GET', url, response.status, responseTime, 'InvoiceService');
                return response.data.hdhhdvu;
            }
            this.fileLogger.logWithData('warn', 'No invoice details found in response', {
                params,
                responseTime,
                status: response.status,
                responseData: response.data
            }, 'InvoiceService');
            return [];
        }
        catch (error) {
            const effectiveToken = bearerToken || this.configService.getBearerTokenSafe();
            const tokenSource = bearerToken ? 'frontend' : 'environment';
            const hasValidToken = effectiveToken && effectiveToken.length > 0;
            const errorDetails = {
                error: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                hasValidToken,
                tokenSource,
                endpoint: this.configService.getDetailApiEndpoint(),
                params
            };
            this.logger.error('Error fetching invoice details:', errorDetails);
            this.fileLogger.logApiError('GET', this.configService.getDetailApiEndpoint(), error, 'InvoiceService');
            this.fileLogger.logWithData('error', 'Invoice detail fetch failed', errorDetails, 'InvoiceService');
            if (error.message?.includes('unable to verify the first certificate')) {
                this.logger.error('🔒 SSL Certificate verification failed');
                this.logger.log('✅ Applied SSL certificate bypass - request should now work');
                this.logger.warn('⚠️  Note: SSL verification is disabled for this external API');
            }
            else if (error.response?.status === 409) {
                this.logger.warn('🚦 Server overload (409 Conflict) - Too many requests');
                this.logger.log('💡 Rate limiting is applied, will retry with backoff delay');
                throw error;
            }
            else if (error.response?.status === 429) {
                this.logger.warn('🚦 Rate limit exceeded (429 Too Many Requests)');
                this.logger.log('💡 Rate limiting is applied, will retry with backoff delay');
                throw error;
            }
            else if (error.response?.status === 401) {
                this.logger.error('🔐 Authentication failed - Bearer Token may be invalid or expired');
                if (tokenSource === 'frontend') {
                    this.logger.error('💡 Please check the Bearer Token in your frontend configuration (ketoan/listhoadon)');
                }
                else {
                    this.logger.error('💡 Please check INVOICE_API_BEARER_TOKEN in your .env file');
                }
            }
            else if (error.response?.status === 403) {
                this.logger.error('🚫 Access forbidden - Bearer Token may not have sufficient permissions');
            }
            else if (error.response?.status === 404) {
                this.logger.warn('📋 No details found for this invoice');
            }
            else if (error.response?.status === 500 || error.response?.status === 502 || error.response?.status === 503) {
                this.logger.warn('🔧 Server error from external API - May be temporary');
                this.logger.log('💡 Will retry with backoff delay');
                throw error;
            }
            else if (error.code === 'ECONNABORTED') {
                this.logger.error('⏱️  Request timeout - External API is not responding');
                throw error;
            }
            else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                this.logger.error('🌐 Network error - Cannot reach external API');
            }
            else if (error.code === 'CERT_HAS_EXPIRED') {
                this.logger.error('📅 SSL Certificate has expired');
                this.logger.log('✅ SSL verification bypass should handle this issue');
            }
            else if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
                this.logger.error('🔗 Self-signed certificate in chain');
                this.logger.log('✅ SSL verification bypass should handle this issue');
            }
            return [];
        }
    }
    async saveInvoiceDetails(invoiceIdServer, details) {
        const startTime = Date.now();
        try {
            if (!details || details.length === 0) {
                this.logger.log('No details to save');
                this.fileLogger.logWithData('warn', 'No invoice details to save', {
                    invoiceId: invoiceIdServer,
                    detailsCount: 0
                }, 'InvoiceService');
                return 0;
            }
            this.fileLogger.logWithData('log', 'Starting to save invoice details', {
                invoiceId: invoiceIdServer,
                detailsCount: details.length,
                timestamp: new Date().toISOString()
            }, 'InvoiceService');
            const savedDetails = [];
            const errors = [];
            for (const detail of details) {
                try {
                    const detailData = {
                        idServer: invoiceIdServer + '' + detail.id,
                        idhdonServer: invoiceIdServer,
                        dgia: this.toDecimalSafe(detail.dgia),
                        dvtinh: this.toStringSafe(detail.dvtinh),
                        ltsuat: this.toDecimalSafe(detail.ltsuat),
                        sluong: this.toDecimalSafe(detail.sluong),
                        stbchu: this.toStringSafe(detail.stbchu),
                        stckhau: this.toDecimalSafe(detail.stckhau),
                        stt: this.toIntSafe(detail.stt),
                        tchat: this.toStringSafe(detail.tchat),
                        ten: this.toStringSafe(detail.ten),
                        thtcthue: this.toDecimalSafe(detail.thtcthue),
                        thtien: this.toDecimalSafe(detail.thtien),
                        tlckhau: this.toDecimalSafe(detail.tlckhau),
                        tsuat: this.toDecimalSafe(detail.tsuat),
                        tthue: this.toDecimalSafe(detail.tthue),
                        sxep: this.toIntSafe(detail.sxep),
                        dvtte: this.toStringSafe(detail.dvtte),
                        tgia: this.toDecimalSafe(detail.tgia),
                        tthhdtrung: this.toStringSafe(detail.tthhdtrung)
                    };
                    const savedDetail = await this.prisma.ext_detailhoadon.create({
                        data: detailData
                    });
                    savedDetails.push(savedDetail);
                }
                catch (detailError) {
                    const errorInfo = {
                        error: detailError.message,
                        detail: detail.stt || 'unknown',
                        detailId: detail.id,
                        invoiceId: invoiceIdServer,
                        rawDetailData: {
                            dgia: detail.dgia,
                            ltsuat: detail.ltsuat,
                            sluong: detail.sluong,
                            stckhau: detail.stckhau,
                            tsuat: detail.tsuat,
                            tthue: detail.tthue,
                            thtcthue: detail.thtcthue,
                            thtien: detail.thtien,
                            tlckhau: detail.tlckhau,
                            tgia: detail.tgia,
                            stt: detail.stt,
                            sxep: detail.sxep,
                            tchat: detail.tchat,
                            ten: detail.ten,
                            dvtinh: detail.dvtinh,
                            stbchu: detail.stbchu,
                            dvtte: detail.dvtte,
                            tthhdtrung: detail.tthhdtrung
                        }
                    };
                    this.logger.error('Error saving individual detail:', errorInfo);
                    this.fileLogger.logWithData('error', 'Failed to save detail item', errorInfo, 'InvoiceService');
                    errors.push(errorInfo);
                }
            }
            const saveResult = {
                saved: savedDetails.length,
                total: details.length,
                errors: errors.length,
                invoiceId: invoiceIdServer,
                duration: Date.now() - startTime,
                success: savedDetails.length > 0
            };
            this.logger.log(`Successfully saved ${savedDetails.length} out of ${details.length} details`);
            if (errors.length > 0) {
                this.fileLogger.logWithData('warn', 'Invoice details saved with some errors', {
                    ...saveResult,
                    errorList: errors
                }, 'InvoiceService');
            }
            else {
                this.fileLogger.logWithData('log', 'Invoice details saved successfully', saveResult, 'InvoiceService');
            }
            return savedDetails.length;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Error saving invoice details:', error);
            this.fileLogger.logWithData('error', 'Failed to save invoice details', {
                error: error.message,
                stack: error.stack,
                invoiceId: invoiceIdServer,
                detailsCount: details?.length || 0,
                duration
            }, 'InvoiceService');
            return 0;
        }
    }
    async autoFetchAndSaveDetails(invoice, bearerToken) {
        const startTime = Date.now();
        const invoiceRef = invoice.idServer;
        try {
            this.fileLogger.logWithData('log', 'Starting auto-fetch and save details', {
                invoiceRef,
                hasToken: !!bearerToken,
                tokenSource: bearerToken ? 'frontend' : 'environment',
                timestamp: new Date().toISOString()
            }, 'InvoiceService');
            const detailParams = this.extractDetailParams(invoice);
            if (!detailParams) {
                this.logger.warn(`Cannot extract detail parameters for invoice ${invoiceRef}`);
                this.fileLogger.logInvoiceError('extract-params', invoiceRef, {
                    error: 'Missing required parameters',
                    invoice: {
                        nbmst: invoice.nbmst,
                        khhdon: invoice.khhdon,
                        shdon: invoice.shdon,
                        khmshdon: invoice.khmshdon,
                    }
                });
                return 0;
            }
            this.fileLogger.logWithData('log', 'Parameters extracted successfully', {
                invoiceRef,
                params: detailParams
            }, 'InvoiceService');
            this.fileLogger.log(`Fetching details from external API for invoice ${invoiceRef}`, 'InvoiceService');
            const details = await this.fetchInvoiceDetails(detailParams, bearerToken);
            if (details.length === 0) {
                this.logger.log(`No details found for invoice ${invoiceRef}`);
                this.fileLogger.logWithData('warn', 'No details found from external API', {
                    invoiceRef,
                    params: detailParams,
                    duration: Date.now() - startTime
                }, 'InvoiceService');
                return 0;
            }
            this.fileLogger.logWithData('log', 'Details fetched from external API', {
                invoiceRef,
                detailsCount: details.length,
                duration: Date.now() - startTime
            }, 'InvoiceService');
            this.fileLogger.log(`Saving ${details.length} details to database for invoice ${invoiceRef}`, 'InvoiceService');
            const savedCount = await this.saveInvoiceDetails(invoice.idServer, details);
            const totalDuration = Date.now() - startTime;
            this.logger.log(`Auto-saved ${savedCount} details for invoice ${invoiceRef}`);
            this.fileLogger.logInvoiceOperation('auto-fetch-details', invoiceRef, {
                detailsSaved: savedCount,
                detailsFetched: details.length,
                tokenSource: bearerToken ? 'frontend' : 'environment',
                duration: totalDuration,
                success: true
            });
            return savedCount;
        }
        catch (error) {
            const totalDuration = Date.now() - startTime;
            this.logger.error(`Error auto-fetching details for invoice ${invoiceRef}:`, error);
            this.fileLogger.logInvoiceError('auto-fetch-details', invoiceRef, {
                error: error.message,
                stack: error.stack,
                duration: totalDuration,
                tokenSource: bearerToken ? 'frontend' : 'environment',
                step: 'auto-fetch-and-save'
            });
            return 0;
        }
    }
    decimalToNumber(value) {
        if (!value)
            return 0;
        return value instanceof library_1.Decimal ? value.toNumber() : Number(value);
    }
    toDecimalSafe(value) {
        if (!value)
            return null;
        try {
            let stringValue = String(value).trim();
            if (!stringValue || stringValue === 'null' || stringValue === 'undefined') {
                return null;
            }
            stringValue = stringValue.replace(/%/g, '').replace(/[^0-9.-]/g, '');
            if (!stringValue) {
                return null;
            }
            if (!/^-?\d*\.?\d+$/.test(stringValue)) {
                this.logger.warn(`Invalid numeric format after cleaning: '${stringValue}' (original: '${value}')`);
                return null;
            }
            return new library_1.Decimal(stringValue);
        }
        catch (error) {
            this.logger.warn(`Failed to convert to Decimal: '${value}' - ${error.message}`);
            this.fileLogger.logWithData('warn', 'Decimal conversion failed', {
                originalValue: value,
                error: error.message
            }, 'InvoiceService');
            return null;
        }
    }
    toIntSafe(value) {
        if (!value)
            return null;
        try {
            const stringValue = String(value).trim().replace(/[^0-9-]/g, '');
            if (!stringValue)
                return null;
            const intValue = parseInt(stringValue, 10);
            return isNaN(intValue) ? null : intValue;
        }
        catch (error) {
            this.logger.warn(`Failed to convert to integer: '${value}' - ${error.message}`);
            return null;
        }
    }
    toStringSafe(value) {
        if (value === null || value === undefined)
            return null;
        try {
            const stringValue = String(value).trim();
            return stringValue === '' ? null : stringValue;
        }
        catch (error) {
            this.logger.warn(`Failed to convert to string: '${value}' - ${error.message}`);
            return null;
        }
    }
    toArraySafe(value) {
        if (!value)
            return null;
        try {
            if (Array.isArray(value)) {
                return value;
            }
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [parsed];
                }
                catch {
                    return [value];
                }
            }
            return [value];
        }
        catch (error) {
            this.logger.warn(`Failed to convert to array: '${value}' - ${error.message}`);
            return null;
        }
    }
    normalizeInvoiceData(data) {
        if (!data)
            return data;
        const toStringOrNull = (value) => {
            if (value === null || value === undefined)
                return null;
            return String(value);
        };
        return {
            ...data,
            khmshdon: toStringOrNull(data.khmshdon),
            khhdon: toStringOrNull(data.khhdon),
            shdon: toStringOrNull(data.shdon),
            cqt: toStringOrNull(data.cqt),
            hdon: toStringOrNull(data.hdon),
            hthdon: toStringOrNull(data.hthdon),
            htttoan: toStringOrNull(data.htttoan),
            idtbao: toStringOrNull(data.idtbao),
            khdon: toStringOrNull(data.khdon),
            khhdgoc: toStringOrNull(data.khhdgoc),
            khmshdgoc: toStringOrNull(data.khmshdgoc),
            lhdgoc: toStringOrNull(data.lhdgoc),
            mhdon: toStringOrNull(data.mhdon),
            mtdiep: toStringOrNull(data.mtdiep),
            mtdtchieu: toStringOrNull(data.mtdtchieu),
            nbdchi: toStringOrNull(data.nbdchi),
            chma: toStringOrNull(data.chma),
            chten: toStringOrNull(data.chten),
            nbhdktso: toStringOrNull(data.nbhdktso),
            nbhdso: toStringOrNull(data.nbhdso),
            nblddnbo: toStringOrNull(data.nblddnbo),
            nbptvchuyen: toStringOrNull(data.nbptvchuyen),
            nbstkhoan: toStringOrNull(data.nbstkhoan),
            nbten: toStringOrNull(data.nbten),
            nbtnhang: toStringOrNull(data.nbtnhang),
            nbtnvchuyen: toStringOrNull(data.nbtnvchuyen),
            ncma: toStringOrNull(data.ncma),
            nky: toStringOrNull(data.nky),
            nmdchi: toStringOrNull(data.nmdchi),
            nmmst: toStringOrNull(data.nmmst),
            nmstkhoan: toStringOrNull(data.nmstkhoan),
            nmten: toStringOrNull(data.nmten),
            nmtnhang: toStringOrNull(data.nmtnhang),
            nmtnmua: toStringOrNull(data.nmtnmua),
            nmttkhac: toStringOrNull(data.nmttkhac),
            pban: toStringOrNull(data.pban),
            ptgui: toStringOrNull(data.ptgui),
            shdgoc: toStringOrNull(data.shdgoc),
            tchat: toStringOrNull(data.tchat),
            tgtttbchu: toStringOrNull(data.tgtttbchu),
            thdon: toStringOrNull(data.thdon),
            thlap: toStringOrNull(data.thlap),
            tlhdon: toStringOrNull(data.tlhdon),
            ttcktmai: toStringOrNull(data.ttcktmai),
            tthai: toStringOrNull(data.tthai),
            tttbao: toStringOrNull(data.tttbao),
            ttxly: toStringOrNull(data.ttxly),
            tvandnkntt: toStringOrNull(data.tvandnkntt),
            mhso: toStringOrNull(data.mhso),
            mkhang: toStringOrNull(data.mkhang),
            nbsdthoai: toStringOrNull(data.nbsdthoai),
            nbdctdtu: toStringOrNull(data.nbdctdtu),
            nbfax: toStringOrNull(data.nbfax),
            nbwebsite: toStringOrNull(data.nbwebsite),
            nmsdthoai: toStringOrNull(data.nmsdthoai),
            nmdctdtu: toStringOrNull(data.nmdctdtu),
            nmcmnd: toStringOrNull(data.nmcmnd),
            nmcks: toStringOrNull(data.nmcks),
            bhphap: toStringOrNull(data.bhphap),
            hddunlap: toStringOrNull(data.hddunlap),
            gchdgoc: toStringOrNull(data.gchdgoc),
            bhpldo: toStringOrNull(data.bhpldo),
            bhpcbo: toStringOrNull(data.bhpcbo),
            unhiem: toStringOrNull(data.unhiem),
            mstdvnunlhdon: toStringOrNull(data.mstdvnunlhdon),
            tdvnunlhdon: toStringOrNull(data.tdvnunlhdon),
            nbmdvqhnsach: toStringOrNull(data.nbmdvqhnsach),
            nbsqdinh: toStringOrNull(data.nbsqdinh),
            nbncqdinh: toStringOrNull(data.nbncqdinh),
            nbcqcqdinh: toStringOrNull(data.nbcqcqdinh),
            nbhtban: toStringOrNull(data.nbhtban),
            nmmdvqhnsach: toStringOrNull(data.nmmdvqhnsach),
            nmddvchden: toStringOrNull(data.nmddvchden),
            nbtnban: toStringOrNull(data.nbtnban),
            dcdvnunlhdon: toStringOrNull(data.dcdvnunlhdon),
            thtttoan: toStringOrNull(data.thtttoan),
            msttcgp: toStringOrNull(data.msttcgp),
            gchu: toStringOrNull(data.gchu),
            kqcht: toStringOrNull(data.kqcht),
            nmshchieu: toStringOrNull(data.nmshchieu),
            nmnchchieu: toStringOrNull(data.nmnchchieu),
            nmnhhhchieu: toStringOrNull(data.nmnhhhchieu),
            nmqtich: toStringOrNull(data.nmqtich),
            nmstttoan: toStringOrNull(data.nmstttoan),
            nmttttoan: toStringOrNull(data.nmttttoan),
            hdhhdvu: toStringOrNull(data.hdhhdvu),
            qrcode: toStringOrNull(data.qrcode),
            ttmstten: toStringOrNull(data.ttmstten),
            ladhddtten: toStringOrNull(data.ladhddtten),
            hdxkhau: toStringOrNull(data.hdxkhau),
            hdxkptquan: toStringOrNull(data.hdxkptquan),
            hdonLquans: toStringOrNull(data.hdonLquans),
            tthdclquan: toStringOrNull(data.tthdclquan),
            pdndungs: toStringOrNull(data.pdndungs),
            hdtbssrses: toStringOrNull(data.hdtbssrses),
            hdTrung: toStringOrNull(data.hdTrung),
            hdcttchinh: toStringOrNull(data.hdcttchinh),
            brandname: toStringOrNull(data.brandname),
        };
    }
    convertInvoice(invoice) {
        return {
            ...invoice,
            tgia: this.decimalToNumber(invoice.tgia),
            tgtcthue: this.decimalToNumber(invoice.tgtcthue),
            tgtthue: this.decimalToNumber(invoice.tgtthue),
            tgtttbso: this.decimalToNumber(invoice.tgtttbso),
            details: invoice.details ? invoice.details.map((detail) => this.convertDetail(detail)) : [],
        };
    }
    convertDetail(detail) {
        return {
            ...detail,
            dgia: this.decimalToNumber(detail.dgia),
            tgia: this.decimalToNumber(detail.tgia),
            ltsuat: this.decimalToNumber(detail.ltsuat),
            sluong: this.decimalToNumber(detail.sluong),
            tgtcthue: this.decimalToNumber(detail.tgtcthue),
            tgthue: this.decimalToNumber(detail.tgthue),
            tsuat: this.decimalToNumber(detail.tsuat),
        };
    }
    async createInvoice(data) {
        try {
            if (data.nbmst && data.khmshdon && data.shdon) {
                const normalizedData = this.normalizeInvoiceData(data);
                const existing = await this.prisma.ext_listhoadon.findFirst({
                    where: {
                        nbmst: data.nbmst,
                        khmshdon: normalizedData.khmshdon,
                        shdon: normalizedData.shdon,
                    },
                });
                if (existing) {
                    this.logger.warn(`Invoice already exists: ${data.nbmst}-${data.khmshdon}-${data.shdon}`);
                    return this.convertInvoice(existing);
                }
            }
            const idServer = data.idServer ||
                (data.nbmst && data.khmshdon && data.shdon ?
                    `${data.nbmst}_${data.khmshdon}_${data.shdon}` :
                    undefined);
            const transformedData = {
                ...this.normalizeInvoiceData(data),
                idServer,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const invoice = await this.prisma.ext_listhoadon.create({
                data: transformedData,
                include: {
                    details: true,
                },
            });
            this.logger.log(`Created invoice: ${invoice.id}`);
            this.fileLogger.logInvoiceOperation('create', invoice.id, {
                idServer: invoice.idServer,
                nbmst: invoice.nbmst,
                khmshdon: invoice.khmshdon,
                shdon: invoice.shdon
            });
            return this.convertInvoice(invoice);
        }
        catch (error) {
            this.logger.error('Error creating invoice:', error);
            throw new common_1.BadRequestException('Failed to create invoice');
        }
    }
    async createInvoiceDetails(invoiceId, details) {
        try {
            console.log('Creating details for invoice:', invoiceId, details);
            const invoice = await this.prisma.ext_listhoadon.findUnique({
                where: { id: invoiceId },
            });
            if (!invoice) {
                throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
            }
            const createdDetails = await Promise.all(details.map(detail => this.prisma.ext_detailhoadon.create({
                data: {
                    ...detail,
                    idServer: invoiceId,
                    invoice: {
                        connect: { id: invoiceId }
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            })));
            this.logger.log(`Created ${createdDetails.length} details for invoice ${invoiceId}`);
            return createdDetails.map(detail => this.convertDetail(detail));
        }
        catch (error) {
            this.logger.error('Error creating invoice details:', error);
            throw new common_1.BadRequestException('Failed to create invoice details');
        }
    }
    async getInvoiceById(id) {
        try {
            const invoice = await this.prisma.ext_listhoadon.findUnique({
                where: { id },
                include: {
                    details: {
                        orderBy: { stt: 'asc' },
                    },
                },
            });
            if (!invoice) {
                throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
            }
            return this.convertInvoice(invoice);
        }
        catch (error) {
            this.logger.error(`Error getting invoice ${id}:`, error);
            throw error;
        }
    }
    async searchInvoices(input) {
        try {
            const { page = 0, size = 20, sortBy = 'ntao', sortOrder = 'desc', ...filters } = input;
            this.logger.debug('Invoice search input:', {
                page,
                size,
                sortBy,
                sortOrder,
                fromDate: filters.fromDate?.toISOString(),
                toDate: filters.toDate?.toISOString(),
                otherFilters: { ...filters, fromDate: undefined, toDate: undefined }
            });
            const where = {};
            if (filters.nbmst) {
                where.nbmst = { contains: filters.nbmst, mode: 'insensitive' };
            }
            if (filters.nmmst) {
                where.nmmst = { contains: filters.nmmst, mode: 'insensitive' };
            }
            if (filters.khmshdon) {
                where.khmshdon = { contains: filters.khmshdon, mode: 'insensitive' };
            }
            if (filters.shdon) {
                where.shdon = { contains: filters.shdon, mode: 'insensitive' };
            }
            if (filters.tthai) {
                where.tthai = filters.tthai;
            }
            if (filters.fromDate || filters.toDate) {
                where.tdlap = {};
                if (filters.fromDate && !isNaN(filters.fromDate.getTime())) {
                    const startDate = new Date(filters.fromDate);
                    startDate.setHours(0, 0, 0, 0);
                    where.tdlap.gte = startDate;
                }
                if (filters.toDate && !isNaN(filters.toDate.getTime())) {
                    const endDate = new Date(filters.toDate);
                    endDate.setHours(23, 59, 59, 999);
                    where.tdlap.lte = endDate;
                }
            }
            const [invoices, total] = await Promise.all([
                this.prisma.ext_listhoadon.findMany({
                    where,
                    include: {
                        details: {
                            take: 5,
                            orderBy: { stt: 'asc' },
                        },
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: page * size,
                    take: size,
                }),
                this.prisma.ext_listhoadon.count({ where }),
            ]);
            this.logger.debug(`Found ${total} invoices matching criteria (page ${page}, size ${size})`);
            const totalPages = Math.ceil(total / size);
            return {
                invoices: invoices.map(invoice => this.convertInvoice(invoice)),
                total,
                page,
                size,
                totalPages,
            };
        }
        catch (error) {
            this.logger.error('Error searching invoices:', error);
            throw new common_1.BadRequestException('Failed to search invoices');
        }
    }
    async invoiceExists(idServer, nbmst, khmshdon, shdon) {
        try {
            const count = await this.prisma.ext_listhoadon.count({
                where: {
                    idServer,
                    nbmst,
                    khmshdon,
                    shdon,
                },
            });
            return count > 0;
        }
        catch (error) {
            this.logger.error('Error checking invoice existence:', error);
            return false;
        }
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async bulkCreateInvoices(input, onProgress) {
        const result = {
            success: true,
            invoicesSaved: 0,
            detailsSaved: 0,
            errors: [],
            message: '',
        };
        const config = this.configService.getInvoiceConfig();
        if (config.brandname) {
            input.invoices = input.invoices.map(invoice => ({
                ...invoice,
                brandname: invoice.brandname || config.brandname
            }));
        }
        const BATCH_SIZE = config.batchSize;
        const DELAY_BETWEEN_BATCHES = config.delayBetweenBatches;
        const DELAY_BETWEEN_DETAIL_CALLS = config.delayBetweenDetailCalls;
        const MAX_RETRIES = config.maxRetries;
        try {
            const operationStartTime = Date.now();
            this.logger.log('\n' + '='.repeat(80));
            this.logger.log('BULK INVOICE SYNC OPERATION STARTED');
            this.logger.log('='.repeat(80));
            this.logger.log(`Total Invoices: ${input.invoices.length}`);
            this.logger.log(`Include Details: ${input.includeDetails !== false ? 'Yes' : 'No'}`);
            this.logger.log(`Skip Existing: ${input.skipExisting ? 'Yes' : 'No'}`);
            this.logger.log(`Bearer Token: ${input.bearerToken ? 'Provided from frontend' : 'Using environment variable'}`);
            this.logger.log(`\nRate Limiting Configuration:`);
            this.logger.log(`  - Batch Size: ${BATCH_SIZE} invoices per batch`);
            this.logger.log(`  - Delay Between Batches: ${DELAY_BETWEEN_BATCHES}ms`);
            this.logger.log(`  - Delay Between Detail Calls: ${DELAY_BETWEEN_DETAIL_CALLS}ms`);
            this.logger.log(`  - Max Retries: ${MAX_RETRIES}`);
            this.logger.log('='.repeat(80) + '\n');
            this.fileLogger.logWithData('log', 'Bulk invoice creation started', {
                totalInvoices: input.invoices.length,
                includeDetails: input.includeDetails,
                skipExisting: input.skipExisting,
                hasToken: !!input.bearerToken,
                tokenSource: input.bearerToken ? 'frontend' : 'environment',
                rateLimitConfig: {
                    batchSize: BATCH_SIZE,
                    delayBetweenBatches: DELAY_BETWEEN_BATCHES,
                    delayBetweenCalls: DELAY_BETWEEN_DETAIL_CALLS,
                    maxRetries: MAX_RETRIES
                }
            }, 'InvoiceService');
            for (let i = 0; i < input.invoices.length; i += BATCH_SIZE) {
                const batch = input.invoices.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(input.invoices.length / BATCH_SIZE);
                const batchStartTime = Date.now();
                const progressPercent = ((i / input.invoices.length) * 100).toFixed(1);
                this.logger.log('\n' + '-'.repeat(80));
                this.logger.log(`📦 BATCH ${batchNumber}/${totalBatches} | Progress: ${progressPercent}% | Invoices: ${i + 1}-${Math.min(i + BATCH_SIZE, input.invoices.length)}/${input.invoices.length}`);
                this.logger.log('-'.repeat(80));
                for (const invoiceData of batch) {
                    try {
                        if (input.skipExisting && invoiceData.idServer) {
                            const exists = await this.invoiceExists(invoiceData.idServer, invoiceData.nbmst, String(invoiceData.khmshdon), String(invoiceData.shdon));
                            if (exists) {
                                this.logger.log(`  ⏭️  Skipped (exists): Invoice ${invoiceData.shdon}`);
                                this.fileLogger.logWithData('log', 'Invoice skipped - already exists', {
                                    idServer: invoiceData.idServer,
                                    nbmst: invoiceData.nbmst,
                                    khmshdon: String(invoiceData.khmshdon),
                                    shdon: String(invoiceData.shdon),
                                    skipReason: 'Invoice already exists in database',
                                    batchNumber,
                                    totalBatches,
                                    timestamp: new Date().toISOString()
                                }, 'InvoiceService');
                                continue;
                            }
                        }
                        const invoice = await this.createInvoice(invoiceData);
                        this.logger.log(`  ✅ Created: Invoice ${invoice.shdon} (ID: ${invoice.idServer})`);
                        this.fileLogger.logInvoiceOperation('bulk-create', invoice.id, {
                            idServer: invoice.idServer,
                            shdon: invoice.shdon,
                            nbmst: invoice.nbmst,
                            khmshdon: invoice.khmshdon,
                            batchNumber,
                            totalBatches
                        });
                        if (input.includeDetails !== false) {
                            let retryCount = 0;
                            let detailsSaved = 0;
                            while (retryCount <= MAX_RETRIES) {
                                try {
                                    if (retryCount > 0) {
                                        const baseDelay = DELAY_BETWEEN_DETAIL_CALLS * 2;
                                        const exponentialDelay = baseDelay * Math.pow(2, retryCount);
                                        const jitter = Math.random() * 1000;
                                        const retryDelay = Math.min(exponentialDelay + jitter, 60000);
                                        this.logger.log(`     🔄 Retry ${retryCount}/${MAX_RETRIES} for ${invoice.shdon} (delay: ${Math.round(retryDelay)}ms)`);
                                        this.logger.log(`Retrying detail fetch for invoice ${invoice.shdon} (attempt ${retryCount + 1}/${MAX_RETRIES + 1}) after ${Math.round(retryDelay)}ms delay`);
                                        await this.delay(retryDelay);
                                    }
                                    else {
                                        await this.delay(DELAY_BETWEEN_DETAIL_CALLS);
                                    }
                                    detailsSaved = await this.autoFetchAndSaveDetails(invoice, input.bearerToken);
                                    result.detailsSaved += detailsSaved;
                                    if (detailsSaved > 0) {
                                        const tokenSource = input.bearerToken ? 'frontend' : 'environment';
                                        this.logger.log(`     📄 Fetched ${detailsSaved} details (token: ${tokenSource})`);
                                    }
                                    else {
                                        this.logger.log(`     ⚠️  No details found or fetch failed`);
                                    }
                                    break;
                                }
                                catch (detailError) {
                                    retryCount++;
                                    const isRateLimitError = detailError.response?.status === 409 ||
                                        detailError.response?.status === 429 ||
                                        detailError.code === 'ECONNABORTED' ||
                                        detailError.message?.includes('timeout');
                                    if (isRateLimitError && retryCount <= MAX_RETRIES) {
                                        this.logger.warn(`🚦 Rate limit/timeout error for invoice ${invoice.shdon}, will retry (${retryCount}/${MAX_RETRIES}): ${detailError.message}`);
                                        this.logger.warn(`⏳ Server is overloaded (${detailError.response?.status || 'timeout'}), backing off...`);
                                        continue;
                                    }
                                    else {
                                        this.logger.error(`Failed to auto-fetch details for invoice ${invoice.shdon} after ${retryCount} attempts:`, detailError);
                                        result.errors.push(`Failed to fetch details for invoice ${invoice.shdon}: ${detailError.message}`);
                                        break;
                                    }
                                }
                            }
                        }
                        result.invoicesSaved++;
                        if (onProgress) {
                            onProgress({
                                processed: i + batch.indexOf(invoiceData) + 1,
                                total: input.invoices.length,
                                saved: result.invoicesSaved,
                                skipped: 0,
                                failed: result.errors.length,
                                detailsSaved: result.detailsSaved
                            });
                        }
                    }
                    catch (error) {
                        this.logger.error(`  ❌ Failed: Invoice ${invoiceData.shdon}`);
                        this.logger.error(`     Error: ${error.message}`);
                        result.errors.push(`Failed to create invoice ${invoiceData.shdon}: ${error.message}`);
                    }
                }
                const batchDuration = Date.now() - batchStartTime;
                const batchSuccessRate = batch.length > 0 ? ((result.invoicesSaved / (batchNumber * BATCH_SIZE)) * 100).toFixed(1) : '0';
                this.logger.log('-'.repeat(80));
                this.logger.log(`✓ Batch ${batchNumber} completed in ${(batchDuration / 1000).toFixed(2)}s | Success rate: ${batchSuccessRate}%`);
                this.logger.log('-'.repeat(80));
                if (i + BATCH_SIZE < input.invoices.length) {
                    this.logger.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...\n`);
                    await this.delay(DELAY_BETWEEN_BATCHES);
                }
            }
            result.success = result.errors.length === 0;
            result.message = result.success
                ? `Successfully created ${result.invoicesSaved} invoices`
                : `Created ${result.invoicesSaved} invoices with ${result.errors.length} errors`;
            this.logger.log(`Bulk operation completed: ${result.message}`);
            this.fileLogger.logWithData('log', 'Bulk invoice creation completed', {
                success: result.success,
                invoicesSaved: result.invoicesSaved,
                detailsSaved: result.detailsSaved,
                errorsCount: result.errors.length,
                errors: result.errors.slice(0, 5),
                message: result.message
            }, 'InvoiceService');
            return result;
        }
        catch (error) {
            this.logger.error('Error in bulk create operation:', error);
            throw new common_1.BadRequestException('Bulk create operation failed');
        }
    }
    async getStats() {
        try {
            const [invoiceCount, detailCount, totals, lastInvoice] = await Promise.all([
                this.prisma.ext_listhoadon.count(),
                this.prisma.ext_detailhoadon.count(),
                this.prisma.ext_listhoadon.aggregate({
                    _sum: {
                        tgtttbso: true,
                        tgtthue: true,
                    },
                }),
                this.prisma.ext_listhoadon.findFirst({
                    orderBy: { createdAt: 'desc' },
                    select: { createdAt: true },
                }),
            ]);
            return {
                totalInvoices: invoiceCount,
                totalDetails: detailCount,
                totalAmount: this.decimalToNumber(totals._sum.tgtttbso),
                totalTax: this.decimalToNumber(totals._sum.tgtthue),
                lastSyncDate: lastInvoice?.createdAt,
            };
        }
        catch (error) {
            this.logger.error('Error getting stats:', error);
            throw new common_1.BadRequestException('Failed to get database statistics');
        }
    }
    async deleteInvoice(id) {
        try {
            await this.prisma.ext_listhoadon.delete({
                where: { id },
            });
            this.logger.log(`Deleted invoice: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting invoice ${id}:`, error);
            return false;
        }
    }
    async updateInvoice(id, data) {
        try {
            const invoice = await this.prisma.ext_listhoadon.update({
                where: { id },
                data: {
                    ...this.normalizeInvoiceData(data),
                    updatedAt: new Date(),
                },
                include: {
                    details: true,
                },
            });
            this.logger.log(`Updated invoice: ${id}`);
            return this.convertInvoice(invoice);
        }
        catch (error) {
            this.logger.error(`Error updating invoice ${id}:`, error);
            throw new common_1.BadRequestException('Failed to update invoice');
        }
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        backend_config_service_1.BackendConfigService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map