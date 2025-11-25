import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { offlineMiddleware } from './src/middleware/offline';
import { homepageMiddleware } from './src/middleware/homepage';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ALWAYS LOG TO VERIFY MIDDLEWARE IS RUNNING
  console.error(`🔴🔴🔴 MIDDLEWARE RUNNING FOR: ${pathname} 🔴🔴🔴`);
  
  console.log('\n' + '='.repeat(80));
  console.log(`[Main Middleware] 🚀 MIDDLEWARE INVOKED for: ${pathname}`);
  console.log('='.repeat(80));
  
  // Run offline middleware first (higher priority)
  const offlineResponse = await offlineMiddleware(request);
  if (offlineResponse.status !== 200) {
    console.log(`[Main Middleware] Offline middleware returned ${offlineResponse.status}`);
    return offlineResponse;
  }

  // Run homepage middleware  
  const homepageResponse = await homepageMiddleware(request);
  console.log(`[Main Middleware] Homepage middleware returned status ${homepageResponse.status} for ${pathname}`);
  
  // Return response if it's not a simple "next()" (status 200)
  if (homepageResponse.status !== 200) {
    console.log(`[Main Middleware] Returning homepage response (status ${homepageResponse.status})`);
    return homepageResponse;
  }
  
  // Add more middleware here if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
