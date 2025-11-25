import { redirect } from 'next/navigation';
import HomepageWrapper from './HomepageWrapper';

// GraphQL query for settings
const GET_HOMEPAGE_SETTINGS_QUERY = `
  query GetPublicHomepage {
    publicWebsiteSettings(keys: ["site.homepage_url"]) {
      key
      value
    }
  }
`;

// Fetch homepage redirect setting
async function getHomepageRedirect(): Promise<string | null> {
  try {
    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:13001/graphql';
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_HOMEPAGE_SETTINGS_QUERY,
      }),
      cache: 'no-store', // Don't cache redirect setting
    });

    const { data } = await response.json();
    const settings = data?.publicWebsiteSettings || [];
    const homepageSetting = settings.find((s: any) => s.key === 'site.homepage_url');
    const homepageUrl = homepageSetting?.value?.trim();

    // Only redirect if homepage_url is set and not "/" or empty
    if (homepageUrl && homepageUrl !== '' && homepageUrl !== '/') {
      return homepageUrl;
    }

    return null;
  } catch (error) {
    console.error('[Homepage Redirect] Error fetching setting:', error);
    return null;
  }
}

export default async function WebsitePage() {
  // Check for homepage redirect FIRST
  const redirectUrl = await getHomepageRedirect();
  if (redirectUrl) {
    console.log(`[Homepage] Redirecting to: ${redirectUrl}`);
    redirect(redirectUrl);
  }

  // If no redirect, render the homepage content (client component)
  return <HomepageWrapper />;
}
