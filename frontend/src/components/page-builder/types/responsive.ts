/**
 * Responsive Styling System
 * 
 * Handles device-specific styles with inheritance cascade:
 * Desktop → Tablet → Mobile
 */

export type Device = 'desktop' | 'tablet' | 'mobile';

export interface ResponsiveValue<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

/**
 * Style settings that can be responsive
 */
export interface ResponsiveStyleSettings {
  // Typography
  fontFamily?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<number>;
  fontWeight?: ResponsiveValue<number>;
  lineHeight?: ResponsiveValue<number>;
  letterSpacing?: ResponsiveValue<number>;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  textTransform?: ResponsiveValue<'none' | 'uppercase' | 'lowercase' | 'capitalize'>;
  textDecoration?: ResponsiveValue<'none' | 'underline' | 'line-through'>;

  // Colors
  textColor?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  borderColor?: ResponsiveValue<string>;
  opacity?: ResponsiveValue<number>;

  // Spacing
  margin?: ResponsiveValue<{ top: number; right: number; bottom: number; left: number }>;
  padding?: ResponsiveValue<{ top: number; right: number; bottom: number; left: number }>;
  gap?: ResponsiveValue<number>;

  // Border
  borderWidth?: ResponsiveValue<number>;
  borderStyle?: ResponsiveValue<'none' | 'solid' | 'dashed' | 'dotted' | 'double'>;
  borderRadius?: ResponsiveValue<{ topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }>;

  // Background
  background?: ResponsiveValue<{
    type: 'color' | 'gradient' | 'image';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      angle?: number;
    };
    image?: {
      url: string;
      size: 'cover' | 'contain' | 'auto';
      position: 'center' | 'top' | 'bottom' | 'left' | 'right';
      repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
      overlay?: { color: string; opacity: number };
    };
  }>;

  // Shadow
  boxShadow?: ResponsiveValue<{
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    inset: boolean;
  }>;
  textShadow?: ResponsiveValue<{
    x: number;
    y: number;
    blur: number;
    color: string;
  }>;

  // Visibility
  display?: ResponsiveValue<boolean>; // true = visible, false = hidden
}

/**
 * Merge responsive values with inheritance cascade
 * 
 * @example
 * mergeResponsiveValue(
 *   { desktop: 24, tablet: 18 },
 *   'mobile'
 * ) // Returns: 18 (inherits from tablet)
 */
export function mergeResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  device: Device,
  defaultValue?: T
): T | undefined {
  if (!value) return defaultValue;

  // Direct device value
  if (value[device] !== undefined) {
    return value[device];
  }

  // Cascade: mobile inherits from tablet, then desktop
  if (device === 'mobile') {
    if (value.tablet !== undefined) return value.tablet;
    if (value.desktop !== undefined) return value.desktop;
  }

  // Cascade: tablet inherits from desktop
  if (device === 'tablet') {
    if (value.desktop !== undefined) return value.desktop;
  }

  return defaultValue;
}

/**
 * Merge all responsive style settings for a specific device
 */
export function mergeResponsiveStyles(
  styles: ResponsiveStyleSettings,
  device: Device
): Record<string, any> {
  const merged: Record<string, any> = {};

  // Typography
  const fontFamily = mergeResponsiveValue(styles.fontFamily, device);
  if (fontFamily) merged.fontFamily = fontFamily;

  const fontSize = mergeResponsiveValue(styles.fontSize, device);
  if (fontSize) merged.fontSize = fontSize;

  const fontWeight = mergeResponsiveValue(styles.fontWeight, device);
  if (fontWeight) merged.fontWeight = fontWeight;

  const lineHeight = mergeResponsiveValue(styles.lineHeight, device);
  if (lineHeight) merged.lineHeight = lineHeight;

  const letterSpacing = mergeResponsiveValue(styles.letterSpacing, device);
  if (letterSpacing) merged.letterSpacing = letterSpacing;

  const textAlign = mergeResponsiveValue(styles.textAlign, device);
  if (textAlign) merged.textAlign = textAlign;

  const textTransform = mergeResponsiveValue(styles.textTransform, device);
  if (textTransform) merged.textTransform = textTransform;

  const textDecoration = mergeResponsiveValue(styles.textDecoration, device);
  if (textDecoration) merged.textDecoration = textDecoration;

  // Colors
  const textColor = mergeResponsiveValue(styles.textColor, device);
  if (textColor) merged.textColor = textColor;

  const backgroundColor = mergeResponsiveValue(styles.backgroundColor, device);
  if (backgroundColor) merged.backgroundColor = backgroundColor;

  const borderColor = mergeResponsiveValue(styles.borderColor, device);
  if (borderColor) merged.borderColor = borderColor;

  const opacity = mergeResponsiveValue(styles.opacity, device);
  if (opacity !== undefined) merged.opacity = opacity;

  // Spacing
  const margin = mergeResponsiveValue(styles.margin, device);
  if (margin) merged.margin = margin;

  const padding = mergeResponsiveValue(styles.padding, device);
  if (padding) merged.padding = padding;

  const gap = mergeResponsiveValue(styles.gap, device);
  if (gap !== undefined) merged.gap = gap;

  // Border
  const borderWidth = mergeResponsiveValue(styles.borderWidth, device);
  if (borderWidth !== undefined) merged.borderWidth = borderWidth;

  const borderStyle = mergeResponsiveValue(styles.borderStyle, device);
  if (borderStyle) merged.borderStyle = borderStyle;

  const borderRadius = mergeResponsiveValue(styles.borderRadius, device);
  if (borderRadius) merged.borderRadius = borderRadius;

  // Background
  const background = mergeResponsiveValue(styles.background, device);
  if (background) merged.background = background;

  // Shadow
  const boxShadow = mergeResponsiveValue(styles.boxShadow, device);
  if (boxShadow) merged.boxShadow = boxShadow;

  const textShadow = mergeResponsiveValue(styles.textShadow, device);
  if (textShadow) merged.textShadow = textShadow;

  // Visibility
  const display = mergeResponsiveValue(styles.display, device);
  if (display !== undefined) merged.display = display;

  return merged;
}

/**
 * Check if a responsive value has device-specific overrides
 */
export function hasResponsiveOverride<T>(
  value: ResponsiveValue<T> | undefined,
  device: Device
): boolean {
  if (!value) return false;
  return value[device] !== undefined;
}

/**
 * Get all devices that have specific values (not inherited)
 */
export function getDefinedDevices<T>(value: ResponsiveValue<T> | undefined): Device[] {
  if (!value) return [];
  const devices: Device[] = [];
  if (value.desktop !== undefined) devices.push('desktop');
  if (value.tablet !== undefined) devices.push('tablet');
  if (value.mobile !== undefined) devices.push('mobile');
  return devices;
}

/**
 * Update a responsive value for a specific device
 */
export function updateResponsiveValue<T>(
  current: ResponsiveValue<T> | undefined,
  device: Device,
  newValue: T | undefined
): ResponsiveValue<T> {
  const updated = { ...current };
  
  if (newValue === undefined) {
    // Remove device-specific value
    delete updated[device];
  } else {
    // Set device-specific value
    updated[device] = newValue;
  }
  
  return updated;
}

/**
 * Clear all device-specific overrides (use base value for all devices)
 */
export function clearResponsiveOverrides<T>(
  value: ResponsiveValue<T> | undefined,
  baseDevice: Device = 'desktop'
): T | undefined {
  if (!value) return undefined;
  return value[baseDevice];
}

/**
 * Device breakpoints (for reference)
 */
export const BREAKPOINTS = {
  mobile: { max: 767 }, // 0-767px
  tablet: { min: 768, max: 1023 }, // 768-1023px
  desktop: { min: 1024 }, // 1024px+
} as const;

/**
 * Get device from window width
 */
export function getDeviceFromWidth(width: number): Device {
  if (width < BREAKPOINTS.tablet.min) return 'mobile';
  if (width < BREAKPOINTS.desktop.min) return 'tablet';
  return 'desktop';
}
