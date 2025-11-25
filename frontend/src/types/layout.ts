/**
 * Layout Component Types - Header & Footer Customization
 */

export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  children?: MenuItem[];
}

export interface SocialLink {
  platform: 'github' | 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'youtube';
  url: string;
}

export interface BrandConfig {
  name: string;
  logo?: string;
  tagline?: string;
}

/**
 * Header Customization Props
 */
export interface HeaderProps {
  variant?: 'default' | 'minimal' | 'centered' | 'mega';
  brand?: BrandConfig;
  menuItems?: MenuItem[];
  showSearch?: boolean;
  showCart?: boolean;
  showAuth?: boolean;
  backgroundColor?: string;
  textColor?: string;
  logoPosition?: 'left' | 'center';
  ctaButton?: {
    text: string;
    href: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  sticky?: boolean;
  transparent?: boolean;
}

/**
 * Footer Customization Props
 */
export interface FooterProps {
  variant?: 'default' | 'minimal' | 'extended' | 'newsletter';
  brand?: BrandConfig;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  backgroundColor?: string;
  textColor?: string;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
}

export interface FooterColumn {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

/**
 * Layout Settings in Page
 */
export interface PageLayoutConfig {
  header?: {
    show: boolean;
    variant?: string;
    props?: Partial<HeaderProps>;
  };
  footer?: {
    show: boolean;
    variant?: string;
    props?: Partial<FooterProps>;
  };
}
