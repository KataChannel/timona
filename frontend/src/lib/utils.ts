import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert HTTP URLs to HTTPS to avoid mixed content issues
 * Only converts if current page is HTTPS
 */
export function ensureSecureUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Check if we're on HTTPS
  const isSecurePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  // If page is HTTPS and URL is HTTP, convert to HTTPS
  if (isSecurePage && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}

/**
 * Convert all image URLs in HTML content to HTTPS
 */
export function ensureSecureHtmlContent(html: string): string {
  if (!html) return '';
  
  // Check if we're on HTTPS
  const isSecurePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  if (!isSecurePage) return html;
  
  // Replace all http:// image src attributes with https://
  return html.replace(
    /(<img[^>]+src=["'])http:\/\//gi,
    '$1https://'
  );
}
