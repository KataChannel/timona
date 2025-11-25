'use client';

import { HeaderProps } from '@/types/layout';
import {
  DefaultHeader,
  MinimalHeader,
  CenteredHeader,
  MegaHeader,
} from './headers';

/**
 * Header Factory Component
 * Renders the appropriate header variant based on props
 */
export function CustomHeader(props: HeaderProps) {
  const variant = props.variant || 'default';

  switch (variant) {
    case 'minimal':
      return <MinimalHeader {...props} />;
    case 'centered':
      return <CenteredHeader {...props} />;
    case 'mega':
      return <MegaHeader {...props} />;
    case 'default':
    default:
      return <DefaultHeader {...props} />;
  }
}
