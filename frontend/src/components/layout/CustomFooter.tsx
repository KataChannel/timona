'use client';

import { FooterProps } from '@/types/layout';
import {
  DefaultFooter,
  MinimalFooter,
  ExtendedFooter,
  NewsletterFooter,
} from './footers';

/**
 * Footer Factory Component
 * Renders the appropriate footer variant based on props
 */
export function CustomFooter(props: FooterProps) {
  const variant = props.variant || 'default';

  switch (variant) {
    case 'minimal':
      return <MinimalFooter {...props} />;
    case 'extended':
      return <ExtendedFooter {...props} />;
    case 'newsletter':
      return <NewsletterFooter {...props} />;
    case 'default':
    default:
      return <DefaultFooter {...props} />;
  }
}
