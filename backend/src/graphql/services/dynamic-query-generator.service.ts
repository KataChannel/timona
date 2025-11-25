import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DynamicQueryOptions {
  select?: Record<string, any>;
  where?: Record<string, any>;
  include?: Record<string, any>;
  orderBy?: Record<string, any> | Array<Record<string, any>>;
  skip?: number;
  take?: number;
  cursor?: Record<string, any>;
  distinct?: string | string[];
}

export interface DynamicQueryResult {
  data: any;
  count?: number;
  hasMore?: boolean;
  total?: number;
}

/**
 * Dynamic Query Generator Service
 * Generates and executes dynamic Prisma queries for all models
 * Supports: findMany, findUnique, findFirst, create, update, delete, count, aggregate
 */
@Injectable()
export class DynamicQueryGeneratorService {
  private readonly logger = new Logger(DynamicQueryGeneratorService.name);

  // Valid Prisma models (automatically updated from schema)
  private readonly validModels = [
    'user',
    'authMethod',
    'verificationToken',
    'userSession',
    'auditLog',
    'role',
    'permission',
    'rolePermission',
    'userRoleAssignment',
    'userPermission',
    'resourceAccess',
    'post',
    'comment',
    'tag',
    'postTag',
    'like',
    'task',
    'taskComment',
    'taskMedia',
    'taskShare',
    'notification',
    'menu',
    'page',
    'pageBlock',
    'chatbotModel',
    'trainingData',
    'chatConversation',
    'chatMessage',
    'affUser',
    'affCampaign',
    'affCampaignAffiliate',
    'affLink',
    'affClick',
    'affConversion',
    'affPaymentRequest',
    'userMfaSettings',
    'invoice',
    'invoiceItem',
    'invoicePayment',
    'ext_listhoadon',
    'ext_detailhoadon',
    'ext_sanphamhoadon',
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Validate model name
   */
  private validateModel(modelName: string): void {
    const normalizedModel = modelName.toLowerCase();
    if (!this.validModels.includes(normalizedModel)) {
      throw new Error(
        `Invalid model: ${modelName}. Valid models: ${this.validModels.join(', ')}`
      );
    }
  }

  /**
   * Get Prisma delegate for a model
   */
  private getModelDelegate(modelName: string): any {
    const normalizedModel = modelName.toLowerCase();
    
    // Map model names to Prisma client delegates
    const modelMap: Record<string, any> = {
      user: this.prisma.user,
      authmethod: this.prisma.authMethod,
      verificationtoken: this.prisma.verificationToken,
      usersession: this.prisma.userSession,
      auditlog: this.prisma.auditLog,
      role: this.prisma.role,
      permission: this.prisma.permission,
      rolepermission: this.prisma.rolePermission,
      userroleassignment: this.prisma.userRoleAssignment,
      userpermission: this.prisma.userPermission,
      resourceaccess: this.prisma.resourceAccess,
      post: this.prisma.post,
      comment: this.prisma.comment,
      tag: this.prisma.tag,
      posttag: this.prisma.postTag,
      like: this.prisma.like,
      task: this.prisma.task,
      taskcomment: this.prisma.taskComment,
      taskmedia: this.prisma.taskMedia,
      taskshare: this.prisma.taskShare,
      notification: this.prisma.notification,
      menu: this.prisma.menu,
      page: this.prisma.page,
      pageblock: this.prisma.pageBlock,
      chatbotmodel: this.prisma.chatbotModel,
      trainingdata: this.prisma.trainingData,
      chatconversation: this.prisma.chatConversation,
      chatmessage: this.prisma.chatMessage,
      affuser: this.prisma.affUser,
      affcampaign: this.prisma.affCampaign,
      affcampaignaffiliate: this.prisma.affCampaignAffiliate,
      afflink: this.prisma.affLink,
      affclick: this.prisma.affClick,
      affconversion: this.prisma.affConversion,
      affpaymentrequest: this.prisma.affPaymentRequest,
      usermfasettings: this.prisma.userMfaSettings,
      invoice: this.prisma.ext_listhoadon,
      invoiceitem: this.prisma.ext_detailhoadon,
      invoicepayment: this.prisma.ext_listhoadon, // Assuming same table
      ext_listhoadon: this.prisma.ext_listhoadon,
      ext_detailhoadon: this.prisma.ext_detailhoadon,
      ext_sanphamhoadon: this.prisma.ext_sanphamhoadon,
    };

    const delegate = modelMap[normalizedModel];
    if (!delegate) {
      throw new Error(`No Prisma delegate found for model: ${modelName}`);
    }

    return delegate;
  }

  /**
   * Find Many - Get multiple records
   */
  async findMany(
    modelName: string,
    options: DynamicQueryOptions = {}
  ): Promise<DynamicQueryResult> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, where, include, orderBy, skip, take, distinct } = options;

      const queryOptions: any = {};
      if (select) queryOptions.select = select;
      if (where) queryOptions.where = where;
      if (include) queryOptions.include = include;
      
      // Normalize orderBy: convert object with multiple keys to array
      if (orderBy) {
        if (Array.isArray(orderBy)) {
          queryOptions.orderBy = orderBy;
        } else if (typeof orderBy === 'object') {
          // If object has multiple keys, convert to array
          const keys = Object.keys(orderBy);
          if (keys.length > 1) {
            queryOptions.orderBy = keys.map(key => ({ [key]: orderBy[key] }));
          } else {
            queryOptions.orderBy = orderBy;
          }
        }
      }
      
      if (skip !== undefined) queryOptions.skip = skip;
      if (take !== undefined) queryOptions.take = take;
      if (distinct) queryOptions.distinct = distinct;

      this.logger.debug(`findMany ${modelName}:`, queryOptions);

      const data = await delegate.findMany(queryOptions);
      
      // Get total count if pagination is used
      let total;
      if (skip !== undefined || take !== undefined) {
        total = await delegate.count({ where });
      }

      return {
        data,
        count: data.length,
        total,
        hasMore: total ? skip + take < total : false,
      };
    } catch (error) {
      this.logger.error(`Error in findMany for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find Unique - Get a single unique record
   */
  async findUnique(
    modelName: string,
    where: Record<string, any>,
    options: Omit<DynamicQueryOptions, 'where'> = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, include } = options;

      const queryOptions: any = { where };
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      this.logger.debug(`findUnique ${modelName}:`, queryOptions);

      return await delegate.findUnique(queryOptions);
    } catch (error) {
      this.logger.error(`Error in findUnique for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find First - Get the first matching record
   */
  async findFirst(
    modelName: string,
    options: DynamicQueryOptions = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, where, include, orderBy } = options;

      const queryOptions: any = {};
      if (select) queryOptions.select = select;
      if (where) queryOptions.where = where;
      if (include) queryOptions.include = include;
      if (orderBy) queryOptions.orderBy = orderBy;

      this.logger.debug(`findFirst ${modelName}:`, queryOptions);

      return await delegate.findFirst(queryOptions);
    } catch (error) {
      this.logger.error(`Error in findFirst for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Create - Create a new record
   */
  async create(
    modelName: string,
    data: Record<string, any>,
    options: Omit<DynamicQueryOptions, 'where'> = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, include } = options;

      const queryOptions: any = { data };
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      this.logger.debug(`create ${modelName}:`, queryOptions);

      return await delegate.create(queryOptions);
    } catch (error) {
      this.logger.error(`Error in create for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Create Many - Create multiple records
   */
  async createMany(
    modelName: string,
    data: Array<Record<string, any>>,
    skipDuplicates = false
  ): Promise<{ count: number }> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`createMany ${modelName}:`, { count: data.length });

      return await delegate.createMany({
        data,
        skipDuplicates,
      });
    } catch (error) {
      this.logger.error(`Error in createMany for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Update - Update a record
   */
  async update(
    modelName: string,
    where: Record<string, any>,
    data: Record<string, any>,
    options: Omit<DynamicQueryOptions, 'where'> = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, include } = options;

      const queryOptions: any = { where, data };
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      this.logger.debug(`update ${modelName}:`, queryOptions);

      return await delegate.update(queryOptions);
    } catch (error) {
      this.logger.error(`Error in update for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Update Many - Update multiple records
   */
  async updateMany(
    modelName: string,
    where: Record<string, any>,
    data: Record<string, any>
  ): Promise<{ count: number }> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`updateMany ${modelName}:`, { where, data });

      return await delegate.updateMany({ where, data });
    } catch (error) {
      this.logger.error(`Error in updateMany for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Upsert - Create or update a record
   */
  async upsert(
    modelName: string,
    where: Record<string, any>,
    create: Record<string, any>,
    update: Record<string, any>,
    options: Omit<DynamicQueryOptions, 'where'> = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, include } = options;

      const queryOptions: any = { where, create, update };
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      this.logger.debug(`upsert ${modelName}:`, queryOptions);

      return await delegate.upsert(queryOptions);
    } catch (error) {
      this.logger.error(`Error in upsert for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Delete - Delete a record
   */
  async delete(
    modelName: string,
    where: Record<string, any>,
    options: Omit<DynamicQueryOptions, 'where'> = {}
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      const { select, include } = options;

      const queryOptions: any = { where };
      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;

      this.logger.debug(`delete ${modelName}:`, queryOptions);

      return await delegate.delete(queryOptions);
    } catch (error) {
      this.logger.error(`Error in delete for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Delete Many - Delete multiple records
   */
  async deleteMany(
    modelName: string,
    where: Record<string, any>
  ): Promise<{ count: number }> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`deleteMany ${modelName}:`, { where });

      return await delegate.deleteMany({ where });
    } catch (error) {
      this.logger.error(`Error in deleteMany for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Count - Count records
   */
  async count(
    modelName: string,
    where?: Record<string, any>
  ): Promise<number> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`count ${modelName}:`, { where });

      return await delegate.count({ where });
    } catch (error) {
      this.logger.error(`Error in count for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Aggregate - Perform aggregations
   */
  async aggregate(
    modelName: string,
    options: {
      where?: Record<string, any>;
      _count?: boolean | Record<string, boolean>;
      _sum?: Record<string, boolean>;
      _avg?: Record<string, boolean>;
      _min?: Record<string, boolean>;
      _max?: Record<string, boolean>;
    }
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`aggregate ${modelName}:`, options);

      return await delegate.aggregate(options);
    } catch (error) {
      this.logger.error(`Error in aggregate for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Group By - Group records and perform aggregations
   */
  async groupBy(
    modelName: string,
    options: {
      by: string | string[];
      where?: Record<string, any>;
      having?: Record<string, any>;
      orderBy?: Record<string, any> | Array<Record<string, any>>;
      skip?: number;
      take?: number;
      _count?: boolean | Record<string, boolean>;
      _sum?: Record<string, boolean>;
      _avg?: Record<string, boolean>;
      _min?: Record<string, boolean>;
      _max?: Record<string, boolean>;
    }
  ): Promise<any> {
    this.validateModel(modelName);
    const delegate = this.getModelDelegate(modelName);

    try {
      this.logger.debug(`groupBy ${modelName}:`, options);

      return await delegate.groupBy(options);
    } catch (error) {
      this.logger.error(`Error in groupBy for ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Execute Raw Query
   */
  async executeRaw(query: string, params: any[] = []): Promise<any> {
    try {
      this.logger.debug('executeRaw:', { query, params });

      return await this.prisma.$executeRaw`${query}`;
    } catch (error) {
      this.logger.error('Error in executeRaw:', error);
      throw error;
    }
  }

  /**
   * Query Raw
   */
  async queryRaw(query: string, params: any[] = []): Promise<any> {
    try {
      this.logger.debug('queryRaw:', { query, params });

      return await this.prisma.$queryRaw`${query}`;
    } catch (error) {
      this.logger.error('Error in queryRaw:', error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return this.validModels;
  }

  /**
   * Check if model exists
   */
  modelExists(modelName: string): boolean {
    return this.validModels.includes(modelName.toLowerCase());
  }
}
