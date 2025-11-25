import { BlockType } from '@/types/page-builder';
import {
  Type,
  Image,
  Layout,
  Square,
  Users,
  TrendingUp,
  Phone,
  Minus,
  Space,
  Box,
  Columns,
  Grid3x3,
  ArrowRightLeft,
  ArrowUpDown,
  Code,
  Presentation,
  Search,
  Bookmark,
  Video,
  Share2,
  LayoutGrid,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Mail,
  Zap,
  ShoppingCart,
  Newspaper,
} from 'lucide-react';

/**
 * Block Type Definitions - Single Source of Truth
 * Used across all PageBuilder components
 * 
 * IMPORTANT: Keep this synchronized with BlockType enum in types/page-builder.ts
 */
export const BLOCK_TYPES = [
  // Content Blocks
  { type: BlockType.TEXT, label: 'Text Block', icon: Type, color: 'bg-blue-100 text-blue-600' },
  { type: BlockType.IMAGE, label: 'Image Block', icon: Image, color: 'bg-green-100 text-green-600' },
  { type: BlockType.VIDEO, label: 'Video', icon: Video, color: 'bg-rose-100 text-rose-600' },
  { type: BlockType.BUTTON, label: 'Button', icon: Square, color: 'bg-orange-100 text-orange-600' },
  { type: BlockType.HERO, label: 'Hero Section', icon: Layout, color: 'bg-purple-100 text-purple-600' },
  { type: BlockType.CAROUSEL, label: 'Carousel', icon: Presentation, color: 'bg-teal-100 text-teal-600' },
  { type: BlockType.GALLERY, label: 'Gallery', icon: LayoutGrid, color: 'bg-cyan-100 text-cyan-600' },
  { type: BlockType.CARD, label: 'Card', icon: Box, color: 'bg-violet-100 text-violet-600' },
  { type: BlockType.TESTIMONIAL, label: 'Testimonial', icon: MessageSquare, color: 'bg-fuchsia-100 text-fuchsia-600' },
  { type: BlockType.TEAM, label: 'Team Section', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
  { type: BlockType.STATS, label: 'Stats Section', icon: BarChart3, color: 'bg-emerald-100 text-emerald-600' },
  { type: BlockType.FAQ, label: 'FAQ', icon: HelpCircle, color: 'bg-sky-100 text-sky-600' },
  { type: BlockType.CONTACT_FORM, label: 'Contact Form', icon: Mail, color: 'bg-amber-100 text-amber-600' },
  { type: BlockType.CONTACT_INFO, label: 'Contact Info', icon: Phone, color: 'bg-cyan-100 text-cyan-600' },

  // Container/Layout Blocks
  { type: BlockType.CONTAINER, label: 'Container', icon: Box, color: 'bg-violet-100 text-violet-600' },
  { type: BlockType.SECTION, label: 'Section', icon: Columns, color: 'bg-fuchsia-100 text-fuchsia-600' },
  { type: BlockType.GRID, label: 'Grid Layout', icon: Grid3x3, color: 'bg-pink-100 text-pink-600' },
  { type: BlockType.FLEX_ROW, label: 'Flex Row', icon: ArrowRightLeft, color: 'bg-rose-100 text-rose-600' },
  { type: BlockType.FLEX_COLUMN, label: 'Flex Column', icon: ArrowUpDown, color: 'bg-amber-100 text-amber-600' },

  // Utility Blocks
  { type: BlockType.DIVIDER, label: 'Divider', icon: Minus, color: 'bg-gray-100 text-gray-600' },
  { type: BlockType.SPACER, label: 'Spacer', icon: Space, color: 'bg-yellow-100 text-yellow-600' },

  // Dynamic & E-commerce
  { type: BlockType.DYNAMIC, label: 'Dynamic Block', icon: Code, color: 'bg-purple-100 text-purple-600' },
  { type: BlockType.PRODUCT_LIST, label: 'Product List', icon: ShoppingCart, color: 'bg-green-100 text-green-600' },
  { type: BlockType.PRODUCT_CAROUSEL, label: 'Product Carousel', icon: Zap, color: 'bg-blue-100 text-blue-600' },
  
  // Blog Blocks
  { type: BlockType.BLOG_CAROUSEL, label: 'Blog Carousel', icon: Newspaper, color: 'bg-indigo-100 text-indigo-600' },
];

/**
 * Utility function to get block type configuration
 */
export function getBlockTypeConfig(type: BlockType) {
  return BLOCK_TYPES.find(b => b.type === type);
}

/**
 * Get all block type labels as a record
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = Object.fromEntries(
  BLOCK_TYPES.map(b => [b.type, b.label])
) as Record<BlockType, string>;

/**
 * Group block types by category for UI organization
 */
export const BLOCK_TYPE_GROUPS = [
  {
    category: 'Content Blocks',
    blocks: BLOCK_TYPES.filter(b => 
      [
        BlockType.TEXT, BlockType.IMAGE, BlockType.VIDEO, BlockType.BUTTON, BlockType.HERO, 
        BlockType.CAROUSEL, BlockType.GALLERY, BlockType.CARD, BlockType.TESTIMONIAL, 
        BlockType.TEAM, BlockType.STATS, BlockType.FAQ, BlockType.CONTACT_FORM, 
        BlockType.CONTACT_INFO
      ].includes(b.type)
    )
  },
  {
    category: 'Container & Layout',
    blocks: BLOCK_TYPES.filter(b => 
      [BlockType.SECTION, BlockType.CONTAINER, BlockType.GRID, BlockType.FLEX_ROW, BlockType.FLEX_COLUMN].includes(b.type)
    )
  },
  {
    category: 'Utility Blocks',
    blocks: BLOCK_TYPES.filter(b => 
      [BlockType.DIVIDER, BlockType.SPACER].includes(b.type)
    )
  },
  {
    category: 'Dynamic & E-commerce',
    blocks: BLOCK_TYPES.filter(b => 
      [BlockType.DYNAMIC, BlockType.PRODUCT_LIST, BlockType.PRODUCT_CAROUSEL].includes(b.type)
    )
  },
  {
    category: 'Blog Blocks',
    blocks: BLOCK_TYPES.filter(b => 
      [BlockType.BLOG_CAROUSEL].includes(b.type)
    )
  },
];
