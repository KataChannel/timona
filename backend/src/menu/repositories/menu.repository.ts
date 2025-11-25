import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Menu, MenuType, Prisma } from '@prisma/client';
import { MenuFilterDto } from '../dto';

@Injectable()
export class MenuRepository {
  private readonly logger = new Logger(MenuRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        creator: true,
        updater: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findMany(
    where: Prisma.MenuWhereInput,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.MenuOrderByWithRelationInput;
      include?: Prisma.MenuInclude;
    },
  ): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      include: options?.include || {
        parent: true,
        children: true,
      },
    });
  }

  async count(where: Prisma.MenuWhereInput): Promise<number> {
    return this.prisma.menu.count({ where });
  }

  async create(data: Prisma.MenuCreateInput): Promise<Menu> {
    return this.prisma.menu.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async update(id: string, data: Prisma.MenuUpdateInput): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async delete(id: string): Promise<Menu> {
    return this.prisma.menu.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<number> {
    const result = await this.prisma.menu.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  async findByType(type: MenuType): Promise<Menu[]> {
    return this.findMany(
      { type, isActive: true, isVisible: true },
      { orderBy: { order: 'asc' } },
    );
  }

  async findChildren(parentId: string): Promise<Menu[]> {
    return this.findMany(
      { parentId },
      { orderBy: { order: 'asc' } },
    );
  }

  async findRoots(type?: MenuType): Promise<Menu[]> {
    const where: Prisma.MenuWhereInput = {
      parentId: null,
      isActive: true,
      isVisible: true,
    };
    if (type) where.type = type;

    return this.findMany(where, { orderBy: { order: 'asc' } });
  }

  async findRootsHierarchical(type?: MenuType, depth: number = 3): Promise<any[]> {
    const where: Prisma.MenuWhereInput = {
      parentId: null,
      isActive: true,
      isVisible: true,
    };
    if (type) where.type = type;

    const menus = await this.prisma.menu.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // Recursively load children
    const loadChildren = async (menuId: string, currentDepth: number): Promise<any> => {
      if (currentDepth <= 0) return null;

      const children = await this.prisma.menu.findMany({
        where: { parentId: menuId, isActive: true, isVisible: true },
        orderBy: { order: 'asc' },
      });

      if (children.length === 0) return undefined;

      return Promise.all(
        children.map(async (child) => ({
          ...child,
          children: await loadChildren(child.id, currentDepth - 1),
        }))
      );
    };

    return Promise.all(
      menus.map(async (menu) => ({
        ...menu,
        children: await loadChildren(menu.id, depth - 1),
      }))
    );
  }

  async updateMany(ids: string[], data: Prisma.MenuUpdateInput): Promise<number> {
    const result = await this.prisma.menu.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return result.count;
  }

  buildWhereClause(filter?: MenuFilterDto): Prisma.MenuWhereInput {
    const where: Prisma.MenuWhereInput = {};

    if (!filter) return where;

    if (filter.type) where.type = filter.type;
    if (filter.parentId !== undefined) where.parentId = filter.parentId;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.isVisible !== undefined) where.isVisible = filter.isVisible;
    if (filter.isPublic !== undefined) where.isPublic = filter.isPublic;

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { slug: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
