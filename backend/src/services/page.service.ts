import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreatePageInput, 
  UpdatePageInput, 
  PageFiltersInput, 
  BulkUpdateBlockOrderInput,
  CreatePageBlockInput,
  UpdatePageBlockInput
} from '../graphql/inputs/page.input';
import { Page, PageBlock, PaginatedPages, PagePaginationInfo, PageStatus } from '../graphql/models/page.model';
import { PaginationInput } from '../graphql/models/pagination.model';

@Injectable()
export class PageService {
  // Danh sách các slug được bảo vệ - không được phép tạo trong Page Builder
  private readonly RESERVED_SLUGS = [
    'bai-viet',
    'san-pham', 
    'gio-hang',
    'thanh-toan',
    'tai-khoan',
    'dang-nhap',
    'dang-ky',
    'quen-mat-khau',
    'admin',
    'api',
    'auth',
    'graphql',
    '_next',
    'static',
    'public',
    'images',
    'assets'
  ];

  constructor(private readonly prisma: PrismaService) {}

  // Helper function to convert block input to Prisma create format
  private convertBlocksToPrismaFormat(blocks: CreatePageBlockInput[]): any[] {
    return blocks.map((block, index) => {
      const { children, parentId, ...blockData } = block;
      
      const prismaBlock: any = {
        ...blockData,
        content: blockData.content || {},
        order: blockData.order ?? index,
        depth: blockData.depth ?? 0,
        config: blockData.config || null,
      };

      // Handle parent relationship
      if (parentId) {
        prismaBlock.parent = { connect: { id: parentId } };
      }

      // Recursively handle children
      if (children && children.length > 0) {
        prismaBlock.children = {
          create: this.convertBlocksToPrismaFormat(children)
        };
      }

      return prismaBlock;
    });
  }

  // Create a new page
  async create(input: CreatePageInput, userId: string): Promise<Page> {
    // Kiểm tra slug có nằm trong danh sách reserved không
    if (this.RESERVED_SLUGS.includes(input.slug)) {
      throw new BadRequestException(
        `Slug "${input.slug}" đã được hệ thống sử dụng. Vui lòng chọn slug khác.`
      );
    }

    // Check if slug already exists
    const existingPage = await this.prisma.page.findUnique({
      where: { slug: input.slug }
    });

    if (existingPage) {
      throw new ConflictException(`Page with slug "${input.slug}" already exists`);
    }

    const { blocks, ...pageData } = input;
    
    // Handle homepage setting - only one page can be homepage
    if (input.isHomepage === true) {
      // Reset all other pages' homepage flag
      await this.prisma.page.updateMany({
        where: { isHomepage: true },
        data: { isHomepage: false }
      });
    }
    
    const page = await this.prisma.page.create({
      data: {
        ...pageData,
        createdBy: userId,
        blocks: blocks && blocks.length > 0 ? {
          create: this.convertBlocksToPrismaFormat(blocks)
        } : undefined
      },
      include: {
        blocks: {
          where: { parentId: null }, // Only get root-level blocks
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                  include: {
                    children: true // Support up to 4 levels of nesting
                  }
                }
              }
            }
          }
        }
      }
    });

    return page as Page;
  }

  // Find many pages with filters and pagination
  async findMany(
    pagination: PaginationInput = { page: 1, limit: 10 },
    filters?: PageFiltersInput
  ): Promise<PaginatedPages> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Search across title and slug
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters?.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }
    
    if (filters?.slug) {
      where.slug = { contains: filters.slug, mode: 'insensitive' };
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          blocks: {
            where: { isVisible: true },
            orderBy: { order: 'asc' }
          }
        }
      }),
      this.prisma.page.count({ where })
    ]);

    return {
      items: pages as Page[],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    };
  }

  // Find page by ID
  async findById(id: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        blocks: {
          where: { parentId: null }, // Only get root-level blocks
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                  include: {
                    children: true // Support up to 4 levels of nesting
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    return page as Page;
  }

  // Find page by slug
  async findBySlug(slug: string): Promise<Page | null> {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: {
          where: { isVisible: true, parentId: null },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { order: 'asc' },
              include: {
                children: {
                  where: { isVisible: true },
                  orderBy: { order: 'asc' },
                  include: {
                    children: {
                      where: { isVisible: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Return null instead of throwing error for non-existent pages
    // This allows frontend to gracefully fallback to menu or 404
    if (!page) {
      return null;
    }

    return page as Page;
  }

  // Update page
  async update(id: string, input: UpdatePageInput, userId: string): Promise<Page> {
    const existingPage = await this.prisma.page.findUnique({
      where: { id },
      include: { blocks: true }
    });

    if (!existingPage) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    // Check slug uniqueness if updating slug
    if (input.slug && input.slug !== existingPage.slug) {
      // Kiểm tra slug có nằm trong danh sách reserved không
      if (this.RESERVED_SLUGS.includes(input.slug)) {
        throw new BadRequestException(
          `Slug "${input.slug}" đã được hệ thống sử dụng. Vui lòng chọn slug khác.`
        );
      }

      const slugExists = await this.prisma.page.findUnique({
        where: { slug: input.slug }
      });

      if (slugExists) {
        throw new ConflictException(`Page with slug "${input.slug}" already exists`);
      }
    }

    const { blocks, isHomepage, ...pageData } = input;

    // Handle homepage setting - only one page can be homepage
    let homepageUpdate = {};
    if (isHomepage !== undefined) {
      if (isHomepage === true) {
        // Reset all other pages' homepage flag
        await this.prisma.page.updateMany({
          where: {
            id: { not: id },
            isHomepage: true
          },
          data: { isHomepage: false }
        });
        homepageUpdate = { isHomepage: true };
      } else {
        homepageUpdate = { isHomepage: false };
      }
    }

    // Handle blocks update if provided
    let blocksUpdate = {};
    if (blocks) {
      // Delete existing blocks and create new ones
      blocksUpdate = {
        blocks: {
          deleteMany: {},
          create: blocks
            .filter(block => !block.id) // Only new blocks
            .map((block, index) => ({
              type: block.type!,
              content: block.content!,
              style: block.style,
              order: block.order ?? index,
              isVisible: block.isVisible ?? true
            }))
        }
      };

      // Update existing blocks
      const existingBlocksUpdate = blocks
        .filter(block => block.id)
        .map(block => 
          this.prisma.pageBlock.update({
            where: { id: block.id! },
            data: {
              type: block.type as any,
              content: block.content,
              style: block.style,
              order: block.order,
              isVisible: block.isVisible
            }
          })
        );

      await Promise.all(existingBlocksUpdate);
    }

    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: {
        ...pageData,
        ...homepageUpdate,
        updatedBy: userId,
        publishedAt: input.status === 'PUBLISHED' && existingPage.status !== 'PUBLISHED' 
          ? new Date() 
          : existingPage.publishedAt,
        ...blocksUpdate
      },
      include: {
        blocks: {
          where: { parentId: null }, // Only get root-level blocks
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                  include: {
                    children: true // Support up to 4 levels of nesting
                  }
                }
              }
            }
          }
        }
      }
    });

    return updatedPage as Page;
  }

  // Delete paDrop blocks here or click "Add Block" to add child blocksge
  async delete(id: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { blocks: true }
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    const deletedPage = await this.prisma.page.delete({
      where: { id },
      include: { blocks: true }
    });

    return deletedPage as Page;
  }

  // Add block to page
  async addBlock(pageId: string, input: CreatePageBlockInput): Promise<PageBlock> {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: { blocks: { where: { parentId: null } } } // Get top-level blocks only
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${pageId}" not found`);
    }

    // Remove children from input as we'll handle them separately
    const { children, parentId, ...blockData } = input;

    // Calculate order if not provided or if adding to root level
    let order = blockData.order;
    if (order === undefined || order === null) {
      // If no order provided, place at the end
      if (parentId) {
        // For nested blocks, get siblings
        const parent = await this.prisma.pageBlock.findUnique({
          where: { id: parentId },
          include: { children: true }
        });
        order = parent?.children?.length ?? 0;
      } else {
        // For top-level blocks, use page blocks count
        order = page.blocks?.length ?? 0;
      }
    }

    // Build the data object for Prisma create
    const createData: any = {
      ...blockData,
      order, // Ensure order is set
      content: blockData.content || {},
      page: { connect: { id: pageId } },
      depth: blockData.depth || 0,
      config: blockData.config || null,
    };

    // Handle parent relationship - use connect instead of parentId
    if (parentId) {
      createData.parent = { connect: { id: parentId } };
    }

    try {
      const block = await this.prisma.pageBlock.create({
        data: createData
      });
      return block as PageBlock;
    } catch (error: any) {
      // If unique constraint fails on order, recalculate order
      if (error.code === 'P2002' && error.meta?.target?.includes('order')) {
        // Get the latest block count to determine correct order
        const latestPage = await this.prisma.page.findUnique({
          where: { id: pageId },
          include: { blocks: { where: { parentId: input.parentId || null }, orderBy: { order: 'desc' }, take: 1 } }
        });

        const latestOrder = latestPage?.blocks?.[0]?.order ?? -1;
        createData.order = latestOrder + 1;

        // Retry with new order
        const block = await this.prisma.pageBlock.create({
          data: createData
        });
        return block as PageBlock;
      }

      throw error;
    }
  }

  // Update block
  async updateBlock(id: string, input: UpdatePageBlockInput): Promise<PageBlock> {
    const existingBlock = await this.prisma.pageBlock.findUnique({
      where: { id }
    });

    if (!existingBlock) {
      throw new NotFoundException(`Block with ID "${id}" not found`);
    }

    // Extract parentId from input and handle it separately
    const { parentId, ...updateData } = input;

    // Build the data object for Prisma update
    const prismaUpdateData: any = { ...updateData };

    // Handle parent relationship - use connect/disconnect instead of parentId
    if (parentId !== undefined) {
      if (parentId === null) {
        // Disconnect from parent (move to root level)
        prismaUpdateData.parent = { disconnect: true };
      } else {
        // Connect to new parent
        prismaUpdateData.parent = { connect: { id: parentId } };
      }
    }

    const updatedBlock = await this.prisma.pageBlock.update({
      where: { id },
      data: prismaUpdateData
    });

    return updatedBlock as PageBlock;
  }

  // Delete block
  async deleteBlock(id: string): Promise<PageBlock> {
    const block = await this.prisma.pageBlock.findUnique({
      where: { id }
    });

    if (!block) {
      throw new NotFoundException(`Block with ID "${id}" not found`);
    }

    const deletedBlock = await this.prisma.pageBlock.delete({
      where: { id }
    });

    return deletedBlock as PageBlock;
  }

  // Bulk update block order (for drag and drop)
  async updateBlocksOrder(pageId: string, updates: BulkUpdateBlockOrderInput[]): Promise<PageBlock[]> {
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: { blocks: true }
    });

    if (!page) {
      throw new NotFoundException(`Page with ID "${pageId}" not found`);
    }

    // Use transaction to handle order updates atomically
    // First, set all blocks to negative order values (temp) to avoid unique constraint conflicts
    // Then set to final order values
    const maxOrder = Math.max(...updates.map(u => u.order), 0);
    
    const updatedBlocks = await this.prisma.$transaction(
      updates.map((update, index) =>
        this.prisma.pageBlock.update({
          where: { id: update.id },
          data: { 
            // Use negative temporary order to avoid constraint conflicts
            order: -(maxOrder + index + 1)
          }
        })
      )
    );

    // Now update with final order values
    const finalUpdates = await this.prisma.$transaction(
      updates.map(update =>
        this.prisma.pageBlock.update({
          where: { id: update.id },
          data: { order: update.order }
        })
      )
    );

    return finalUpdates as PageBlock[];
  }

  // Get published pages for public access
  async findPublished(pagination?: PaginationInput): Promise<PaginatedPages> {
    return this.findMany(pagination, { status: PageStatus.PUBLISHED });
  }

  // Find homepage - the page marked as homepage
  async findHomepage(): Promise<Page | null> {
    const homepage = await this.prisma.page.findFirst({
      where: {
        isHomepage: true,
        status: PageStatus.PUBLISHED
      },
      include: {
        blocks: {
          where: { parentId: null }, // Only get root-level blocks
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                  include: {
                    children: true // Support up to 4 levels of nesting
                  }
                }
              }
            }
          }
        }
      }
    });

    return homepage as Page | null;
  }

  // 🆕 Find dynamic page template by slug pattern
  async findBySlugPattern(slugPattern: string): Promise<Page | null> {
    const page = await this.prisma.page.findFirst({
      where: {
        isDynamic: true,
        slug: slugPattern,
        status: PageStatus.PUBLISHED
      },
      include: {
        blocks: {
          where: { isVisible: true, parentId: null },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { order: 'asc' },
              include: {
                children: {
                  where: { isVisible: true },
                  orderBy: { order: 'asc' },
                  include: {
                    children: {
                      where: { isVisible: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return page as Page | null;
  }

  // Duplicate page
  async duplicate(id: string, userId: string, newTitle?: string, newSlug?: string): Promise<Page> {
    const originalPage = await this.findById(id);

    const duplicatedPage = await this.create({
      title: newTitle || `${originalPage.title} (Copy)`,
      slug: newSlug || `${originalPage.slug}-copy-${Date.now()}`,
      description: originalPage.description,
      content: originalPage.content,
      status: PageStatus.DRAFT, // Always create as draft
      seoTitle: originalPage.seoTitle,
      seoDescription: originalPage.seoDescription,
      ogImage: originalPage.ogImage,
      blocks: originalPage.blocks.map(block => ({
        type: block.type,
        content: block.content,
        style: block.style,
        order: block.order,
        isVisible: block.isVisible
      }))
    }, userId);

    return duplicatedPage;
  }

  // Get list of reserved slugs (useful for frontend validation)
  getReservedSlugs(): string[] {
    return [...this.RESERVED_SLUGS];
  }

  // Check if slug is reserved
  isSlugReserved(slug: string): boolean {
    return this.RESERVED_SLUGS.includes(slug);
  }
}