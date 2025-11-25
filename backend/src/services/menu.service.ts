import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenus(type?: string) {
    const where: any = { isActive: true };
    if (type) where.type = type;

    const menus = await this.prisma.menu.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return this.buildMenuTree(menus);
  }

  async getMenuById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }

    return this.addFinalUrl(menu);
  }

  async getMenuBySlug(slug: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { slug },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with slug ${slug} not found`);
    }

    return this.addFinalUrl(menu);
  }

  async createMenu(input: any, userId?: string) {
    // Check if slug already exists
    const existing = await this.prisma.menu.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      throw new BadRequestException(`Menu with slug "${input.slug}" already exists`);
    }

    // Calculate level if has parent
    let level = 0;
    let path = `/${input.slug}`;

    if (input.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: input.parentId },
      });

      if (parent) {
        level = parent.level + 1;
        path = `${parent.path}/${input.slug}`;
      }
    }

    const data: any = {
      ...input,
      level,
      path,
      createdBy: userId,
    };

    const menu = await this.prisma.menu.create({ data });
    return this.addFinalUrl(menu);
  }

  async updateMenu(id: string, input: any, userId?: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });

    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }

    if (menu.isProtected) {
      throw new BadRequestException('Cannot modify protected menu');
    }

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== menu.slug) {
      const existing = await this.prisma.menu.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new BadRequestException(`Menu with slug "${input.slug}" already exists`);
      }
    }

    const data: any = {
      ...input,
      updatedBy: userId,
    };

    // Recalculate level and path if parent changed
    if (input.parentId !== undefined) {
      if (input.parentId) {
        const parent = await this.prisma.menu.findUnique({
          where: { id: input.parentId },
        });

        if (parent) {
          data.level = parent.level + 1;
          data.path = `${parent.path}/${input.slug || menu.slug}`;
        }
      } else {
        data.level = 0;
        data.path = `/${input.slug || menu.slug}`;
      }
    }

    const updated = await this.prisma.menu.update({
      where: { id },
      data,
    });

    return this.addFinalUrl(updated);
  }

  async deleteMenu(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });

    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} not found`);
    }

    if (menu.isProtected) {
      throw new BadRequestException('Cannot delete protected menu');
    }

    await this.prisma.menu.delete({ where: { id } });
    return true;
  }

  async reorderMenus(items: { id: string; order: number }[]) {
    const updates = items.map(item =>
      this.prisma.menu.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await Promise.all(updates);
    return true;
  }

  // Helper: Build hierarchical menu tree
  private buildMenuTree(menus: any[], parentId: string | null = null): any[] {
    const tree = menus
      .filter(menu => menu.parentId === parentId)
      .map(menu => ({
        ...this.addFinalUrl(menu),
        children: this.buildMenuTree(menus, menu.id),
      }));

    return tree;
  }

  // Helper: Add final URL based on linkType
  private addFinalUrl(menu: any): any {
    let finalUrl = menu.url || menu.route || menu.externalUrl;

    if (menu.linkType) {
      switch (menu.linkType) {
        case 'PRODUCT_LIST':
          finalUrl = '/san-pham';
          if (menu.queryConditions) {
            const params = new URLSearchParams(menu.queryConditions).toString();
            finalUrl += `?${params}`;
          }
          break;

        case 'PRODUCT_DETAIL':
          if (menu.productId) {
            finalUrl = `/san-pham/${menu.productId}`;
          }
          break;

        case 'BLOG_LIST':
          finalUrl = '/bai-viet';
          if (menu.queryConditions) {
            const params = new URLSearchParams(menu.queryConditions).toString();
            finalUrl += `?${params}`;
          }
          break;

        case 'BLOG_DETAIL':
          if (menu.blogPostId) {
            finalUrl = `/bai-viet/${menu.blogPostId}`;
          }
          break;

        case 'PAGE':
          if (menu.pageId) {
            finalUrl = `/page/${menu.pageId}`;
          }
          break;

        case 'CATEGORY':
          if (menu.categoryId) {
            finalUrl = `/danh-muc/${menu.categoryId}`;
          }
          break;

        case 'BLOG_CATEGORY':
          if (menu.blogCategoryId) {
            finalUrl = `/bai-viet/danh-muc/${menu.blogCategoryId}`;
          }
          break;
      }
    }

    return { ...menu, finalUrl };
  }
}
