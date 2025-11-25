import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Logger } from '@nestjs/common';
import { DynamicQueryGeneratorService } from '../services/dynamic-query-generator.service';

/**
 * Resolver for ext_ prefixed models (external/extended models)
 * Provides GraphQL queries matching frontend's dynamic query generator
 */
@Resolver()
export class ExtModelsResolver {
  private readonly logger = new Logger(ExtModelsResolver.name);

  constructor(
    private readonly dynamicQueryService: DynamicQueryGeneratorService,
  ) {}

  // ==================== ext_sanphamhoadon ====================

  @Query(() => [GraphQLJSON], {
    name: 'getext_sanphamhoadons',
    description: 'Get all ext_sanphamhoadon records',
  })
  async getext_sanphamhoadons(
    @Args('filters', { type: () => GraphQLJSON, nullable: true }) filters?: any,
  ): Promise<any> {
    this.logger.log('Query: getext_sanphamhoadons');
    const result = await this.dynamicQueryService.findMany('ext_sanphamhoadon', {
      where: filters?.where,
      select: filters?.select,
      include: filters?.include,
      orderBy: filters?.orderBy,
      skip: filters?.skip,
      take: filters?.take,
    });
    return result.data; // Return data array, not the whole result object
  }

  @Query(() => GraphQLJSON, {
    name: 'getext_sanphamhoadonsPaginated',
    description: 'Get paginated ext_sanphamhoadon records',
  })
  async getext_sanphamhoadonsPaginated(
    @Args('filters', { type: () => GraphQLJSON, nullable: true }) filters?: any,
  ): Promise<any> {
    this.logger.log('Query: getext_sanphamhoadonsPaginated');
    
    const page = filters?.page || 0;
    const limit = filters?.limit || 10;
    
    const [data, total] = await Promise.all([
      this.dynamicQueryService.findMany('ext_sanphamhoadon', {
        where: filters?.where,
        select: filters?.select,
        include: filters?.include,
        orderBy: filters?.orderBy,
        skip: page * limit,
        take: limit,
      }),
      this.dynamicQueryService.count('ext_sanphamhoadon', filters?.where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: (page + 1) * limit < total,
        hasPrevPage: page > 0,
      },
    };
  }

  @Query(() => GraphQLJSON, {
    name: 'getext_sanphamhoadonById',
    description: 'Get single ext_sanphamhoadon by ID',
  })
  async getext_sanphamhoadonById(
    @Args('id', { type: () => String }) id: string,
    @Args('options', { type: () => GraphQLJSON, nullable: true }) options?: any,
  ): Promise<any> {
    this.logger.log(`Query: getext_sanphamhoadonById - ${id}`);
    return this.dynamicQueryService.findUnique('ext_sanphamhoadon', { id }, options);
  }

  @Mutation(() => GraphQLJSON, {
    name: 'createext_sanphamhoadon',
    description: 'Create new ext_sanphamhoadon',
  })
  async createext_sanphamhoadon(
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Args('options', { type: () => GraphQLJSON, nullable: true }) options?: any,
  ): Promise<any> {
    this.logger.log('Mutation: createext_sanphamhoadon');
    return this.dynamicQueryService.create('ext_sanphamhoadon', data, options);
  }

  @Mutation(() => GraphQLJSON, {
    name: 'updateext_sanphamhoadon',
    description: 'Update ext_sanphamhoadon',
  })
  async updateext_sanphamhoadon(
    @Args('id', { type: () => String }) id: string,
    @Args('data', { type: () => GraphQLJSON }) data: any,
    @Args('options', { type: () => GraphQLJSON, nullable: true }) options?: any,
  ): Promise<any> {
    this.logger.log(`Mutation: updateext_sanphamhoadon - ${id}`);
    return this.dynamicQueryService.update('ext_sanphamhoadon', { id }, data, options);
  }

  @Mutation(() => GraphQLJSON, {
    name: 'deleteext_sanphamhoadon',
    description: 'Delete ext_sanphamhoadon',
  })
  async deleteext_sanphamhoadon(
    @Args('id', { type: () => String }) id: string,
    @Args('options', { type: () => GraphQLJSON, nullable: true }) options?: any,
  ): Promise<any> {
    this.logger.log(`Mutation: deleteext_sanphamhoadon - ${id}`);
    return this.dynamicQueryService.delete('ext_sanphamhoadon', { id }, options);
  }

  // ==================== ext_listhoadon ====================

  @Query(() => [GraphQLJSON], {
    name: 'getext_listhoadons',
    description: 'Get all ext_listhoadon records',
  })
  async getext_listhoadons(
    @Args('filters', { type: () => GraphQLJSON, nullable: true }) filters?: any,
  ): Promise<any> {
    this.logger.log('Query: getext_listhoadons');
    const result = await this.dynamicQueryService.findMany('ext_listhoadon', {
      where: filters?.where,
      select: filters?.select,
      include: filters?.include,
      orderBy: filters?.orderBy,
      skip: filters?.skip,
      take: filters?.take,
    });
    return result.data;
  }

  // ==================== ext_detailhoadon ====================

  @Query(() => [GraphQLJSON], {
    name: 'getext_detailhoadons',
    description: 'Get all ext_detailhoadon records',
  })
  async getext_detailhoadons(
    @Args('filters', { type: () => GraphQLJSON, nullable: true }) filters?: any,
  ): Promise<any> {
    this.logger.log('Query: getext_detailhoadons');
    const result = await this.dynamicQueryService.findMany('ext_detailhoadon', {
      where: filters?.where,
      select: filters?.select,
      include: filters?.include,
      orderBy: filters?.orderBy,
      skip: filters?.skip,
      take: filters?.take,
    });
    return result.data;
  }
}
