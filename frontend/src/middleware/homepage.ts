import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle custom homepage
 * Redirects root path (/) to custom homepage URL if configured
 */
export async function homepageMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Homepage Middleware] Processing:', pathname);

  // Only process root path
  if (pathname !== '/') {
    return NextResponse.next();
  }

  console.log('[Homepage Middleware] Root path detected, checking for redirect...');

  try {
    // Check custom homepage URL by calling GraphQL API
    // HARDCODED FOR TESTING: Force to use port 13001
    const graphqlUrl = 'http://localhost:13001/graphql';
    
    console.log('[Homepage Middleware] GraphQL URL:', graphqlUrl);
    console.log('[Homepage Middleware] Fetching settings from GraphQL...');
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - use public query
      },
      body: JSON.stringify({
        query: `
          query GetPublicHomepage {
            publicWebsiteSettings(keys: ["site.homepage_url"]) {
              key
              value
            }
          }
        `,
      }),
      // Don't cache this request
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch homepage settings');
      return NextResponse.next();
    }

    const { data, errors } = await response.json();
    
    if (errors) {
      console.error('GraphQL errors:', errors);
      return NextResponse.next();
    }

    const settings = data?.publicWebsiteSettings || [];

    console.log('[Homepage Middleware] Settings fetched:', settings);

    // Find homepage setting
    const homepageSetting = settings.find((s: any) => s.key === 'site.homepage_url');
    const homepageUrl = homepageSetting?.value?.trim();

    console.log('[Homepage Middleware] Homepage URL:', homepageUrl);
    console.log('[Homepage Middleware] Homepage URL type:', typeof homepageUrl);
    console.log('[Homepage Middleware] Homepage URL length:', homepageUrl?.length);
    console.log('[Homepage Middleware] Checking conditions:');
    console.log('  - !homepageUrl:', !homepageUrl);
    console.log('  - homepageUrl === "":', homepageUrl === '');
    console.log('  - homepageUrl === "/":', homepageUrl === '/');

    // Logic: Nếu có giá trị homepage_url (khác null, undefined, empty, hoặc "/")
    // thì redirect về URL đó
    if (!homepageUrl || homepageUrl === '' || homepageUrl === '/') {
      // Không có custom homepage hoặc là root path => không redirect
      console.log('[Homepage Middleware] No redirect needed (conditions met)');
      return NextResponse.next();
    }

    // Có custom homepage URL => thực hiện redirect
    console.log(`[Homepage Middleware] Redirecting / to ${homepageUrl}`);

    // Check if redirect URL is external (bắt đầu với http:// hoặc https://)
    if (homepageUrl.startsWith('http://') || homepageUrl.startsWith('https://')) {
      // External redirect (sang domain khác)
      return NextResponse.redirect(homepageUrl);
    } else {
      // Internal redirect (trong cùng domain)
      const url = request.nextUrl.clone();
      url.pathname = homepageUrl;
      return NextResponse.redirect(url);
    }

    // Code này không bao giờ chạy vì đã return ở trên
    // Nhưng giữ lại để TypeScript không warning
    return NextResponse.next();
  } catch (error) {
    console.error('Error in homepage middleware:', error);
    // On error, allow access (fail open)
    return NextResponse.next();
  }
}
