import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { MenuService } from './menu.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MenuFilterDto,
  MenuResponseDto,
  MenuPaginationResponseDto,
  MenuOrderDto,
  MenuHierarchicalDto,
} from './dto';

@Resolver('Menu')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class MenuResolver {
  private readonly logger = new Logger(MenuResolver.name);

  constructor(private readonly menuService: MenuService) {}

  // =====================================================
  // QUERIES
  // =====================================================

  @Query(() => MenuResponseDto, { name: 'menu', nullable: true })
  async getMenu(@Args('id', { type: () => ID }) id: string): Promise<MenuResponseDto> {
    this.logger.log(`Query: getMenu(${id})`);
    return this.menuService.findById(id);
  }

  @Query(() => MenuResponseDto, { name: 'menuBySlug', nullable: true })
  async getMenuBySlug(@Args('slug') slug: string): Promise<MenuResponseDto> {
    this.logger.log(`Query: getMenuBySlug(${slug})`);
    return this.menuService.findBySlug(slug);
  }

  @Query(() => MenuPaginationResponseDto, { name: 'menus' })
  async getMenus(
    @Args('filter', { type: () => MenuFilterDto, nullable: true }) filter?: MenuFilterDto,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('orderBy', { type: () => String, nullable: true }) orderByField?: string,
    @Args('direction', { type: () => String, nullable: true }) direction?: 'asc' | 'desc',
  ): Promise<MenuPaginationResponseDto> {
    this.logger.log('Query: getMenus');
    
    return this.menuService.findAll(
      filter,
      orderByField ? { field: orderByField, direction } : undefined,
      { page, pageSize: limit },
    );
  }

  @Query(() => [MenuResponseDto], { name: 'menuTree' })
  async getMenuTree(
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('parentId', { type: () => String, nullable: true }) parentId?: string,
  ): Promise<MenuResponseDto[]> {
    this.logger.log(`Query: getMenuTree(type: ${type}, parentId: ${parentId})`);
    return this.menuService.getMenuTree(type as any, parentId);
  }

  @Query(() => [MenuResponseDto], { name: 'sidebarMenus' })
  async getSidebarMenus(): Promise<MenuResponseDto[]> {
    this.logger.log('Query: getSidebarMenus');
    return this.menuService.getMenusByType('SIDEBAR');
  }

  @Query(() => [MenuHierarchicalDto], { name: 'headerMenus' })
  async getHeaderMenus(): Promise<MenuHierarchicalDto[]> {
    this.logger.log('Query: getHeaderMenus');
    return this.menuService.getMenusByTypeHierarchical('HEADER' as any);
  }

  @Query(() => [MenuHierarchicalDto], { name: 'footerMenus' })
  async getFooterMenus(): Promise<MenuHierarchicalDto[]> {
    this.logger.log('Query: getFooterMenus');
    return this.menuService.getMenusByTypeHierarchical('FOOTER' as any);
  }

  @Query(() => [MenuHierarchicalDto], { name: 'mobileMenus' })
  async getMobileMenus(): Promise<MenuHierarchicalDto[]> {
    this.logger.log('Query: getMobileMenus');
    return this.menuService.getMenusByTypeHierarchical('MOBILE' as any);
  }

  @Query(() => [MenuResponseDto], { name: 'myMenus' })
  async getMyMenus(
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Context() ctx?: any,
  ): Promise<MenuResponseDto[]> {
    const userId = ctx?.req?.user?.id;
    const userRoles = ctx?.req?.user?.roles || [];
    const userPermissions = ctx?.req?.user?.permissions || [];

    if (!userId) {
      this.logger.warn('Query: myMenus - No user context');
      return [];
    }

    this.logger.log(`Query: myMenus for user ${userId}`);
    return this.menuService.getAccessibleMenus(userId, userRoles, userPermissions, type as any);
  }

  // =====================================================
  // MUTATIONS
  // =====================================================

  @Mutation(() => MenuResponseDto, { name: 'createMenu' })
  async createMenu(
    @Args('input', { type: () => CreateMenuDto }) input: CreateMenuDto,
    @Context() ctx?: any,
  ): Promise<MenuResponseDto> {
    const userId = ctx?.req?.user?.id;
    this.logger.log(`Mutation: createMenu by user ${userId}`);
    return this.menuService.createMenu(input, userId);
  }

  @Mutation(() => MenuResponseDto, { name: 'updateMenu' })
  async updateMenu(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateMenuDto }) input: UpdateMenuDto,
    @Context() ctx?: any,
  ): Promise<MenuResponseDto> {
    const userId = ctx?.req?.user?.id;
    this.logger.log(`Mutation: updateMenu(${id}) by user ${userId}`);
    return this.menuService.updateMenu(id, input, userId);
  }

  @Mutation(() => Boolean, { name: 'deleteMenu' })
  async deleteMenu(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    this.logger.log(`Mutation: deleteMenu(${id})`);
    await this.menuService.deleteMenu(id);
    return true;
  }

  @Mutation(() => MenuResponseDto, { name: 'toggleMenuActive' })
  async toggleMenuActive(@Args('id', { type: () => ID }) id: string): Promise<MenuResponseDto> {
    this.logger.log(`Mutation: toggleMenuActive(${id})`);
    return this.menuService.toggleActive(id);
  }

  @Mutation(() => MenuResponseDto, { name: 'toggleMenuVisibility' })
  async toggleMenuVisibility(@Args('id', { type: () => ID }) id: string): Promise<MenuResponseDto> {
    this.logger.log(`Mutation: toggleMenuVisibility(${id})`);
    return this.menuService.toggleVisibility(id);
  }

  @Mutation(() => [MenuResponseDto], { name: 'reorderMenus' })
  async reorderMenus(
    @Args('menuOrders', { type: () => [MenuOrderDto] }) menuOrders: MenuOrderDto[],
  ): Promise<MenuResponseDto[]> {
    this.logger.log(`Mutation: reorderMenus (${menuOrders.length} items)`);
    const ids = menuOrders.map(m => m.id);
    return this.menuService.reorderMenus(ids);
  }

  @Mutation(() => MenuResponseDto, { name: 'moveMenu' })
  async moveMenu(
    @Args('menuId', { type: () => ID }) menuId: string,
    @Args('newParentId', { type: () => ID, nullable: true }) newParentId?: string,
    @Args('newOrder', { type: () => Number, nullable: true }) newOrder?: number,
  ): Promise<MenuResponseDto> {
    this.logger.log(`Mutation: moveMenu(${menuId}) to parent ${newParentId}`);
    return this.menuService.moveMenu(menuId, newParentId, newOrder);
  }
}
