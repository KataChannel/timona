/**
 * ============================================================================
 * PUBLIC MENU RESOLVER
 * ============================================================================
 * 
 * Provides public access to menu items for website navigation
 * No authentication required
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import GraphQLJSON from 'graphql-type-json';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Resolver()
export class MenuPublicResolver {
  private readonly logger = new Logger(MenuPublicResolver.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('🌐 Public Menu Resolver ready');
  }

  /**
   * Get Public Menus
   * No authentication required - used for website header/footer navigation
   * 
   * Example: publicMenus(type: "HEADER", isActive: true)
   */
  @Query(() => [GraphQLJSON], {
    name: 'publicMenus',
    description: 'Get public menu items (no authentication required)',
  })
  async publicMenus(
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('isActive', { type: () => Boolean, nullable: true }) isActive?: boolean,
    @Args('isVisible', { type: () => Boolean, nullable: true }) isVisible?: boolean,
    @Args('orderBy', { type: () => GraphQLJSON, nullable: true }) orderBy?: any,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('includeChildren', { type: () => Boolean, nullable: true, defaultValue: true }) includeChildren?: boolean,
  ): Promise<any[]> {
    try {
      const where: any = {};
      
      // Apply filters
      if (type) where.type = type;
      if (typeof isActive === 'boolean') where.isActive = isActive;
      if (typeof isVisible === 'boolean') where.isVisible = isVisible;

      // Build include for nested children with proper Prisma types
      const include: Prisma.MenuInclude | undefined = includeChildren ? {
        children: {
          where: {
            isActive: true,
            isVisible: true,
          },
          orderBy: orderBy || { order: Prisma.SortOrder.asc },
          include: {
            children: {
              where: {
                isActive: true,
                isVisible: true,
              },
              orderBy: { order: Prisma.SortOrder.asc },
            }
          }
        }
      } : undefined;

      // Fetch menus
      const menus = await this.prisma.menu.findMany({
        where,
        orderBy: orderBy || { order: Prisma.SortOrder.asc },
        skip,
        take,
        include,
      });

      this.logger.debug(`✅ Fetched ${menus.length} public menus (type: ${type || 'all'})`);
      return menus;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch public menus: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get Public Menu by ID
   * No authentication required
   * 
   * Example: publicMenuById(id: "abc-123")
   */
  @Query(() => GraphQLJSON, {
    name: 'publicMenuById',
    description: 'Get a specific public menu item by ID (no authentication required)',
    nullable: true,
  })
  async publicMenuById(
    @Args('id', { type: () => String }) id: string,
    @Args('includeChildren', { type: () => Boolean, nullable: true, defaultValue: true }) includeChildren?: boolean,
  ): Promise<any | null> {
    try {
      const include: Prisma.MenuInclude | undefined = includeChildren ? {
        children: {
          where: {
            isActive: true,
            isVisible: true,
          },
          orderBy: { order: Prisma.SortOrder.asc },
          include: {
            children: {
              where: {
                isActive: true,
                isVisible: true,
              },
              orderBy: { order: Prisma.SortOrder.asc },
            }
          }
        }
      } : undefined;

      const menu = await this.prisma.menu.findUnique({
        where: { id },
        include,
      });

      if (!menu) {
        this.logger.debug(`⚠️ Menu not found: ${id}`);
        return null;
      }

      this.logger.debug(`✅ Fetched public menu: ${id}`);
      return menu;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch public menu by ID: ${error.message}`, error.stack);
      throw error;
    }
  }
}
