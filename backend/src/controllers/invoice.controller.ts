import { Controller, Post, Get, Body, Param, Query, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { $Enums } from '@prisma/client';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceInput, CreateInvoiceDetailInput, InvoiceSearchInput, BulkInvoiceInput } from '../graphql/inputs/invoice.input';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * Create a new invoice
   */
  @Post()
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async createInvoice(@Body() input: CreateInvoiceInput) {
    try {
      this.logger.log('REST: Creating invoice');
      return await this.invoiceService.createInvoice(input);
    } catch (error) {
      this.logger.error('REST: Error creating invoice:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Create invoice details
   */
  @Post(':id/details')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async createInvoiceDetails(
    @Param('id') invoiceId: string,
    @Body() details: CreateInvoiceDetailInput[]
  ) {
    try {
      this.logger.log(`REST: Creating details for invoice ${invoiceId}`);
      return await this.invoiceService.createInvoiceDetails(invoiceId, details);
    } catch (error) {
      this.logger.error('REST: Error creating invoice details:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get invoice by ID
   */
  @Get(':id')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async getInvoice(@Param('id') id: string) {
    try {
      this.logger.log(`REST: Getting invoice ${id}`);
      return await this.invoiceService.getInvoiceById(id);
    } catch (error) {
      this.logger.error(`REST: Error getting invoice ${id}:`, error.message);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Search invoices with filters
   */
  @Get()
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async searchInvoices(@Query() query: any) {
    try {
      // Helper function to parse and validate dates (supports DD/MM/YYYY format)
      const parseDate = (dateString: string): Date | undefined => {
        if (!dateString || dateString.trim() === '') {
          return undefined;
        }
        
        // Check if format is DD/MM/YYYY
        if (dateString.includes('/')) {
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            // Create date as YYYY-MM-DD for proper parsing
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const parsed = new Date(isoDate);
            return isNaN(parsed.getTime()) ? undefined : parsed;
          }
        }
        
        // Fallback to default Date parsing
        const parsed = new Date(dateString);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      };

      // Convert query parameters to search input
      const input: InvoiceSearchInput = {
        page: parseInt(query.page) || 0,
        size: parseInt(query.size) || 20,
        sortBy: query.sortBy || 'tdlap',
        sortOrder: query.sortOrder || 'desc',
        nbmst: query.nbmst,
        nmmst: query.nmmst,
        khmshdon: query.khmshdon,
        shdon: query.shdon,
        tthai: query.tthai,
        fromDate: parseDate(query.fromDate),
        toDate: parseDate(query.toDate),
      };

      this.logger.log('REST: Searching invoices with params:', {
        page: input.page,
        size: input.size,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
        fromDate: input.fromDate?.toISOString(),
        toDate: input.toDate?.toISOString(),
        filters: { nbmst: query.nbmst, nmmst: query.nmmst, shdon: query.shdon }
      });
      
      return await this.invoiceService.searchInvoices(input);
    } catch (error) {
      this.logger.error('REST: Error searching invoices:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Check if invoice exists
   */
  // @Get('exists/:nbmst/:khmshdon/:shdon')
  // @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  // async invoiceExists(
  //   @Param('nbmst') nbmst: string,
  //   @Param('khmshdon') khmshdon: string,
  //   @Param('shdon') shdon: string
  // ) {
  //   try {
  //     this.logger.log(`REST: Checking invoice existence: ${nbmst}-${khmshdon}-${shdon}`);
  //     return { exists: await this.invoiceService.invoiceExists(nbmst, khmshdon, shdon) };
  //   } catch (error) {
  //     this.logger.error('REST: Error checking invoice existence:', error.message);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  /**
   * Bulk create invoices
   */
  @Post('bulk')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async bulkCreateInvoices(@Body() input: BulkInvoiceInput) {
    try {
      this.logger.log(`REST: Bulk creating ${input.invoices.length} invoices`);
      return await this.invoiceService.bulkCreateInvoices(input);
    } catch (error) {
      this.logger.error('REST: Error in bulk create:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Synchronize external API data with database
   */
  @Post('sync')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async syncInvoices(@Body() body: { invoiceData: any[], detailsData: any[], bearerToken?: string, brandname?: string }) {
    try {
      const startTime = Date.now();
      this.logger.log('REST: Starting invoice sync from external API');
      this.logger.log(`Total invoices to sync: ${body.invoiceData?.length || 0}`);
      if (body.brandname) {
        this.logger.log(`Using brandname filter: ${body.brandname}`);
      }
      
      const { invoiceData, detailsData, bearerToken, brandname } = body;
      
      // Convert API data to our input format
      const convertedInvoices: CreateInvoiceInput[] = invoiceData.map(invoice => ({
        idServer: invoice.id,  // Assuming 'id' is the unique identifier from external API
        nbmst: invoice.nbmst,
        khmshdon: invoice.khmshdon,
        khhdon: invoice.khhdon,
        shdon: invoice.shdon,
        cqt: invoice.cqt,
        hdon: invoice.hdon,
        hthdon: invoice.hthdon,
        htttoan: invoice.htttoan,
        idtbao: invoice.idtbao,
        khdon: invoice.khdon,
        khhdgoc: invoice.khhdgoc,
        khmshdgoc: invoice.khmshdgoc,
        lhdgoc: invoice.lhdgoc,
        mhdon: invoice.mhdon,
        mtdiep: invoice.mtdiep,
        mtdtchieu: invoice.mtdtchieu,
        nbdchi: invoice.nbdchi,
        chma: invoice.chma,
        chten: invoice.chten,
        nbhdktngay: invoice.nbhdktngay ? new Date(invoice.nbhdktngay) : undefined,
        nbhdktso: invoice.nbhdktso,
        nbhdso: invoice.nbhdso,
        nblddnbo: invoice.nblddnbo,
        nbptvchuyen: invoice.nbptvchuyen,
        nbstkhoan: invoice.nbstkhoan,
        nbten: invoice.nbten,
        nbtnhang: invoice.nbtnhang,
        nbtnvchuyen: invoice.nbtnvchuyen,
        ncma: invoice.ncma,
        ncnhat: invoice.ncnhat,
        nky: invoice.nky,
        nmdchi: invoice.nmdchi,
        nmmst: invoice.nmmst,
        nmstkhoan: invoice.nmstkhoan,
        nmten: invoice.nmten,
        nmtnhang: invoice.nmtnhang,
        nmtnmua: invoice.nmtnmua,
        nmttkhac: invoice.nmttkhac,
        ntao: invoice.ntao,
        ntnhan: invoice.ntnhan,
        pban: invoice.pban,
        ptgui: invoice.ptgui,
        shdgoc: invoice.shdgoc,
        tchat: invoice.tchat,
        tdlap: invoice.tdlap ? new Date(invoice.tdlap) : undefined,
        tgia: invoice.tgia || 0,
        tgtcthue: invoice.tgtcthue || 0,
        tgtthue: invoice.tgtthue || 0,
        tgtttbchu: invoice.tgtttbchu || 0,
        tgtttbso: invoice.tgtttbso || 0,
        thdon: invoice.thdon,
        thlap: invoice.thlap,
        tlhdon: invoice.tlhdon,
        ttcktmai: invoice.ttcktmai,
        tthai: invoice.tthai,
        tttbao: invoice.tttbao,
        ttxly: invoice.ttxly,
        tvandnkntt: invoice.tvandnkntt,
        mhso: invoice.mhso,
        mkhang: invoice.mkhang,
        nbsdthoai: invoice.nbsdthoai,
        nbdctdtu: invoice.nbdctdtu,
        nbfax: invoice.nbfax,
        nbwebsite: invoice.nbwebsite,
        nmsdthoai: invoice.nmsdthoai,
        nmdctdtu: invoice.nmdctdtu,
        nmcmnd: invoice.nmcmnd,
        nmcks: invoice.nmcks,
        bhphap: invoice.bhphap,
        hddunlap: invoice.hddunlap,
        gchdgoc: invoice.gchdgoc,
        tbhgtngay: invoice.tbhgtngay ? new Date(invoice.tbhgtngay) : undefined,
        bhpldo: invoice.bhpldo,
        bhpcbo: invoice.bhpcbo,
        bhpngay: invoice.bhpngay ? new Date(invoice.bhpngay) : undefined,
        tdlhdgoc: invoice.tdlhdgoc ? new Date(invoice.tdlhdgoc) : undefined,
        tgtphi: invoice.tgtphi || 0,
        unhiem: invoice.unhiem,
        mstdvnunlhdon: invoice.mstdvnunlhdon,
        tdvnunlhdon: invoice.tdvnunlhdon,
        nbmdvqhnsach: invoice.nbmdvqhnsach,
        nbsqdinh: invoice.nbsqdinh,
        nbncqdinh: invoice.nbncqdinh,
        nbcqcqdinh: invoice.nbcqcqdinh,
        nbhtban: invoice.nbhtban,
        nmmdvqhnsach: invoice.nmmdvqhnsach,
        nmddvchden: invoice.nmddvchden,
        nmtgvchdtu: invoice.nmtgvchdtu ? new Date(invoice.nmtgvchdtu) : undefined,
        nmtgvchdden: invoice.nmtgvchdden ? new Date(invoice.nmtgvchdden) : undefined,
        nbtnban: invoice.nbtnban,
        dcdvnunlhdon: invoice.dcdvnunlhdon,
        dksbke: invoice.dksbke ? new Date(invoice.dksbke) : undefined,
        dknlbke: invoice.dknlbke ? new Date(invoice.dknlbke) : undefined,
        thtttoan: invoice.thtttoan,
        msttcgp: invoice.msttcgp,
        gchu: invoice.gchu,
        kqcht: invoice.kqcht,
        hdntgia: invoice.hdntgia,
        tgtkcthue: invoice.tgtkcthue || 0,
        tgtkhac: invoice.tgtkhac || 0,
        nmshchieu: invoice.nmshchieu,
        nmnchchieu: invoice.nmnchchieu,
        nmnhhhchieu: invoice.nmnhhhchieu,
        nmqtich: invoice.nmqtich,
        ktkhthue: invoice.ktkhthue,
        nmstttoan: invoice.nmstttoan,
        nmttttoan: invoice.nmttttoan,
        hdhhdvu: invoice.hdhhdvu,
        qrcode: invoice.qrcode,
        ttmstten: invoice.ttmstten,
        ladhddtten: invoice.ladhddtten,
        hdxkhau: invoice.hdxkhau,
        hdxkptquan: invoice.hdxkptquan,
        hdgktkhthue: invoice.hdgktkhthue,
        hdonLquans: invoice.hdonLquans,
        tthdclquan: invoice.tthdclquan,
        pdndungs: invoice.pdndungs,
        hdtbssrses: invoice.hdtbssrses,
        hdTrung: invoice.hdTrung,
        isHDTrung: invoice.isHDTrung,
        hdcttchinh: invoice.hdcttchinh,
        mst: invoice.mst,
        nban: invoice.nban,
        nlap: invoice.nlap,
        nmua: invoice.nmua,
        nnt: invoice.nnt,
        shddauky: invoice.shddauky,
        shdkmdauky: invoice.shdkmdauky,
        nmsdt: invoice.nmsdt,
        brandname: brandname || invoice.brandname,  // Use config brandname or preserve from API data
        // Add other fields as needed from the external API
      }));

      // Create invoices and their details with progress tracking
      this.logger.log('Starting bulk invoice creation with detailed progress tracking...');
      
      // Track progress for logging
      let lastProgressLog = 0;
      const progressCallback = (progress: { processed: number; total: number; saved: number; skipped: number; failed: number; detailsSaved: number }) => {
        // Log progress every 10% or every 5 invoices
        const progressPercent = (progress.processed / progress.total) * 100;
        if (progressPercent - lastProgressLog >= 10 || progress.processed % 5 === 0) {
          this.logger.log(`📊 Progress: ${progress.processed}/${progress.total} (${progressPercent.toFixed(1)}%) | Saved: ${progress.saved} | Details: ${progress.detailsSaved}`);
          lastProgressLog = progressPercent;
        }
      };
      
      const syncResult = await this.invoiceService.bulkCreateInvoices({
        invoices: convertedInvoices,
        skipExisting: true,
        includeDetails: true,
        bearerToken: bearerToken,
      }, progressCallback);

      const duration = Date.now() - startTime;
      const durationMinutes = (duration / 1000 / 60).toFixed(2);
      
      this.logger.log('='.repeat(80));
      this.logger.log('SYNC OPERATION COMPLETED');
      this.logger.log('='.repeat(80));
      this.logger.log(`Total Duration: ${durationMinutes} minutes (${(duration / 1000).toFixed(2)}s)`);
      this.logger.log(`Invoices Processed: ${syncResult.invoicesSaved}/${convertedInvoices.length}`);
      this.logger.log(`Details Fetched: ${syncResult.detailsSaved}`);
      this.logger.log(`Errors: ${syncResult.errors.length}`);
      this.logger.log(`Success Rate: ${((syncResult.invoicesSaved / convertedInvoices.length) * 100).toFixed(2)}%`);
      this.logger.log('='.repeat(80));
      
      // Enhance result with additional metadata
      return {
        ...syncResult,
        metadata: {
          totalProcessed: convertedInvoices.length,
          durationMs: duration,
          durationMinutes: parseFloat(durationMinutes),
          successRate: parseFloat(((syncResult.invoicesSaved / convertedInvoices.length) * 100).toFixed(2)),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
        }
      };
    } catch (error) {
      this.logger.error('REST: Error syncing invoices:', error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get database statistics
   */
  @Get('stats/summary')
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async getStats() {
    try {
      this.logger.log('REST: Getting invoice statistics');
      return await this.invoiceService.getStats();
    } catch (error) {
      this.logger.error('REST: Error getting stats:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}