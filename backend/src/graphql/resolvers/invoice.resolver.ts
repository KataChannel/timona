import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { $Enums } from '@prisma/client';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceImportService } from '../../services/invoice-import.service';
import {
  ExtListhoadon,
  ExtDetailhoadon,
  InvoiceSearchResult,
  DatabaseSyncResult,
  InvoiceStats,
} from '../models/invoice.model';
import {
  CreateInvoiceInput,
  CreateInvoiceDetailInput,
  InvoiceSearchInput,
  BulkInvoiceInput,
} from '../inputs/invoice.input';

@Resolver(() => ExtListhoadon)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceResolver {
  private readonly logger = new Logger(InvoiceResolver.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceImportService: InvoiceImportService,
  ) {}

  /**
   * Create a new invoice
   */
  @Mutation(() => ExtListhoadon)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async createInvoice(
    @Args('input') input: CreateInvoiceInput,
  ): Promise<ExtListhoadon> {
    this.logger.log('Creating invoice with data:', JSON.stringify(input));
    return this.invoiceService.createInvoice(input);
  }

  /**
   * Create invoice details
   */
  @Mutation(() => [ExtDetailhoadon])
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async createInvoiceDetails(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
    @Args('details', { type: () => [CreateInvoiceDetailInput] }) details: CreateInvoiceDetailInput[],
  ): Promise<ExtDetailhoadon[]> {
    this.logger.log(`Creating ${details.length} details for invoice ${invoiceId}`);
    return this.invoiceService.createInvoiceDetails(invoiceId, details);
  }

  /**
   * Get invoice by ID
   */
  @Query(() => ExtListhoadon)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async getInvoice(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ExtListhoadon> {
    this.logger.log(`Getting invoice: ${id}`);
    return this.invoiceService.getInvoiceById(id);
  }

  /**
   * Search invoices with filters and pagination
   */
  @Query(() => InvoiceSearchResult)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async searchInvoices(
    @Args('input') input: InvoiceSearchInput,
  ): Promise<InvoiceSearchResult> {
    this.logger.log('Searching invoices with filters:', JSON.stringify(input));
    return this.invoiceService.searchInvoices(input);
  }

  /**
   * Check if invoice exists
   */
  @Query(() => Boolean)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async invoiceExists(
    @Args('idServer') idServer: string,
    @Args('nbmst') nbmst: string,
    @Args('khmshdon') khmshdon: string,
    @Args('shdon') shdon: string,
  ): Promise<boolean> {
    return this.invoiceService.invoiceExists(idServer, nbmst, khmshdon, shdon);
  }

  /**
   * Bulk create invoices with optional Bearer Token from frontend
   */
  @Mutation(() => DatabaseSyncResult)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async bulkCreateInvoices(
    @Args('input') input: BulkInvoiceInput,
  ): Promise<DatabaseSyncResult> {
    const tokenInfo = input.bearerToken ? 
      `with Bearer Token from frontend (${input.bearerToken.substring(0, 10)}...)` : 
      'using environment token (if configured)';
    
    this.logger.log(`Bulk creating ${input.invoices.length} invoices ${tokenInfo}`);
    this.logger.log(`Include details: ${input.includeDetails}, Skip existing: ${input.skipExisting}`);
    
    // GraphQL resolver doesn't need progress callback (logs to console only)
    return this.invoiceService.bulkCreateInvoices(input, undefined);
  }

  /**
   * Get database statistics
   */
  @Query(() => InvoiceStats)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async getInvoiceStats(): Promise<InvoiceStats> {
    this.logger.log('Getting invoice statistics');
    return this.invoiceService.getStats();
  }

  /**
   * Update invoice
   */
  @Mutation(() => ExtListhoadon)
  @Roles($Enums.UserRoleType.ADMIN, $Enums.UserRoleType.USER)
  async updateInvoice(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateInvoiceInput,
  ): Promise<ExtListhoadon> {
    this.logger.log(`Updating invoice: ${id}`);
    return this.invoiceService.updateInvoice(id, input);
  }

  /**
   * Delete invoice (admin only)
   */
  @Mutation(() => Boolean)
  @Roles($Enums.UserRoleType.ADMIN)
  async deleteInvoice(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting invoice: ${id}`);
    return this.invoiceService.deleteInvoice(id);
  }
}