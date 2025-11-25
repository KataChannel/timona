'use client';

import React, { lazy, Suspense } from 'react';
import { BlockType } from '@/types/page-builder';
import BlockErrorBoundary from '../BlockErrorBoundary';

/**
 * Lazy-loaded block components
 * Imported dynamically to reduce initial bundle size
 */
const TextBlock = lazy(() => import('./TextBlock').then(m => ({ default: m.TextBlock })));
const RichTextBlock = lazy(() => import('./RichTextBlock').then(m => ({ default: m.default })));
const ImageBlock = lazy(() => import('./ImageBlock').then(m => ({ default: m.ImageBlock })));
const HeroBlock = lazy(() => import('./HeroBlock').then(m => ({ default: m.HeroBlock })));
const ButtonBlock = lazy(() => import('./ButtonBlock').then(m => ({ default: m.ButtonBlock })));
const DividerBlock = lazy(() => import('./DividerBlock').then(m => ({ default: m.DividerBlock })));
const SpacerBlock = lazy(() => import('./SpacerBlock').then(m => ({ default: m.SpacerBlock })));
const TeamBlock = lazy(() => import('./TeamBlock').then(m => ({ default: m.TeamBlock })));
const StatsBlock = lazy(() => import('./StatsBlock').then(m => ({ default: m.StatsBlock })));
const ContactInfoBlock = lazy(() => import('./ContactInfoBlock').then(m => ({ default: m.ContactInfoBlock })));
const ContainerBlock = lazy(() => import('./ContainerBlock').then(m => ({ default: m.ContainerBlock })));
const SectionBlock = lazy(() => import('./SectionBlock').then(m => ({ default: m.SectionBlock })));
const GridBlock = lazy(() => import('./GridBlock').then(m => ({ default: m.GridBlock })));
const FlexBlock = lazy(() => import('./FlexBlock').then(m => ({ default: m.FlexBlock })));
const DynamicBlock = lazy(() => import('./DynamicBlock').then(m => ({ default: m.DynamicBlock })));
const CarouselBlock = lazy(() => import('./CarouselBlock').then(m => ({ default: m.CarouselBlock })));
const ProductListBlock = lazy(() => import('./ProductListBlock').then(m => ({ default: m.ProductListBlock })));
const ProductDetailBlock = lazy(() => import('./ProductDetailBlock').then(m => ({ default: m.ProductDetailBlock })));
const ProductCarouselBlock = lazy(() => import('./ProductCarouselBlock').then(m => ({ default: m.ProductCarouselBlock })));
const BlogCarouselBlock = lazy(() => import('./BlogCarouselBlock').then(m => ({ default: m.BlogCarouselBlock })));
const VideoBlock = lazy(() => import('./VideoBlock').then(m => ({ default: m.VideoBlock })));
const SearchBlock = lazy(() => import('./SearchBlock').then(m => ({ default: m.SearchBlock })));
const BookmarkBlock = lazy(() => import('./BookmarkBlock').then(m => ({ default: m.BookmarkBlock })));

/**
 * Block component map for lazy loading
 * Mapped by BlockType enum string values ('TEXT', 'IMAGE', etc.)
 */
export const LAZY_BLOCK_COMPONENTS: Record<BlockType | string, React.ComponentType<any>> = {
  // Content Blocks
  [BlockType.TEXT]: TextBlock,
  [BlockType.RICH_TEXT]: RichTextBlock,
  [BlockType.IMAGE]: ImageBlock,
  [BlockType.VIDEO]: VideoBlock,
  [BlockType.CAROUSEL]: CarouselBlock,
  [BlockType.HERO]: HeroBlock,
  [BlockType.BUTTON]: ButtonBlock,
  [BlockType.DIVIDER]: DividerBlock,
  [BlockType.SPACER]: SpacerBlock,
  [BlockType.TEAM]: TeamBlock,
  [BlockType.STATS]: StatsBlock,
  [BlockType.CONTACT_INFO]: ContactInfoBlock,
  [BlockType.GALLERY]: ImageBlock,             // Fallback: uses ImageBlock
  [BlockType.CARD]: TextBlock,                 // Fallback: uses TextBlock
  [BlockType.TESTIMONIAL]: TextBlock,          // Fallback: uses TextBlock
  [BlockType.FAQ]: TextBlock,                  // Fallback: uses TextBlock
  [BlockType.CONTACT_FORM]: TextBlock,         // Fallback: uses TextBlock
  [BlockType.COMPLETED_TASKS]: TextBlock,      // Fallback: uses TextBlock
  [BlockType.SEARCH]: SearchBlock,
  [BlockType.BOOKMARK]: BookmarkBlock,
  
  // Container/Layout Blocks
  [BlockType.CONTAINER]: ContainerBlock,
  [BlockType.SECTION]: SectionBlock,
  [BlockType.GRID]: GridBlock,
  [BlockType.FLEX_ROW]: FlexBlock,
  [BlockType.FLEX_COLUMN]: FlexBlock,
  [BlockType.COLUMN]: FlexBlock,               // Fallback: uses FlexBlock
  [BlockType.ROW]: FlexBlock,                  // Fallback: uses FlexBlock
  
  // Dynamic Block
  [BlockType.DYNAMIC]: DynamicBlock,
  
  // E-commerce Blocks
  [BlockType.PRODUCT_LIST]: ProductListBlock,
  [BlockType.PRODUCT_DETAIL]: ProductDetailBlock,
  [BlockType.PRODUCT_CAROUSEL]: ProductCarouselBlock,
  
  // Blog Blocks
  [BlockType.BLOG_CAROUSEL]: BlogCarouselBlock,
};

/**
 * Block loading skeleton
 */
export const BlockSkeleton: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <div className="animate-pulse bg-gray-200 rounded" style={{ height }} />
);

/**
 * Get block component by type
 * Returns lazy-loaded component or placeholder
 * Supports BlockType string values ('TEXT', 'IMAGE', etc.)
 */
export function getBlockComponent(blockType: BlockType | string) {
  if (!blockType) return null;
  
  // Normalize to uppercase in case of case mismatch
  const normalizedType = typeof blockType === 'string' ? blockType.toUpperCase() : blockType;
  
  return LAZY_BLOCK_COMPONENTS[normalizedType] || null;
}

/**
 * Block Loader Component Props
 */
export interface BlockLoaderProps {
  blockType: BlockType | string;
  blockId: string;
  props: any;
  skeletonHeight?: string;
}

/**
 * Block Loader Component
 * Handles lazy loading, suspense, and error boundaries for blocks
 */
export const BlockLoader: React.FC<BlockLoaderProps> = ({
  blockType,
  blockId,
  props,
  skeletonHeight = '200px',
}) => {
  const Component = getBlockComponent(blockType);

  if (!Component) {
    console.error(`[BlockLoader] Unknown block type: ${blockType} (type: ${typeof blockType}, blockId: ${blockId})`);
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-600 rounded">
        Unknown block type: {blockType}
      </div>
    );
  }

  return (
    <BlockErrorBoundary blockId={blockId}>
      <Suspense fallback={<BlockSkeleton height={skeletonHeight} />}>
        <Component {...props} />
      </Suspense>
    </BlockErrorBoundary>
  );
};

export default BlockLoader;
