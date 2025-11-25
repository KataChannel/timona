/**
 * PageBuilder Template System - Type Definitions
 * Phase 5.1: Template Data Layer
 */

import { ResponsiveValue } from '@/components/page-builder/types/responsive';

// ============================================================================
// Template Categories
// ============================================================================

export type TemplateCategory = 
  | 'all'
  | 'landing'
  | 'blog'
  | 'ecommerce'
  | 'portfolio'
  | 'marketing'
  | 'custom';

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All Templates' },
  { value: 'landing', label: 'Landing Pages' },
  { value: 'blog', label: 'Blog & Content' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'custom', label: 'My Templates' },
];

// ============================================================================
// Element Styles (All responsive-aware)
// ============================================================================

export interface TypographySettings {
  fontSize?: number | ResponsiveValue<number>;
  fontWeight?: number | ResponsiveValue<number>;
  lineHeight?: number | ResponsiveValue<number>;
  letterSpacing?: number | ResponsiveValue<number>;
  textAlign?: ('left' | 'center' | 'right' | 'justify') | ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  fontFamily?: string | ResponsiveValue<string>;
  fontStyle?: ('normal' | 'italic') | ResponsiveValue<'normal' | 'italic'>;
  textTransform?: ('none' | 'uppercase' | 'lowercase' | 'capitalize') | ResponsiveValue<'none' | 'uppercase' | 'lowercase' | 'capitalize'>;
}

export interface ColorSettings {
  textColor?: string | ResponsiveValue<string>;
  backgroundColor?: string | ResponsiveValue<string>;
  borderColor?: string | ResponsiveValue<string>;
  opacity?: number | ResponsiveValue<number>;
}

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingSettings {
  margin?: SpacingValue | ResponsiveValue<SpacingValue>;
  padding?: SpacingValue | ResponsiveValue<SpacingValue>;
  gap?: number | ResponsiveValue<number>;
}

export interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface BorderSettings {
  width?: number | ResponsiveValue<number>;
  style?: ('solid' | 'dashed' | 'dotted' | 'double' | 'none') | ResponsiveValue<'solid' | 'dashed' | 'dotted' | 'double' | 'none'>;
  color?: string | ResponsiveValue<string>;
  radius?: BorderRadius | ResponsiveValue<BorderRadius>;
}

export interface GradientValue {
  type: 'linear' | 'radial';
  colors: string[];
  angle: number;
}

export interface ImageValue {
  url: string;
  size: 'cover' | 'contain' | 'auto';
  position: string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
}

export interface OverlayValue {
  color: string;
  opacity: number;
}

export interface BackgroundSettings {
  type?: ('color' | 'gradient' | 'image') | ResponsiveValue<'color' | 'gradient' | 'image'>;
  color?: string | ResponsiveValue<string>;
  gradient?: GradientValue | ResponsiveValue<GradientValue>;
  image?: ImageValue | ResponsiveValue<ImageValue>;
  overlay?: OverlayValue | ResponsiveValue<OverlayValue>;
}

export interface BoxShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface TextShadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export interface ShadowSettings {
  boxShadow?: BoxShadow | ResponsiveValue<BoxShadow>;
  textShadow?: TextShadow | ResponsiveValue<TextShadow>;
}

// ============================================================================
// Element Structure
// ============================================================================

export interface ElementStyles {
  typography?: TypographySettings;
  color?: ColorSettings;
  spacing?: SpacingSettings;
  border?: BorderSettings;
  background?: BackgroundSettings;
  shadow?: ShadowSettings;
}

export interface PageElement {
  id: string;
  type: string; // 'heading', 'paragraph', 'button', 'image', 'container', etc.
  content?: string; // Text content for text elements
  styles?: ElementStyles;
  children?: PageElement[];
  props?: Record<string, any>; // Additional element-specific props
}

// ============================================================================
// Global Page Styles
// ============================================================================

export interface GlobalStyles {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  textColor?: string;
  backgroundColor?: string;
  maxWidth?: number;
  padding?: SpacingValue;
}

// ============================================================================
// Template Definition
// ============================================================================

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string; // Base64 encoded image or URL
  structure: PageElement[]; // Root-level elements
  styles?: GlobalStyles; // Global page styles
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  author?: string;
  tags?: string[];
  isDefault?: boolean; // True for pre-made templates (cannot be deleted)
  version?: string; // Template version for compatibility
}

// ============================================================================
// Template Metadata (for list display)
// ============================================================================

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  elementCount?: number; // Number of elements in template
}

// ============================================================================
// Template Operations
// ============================================================================

export interface TemplateFilter {
  category?: TemplateCategory;
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'date' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateExport {
  template: PageTemplate;
  exportedAt: string;
  exportedBy?: string;
  version: string; // Export format version
}

export interface ImportTemplateData {
  template: PageTemplate;
  replaceExisting?: boolean;
}

export interface TemplateImportResult {
  success: boolean;
  template?: PageTemplate;
  error?: string;
  warnings?: string[];
}

// ============================================================================
// Template Storage
// ============================================================================

export interface TemplateStorage {
  templates: PageTemplate[];
  lastModified: string;
  version: string; // Storage schema version
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface TemplateValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: string[];
}
