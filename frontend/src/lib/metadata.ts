import { Metadata } from 'next';

/**
 * Fetch SEO settings from backend API
 */
async function fetchSEOSettings(): Promise<Record<string, string>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3000'}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetSEOSettings {
              websiteSettings(
                category: "SEO"
                isActive: true
              ) {
                key
                value
              }
            }
          `,
        }),
        cache: 'no-store', // Always fetch fresh data for metadata
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch SEO settings:', response.statusText);
      return {};
    }

    const result = await response.json();
    const settings = result?.data?.websiteSettings || [];

    // Convert array to key-value map
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting: { key: string; value: string }) => {
      // Remove 'seo.' prefix from key for easier access
      const key = setting.key.replace('seo.', '');
      settingsMap[key] = setting.value;
    });

    return settingsMap;
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return {};
  }
}

/**
 * Generate dynamic metadata from database settings
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSEOSettings();

  // Fallback values
  const siteName = seo.site_name || 'Site Name';
  const metaTitle = seo.meta_title || 'Site Name - Tagline';
  const metaDescription = seo.meta_description || 'Site Name - Description';
  const keywords = seo.keywords?.split(',').map(k => k.trim()) || [];
  const author = seo.author || 'author';
  
  // Open Graph
  const ogTitle = seo.og_title || siteName;
  const ogDescription = seo.og_description || metaDescription;
  const ogImage = seo.og_image || '/og-image.png';
  const ogType = seo.og_type || 'website';
  const ogLocale = seo.og_locale || 'vi_VN';
  
  // Twitter
  const twitterCard = (seo.twitter_card || 'summary_large_image') as 'summary' | 'summary_large_image' | 'app' | 'player';
  const twitterTitle = seo.twitter_title || ogTitle;
  const twitterDescription = seo.twitter_description || ogDescription;
  const twitterImage = seo.twitter_image || ogImage;
  const twitterSite = seo.twitter_site || '@twitterSite';
  
  // Robots
  const robotsIndex = seo.robots_index !== 'false';
  const robotsFollow = seo.robots_follow !== 'false';
  
  // Icons
  const iconFavicon = seo.icon_favicon || '/favicon.ico';
  const iconShortcut = seo.icon_shortcut || '/favicon-16x16.png';
  const iconApple = seo.icon_apple || '/apple-touch-icon.png';

  const metadata: Metadata = {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: metaDescription,
    keywords,
    authors: [{ name: author }],
    creator: author,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:13000'),
    openGraph: {
      type: ogType as any,
      locale: ogLocale,
      url: '/',
      title: ogTitle,
      description: ogDescription,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
      site: twitterSite,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    manifest: '/manifest.json',
    icons: {
      icon: iconFavicon,
      shortcut: iconShortcut,
      apple: iconApple,
    },
  };

  return metadata;
}
