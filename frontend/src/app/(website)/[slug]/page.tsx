'use client';

import { useQuery } from '@apollo/client';
import { GET_PAGE_BY_SLUG } from '@/graphql/queries/pages';
import { GET_MENU_BY_SLUG } from '@/graphql/menu.queries';
import { BlockRenderer } from '@/components/page-builder/blocks/BlockRenderer';
import { Page, PageStatus } from '@/types/page-builder';
import { notFound, useRouter } from 'next/navigation';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Info } from 'lucide-react';

interface DynamicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function DynamicPage({ params }: DynamicPageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // In Next.js 13+ App Router, params is always a Promise
        const resolvedParams = await params;
        console.log('Rendering page for slug:', resolvedParams);
        
        if (resolvedParams && resolvedParams.slug) {
          // Exclude reserved routes that have explicit handlers
          const reservedRoutes = ['baiviet', 'sanpham', 'website'];
          if (reservedRoutes.includes(resolvedParams.slug)) {
            console.warn(`Route "${resolvedParams.slug}" is reserved and should use specific handler`);
            setRouteError(`Route "/${resolvedParams.slug}" không được xử lý bởi dynamic page handler`);
            setSlug('');
            return;
          }
          
          // Use slug directly as stored in database
          setSlug(resolvedParams.slug);
        } else {
          console.error('No slug found in params:', resolvedParams);
          setSlug(''); // This will trigger notFound() in the query
        }
      } catch (err) {
        console.error('Error resolving params:', err);
        setRouteError('Lỗi khi xử lý tham số route');
        setSlug(''); // This will trigger notFound() in the query
      }
    };
    
    resolveParams();
  }, [params]);

  // Query 1: Page Builder (Priority)
  const { data: pageData, loading: pageLoading, error: pageError } = useQuery<{ getPageBySlug: Page }>(
    GET_PAGE_BY_SLUG, 
    {
      variables: { slug: slug || '' },
      skip: slug === null, // Skip query until slug is resolved
      errorPolicy: 'all'
    }
  );

  // Query 2: Menu Fallback (only if Page not found OR page is not PUBLISHED)
  const { data: menuData, loading: menuLoading, error: menuError } = useQuery(
    GET_MENU_BY_SLUG,
    {
      variables: { slug: slug || '' },
      // Skip menu query if:
      // 1. Slug not ready yet, OR
      // 2. Page exists AND is PUBLISHED (page takes priority)
      // If page exists but is DRAFT/ARCHIVED, still check menu
      skip: slug === null || (!!pageData?.getPageBySlug && pageData.getPageBySlug.status === PageStatus.PUBLISHED),
      errorPolicy: 'all'
    }
  );

  // Handle ALL menu redirects with useEffect to avoid setState during render
  // IMPORTANT: This must be before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (menuData?.menuBySlug) {
      const menu = menuData.menuBySlug;

      // Case 1: Menu links to BLOG_LIST → Redirect to blog list page
      if (menu.linkType === 'BLOG_LIST') {
        router.push('/bai-viet');
        return;
      }

      // Case 2: Menu links to BLOG_DETAIL → Redirect to blog post
      if (menu.linkType === 'BLOG_DETAIL' && menu.customData?.blogPostSlug) {
        const blogUrl = `/bai-viet/${menu.customData.blogPostSlug}`;
        router.push(blogUrl);
        return;
      }

      // Case 3: Menu links to PRODUCT_LIST → Redirect to product list page
      if (menu.linkType === 'PRODUCT_LIST') {
        router.push('/san-pham');
        return;
      }

      // Case 4: Menu links to PRODUCT_DETAIL → Redirect to product
      if (menu.linkType === 'PRODUCT_DETAIL' && menu.customData?.productSlug) {
        const productUrl = `/san-pham/${menu.customData.productSlug}`;
        router.push(productUrl);
        return;
      }

      // Case 5: Menu has external URL → Redirect to external site
      if (menu.externalUrl) {
        if (menu.target === 'BLANK') {
          window.open(menu.externalUrl, '_blank', 'noopener,noreferrer');
          router.back(); // Go back after opening external link in new tab
        } else {
          window.location.href = menu.externalUrl;
        }
        return;
      }

      // Case 6: Menu has route → Redirect to internal route
      if (menu.route && menu.route !== `/${slug}`) {
        router.push(menu.route);
        return;
      }
    }
  }, [menuData, router, slug]);

  // Loading state
  if (slug === null || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Priority 1: Page Builder exists AND is PUBLISHED → Render blocks
  // If page exists but is DRAFT/ARCHIVED, skip to Menu fallback
  if (pageData?.getPageBySlug) {
    const page = pageData.getPageBySlug;
    console.log('Fetched page data:', page);
    
    // ✅ Only PUBLISHED pages should be visible on public website
    // DRAFT/ARCHIVED pages will fall through to Menu logic
    if (page.status === PageStatus.PUBLISHED) {
      // Page is PUBLISHED - render it
      const seoTitle = page.seoTitle || page.title;
      const seoDescription = page.seoDescription || page.content;
      const seoKeywords = page.seoKeywords?.join(', ');

      // Layout settings with defaults
      const layoutSettings = page.layoutSettings || {
        hasHeader: true,
        hasFooter: true,
        headerStyle: 'default',
        footerStyle: 'default',
      };

      return (
        <>
          <Head>
            <title>{seoTitle}</title>
            {seoDescription && <meta name="description" content={seoDescription} />}
            {seoKeywords && <meta name="keywords" content={seoKeywords} />}
            
            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={seoTitle} />
            {seoDescription && <meta property="og:description" content={seoDescription} />}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}/${page.slug}`} />
            
            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            {seoDescription && <meta name="twitter:description" content={seoDescription} />}
            
            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL}/${page.slug}`} />
          </Head>

          <>
            {/* Page Content - Full width for blocks to handle their own layouts */}
            <main className="w-full">
              {page.blocks && page.blocks.length > 0 ? (
                <div>
                  {[...page.blocks]
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((block) => (
                      <BlockRenderer
                        key={block.id}
                        block={block}
                        isEditing={false}
                        onUpdate={() => {}} // No editing in public view
                        onDelete={() => {}} // No deletion in public view
                        onUpdateChild={() => {}} // Required for rendering nested blocks
                        onDeleteChild={() => {}} // Required for rendering nested blocks
                      />
                    ))}
                </div>
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Page Content Coming Soon
                    </h2>
                    <p className="text-gray-600">
                      This page is currently being built. Please check back later.
                    </p>
                  </div>
                </div>
              )}
            </main>
          </>
        </>
      );
    } else {
      // Page exists but is DRAFT/ARCHIVED
      // Fall through to check Menu configuration
      console.log(`Page "${page.slug}" has status "${page.status}" - checking Menu configuration instead`);
    }
  }

  // Priority 2: Menu exists but no Page → Show fallback or redirect
  if (menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (menuData?.menuBySlug) {
    const menu = menuData.menuBySlug;
    console.log('Found menu:', menu);

    // Only show active menus
    if (!menu.isActive) {
      return notFound();
    }

    // Show loading state while redirecting for any redirect type
    if (
      menu.linkType === 'BLOG_LIST' ||
      menu.linkType === 'PRODUCT_LIST' ||
      (menu.linkType === 'BLOG_DETAIL' && menu.customData?.blogPostSlug) ||
      (menu.linkType === 'PRODUCT_DETAIL' && menu.customData?.productSlug) ||
      menu.externalUrl ||
      (menu.route && menu.route !== `/${slug}`)
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {menu.linkType === 'BLOG_LIST' ? 'Đang chuyển hướng tới danh sách bài viết...' :
               menu.linkType === 'PRODUCT_LIST' ? 'Đang chuyển hướng tới danh sách sản phẩm...' :
               menu.linkType === 'BLOG_DETAIL' ? 'Đang chuyển hướng tới bài viết...' : 
               menu.linkType === 'PRODUCT_DETAIL' ? 'Đang chuyển hướng tới sản phẩm...' :
               menu.externalUrl ? 'Đang chuyển hướng...' :
               'Đang chuyển hướng...'}
            </p>
          </div>
        </div>
      );
    }

    // Case 2e: Menu exists but no content → Show fallback UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Fallback Header */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {menu.title}
                </h1>
                {menu.description && (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {menu.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Under Construction Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
              <h2 className="text-xl font-semibold text-amber-900">
                Trang đang được xây dựng
              </h2>
            </div>
            <p className="text-amber-800 mb-4">
              Nội dung cho trang này đang được chuẩn bị. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để biết thêm thông tin.
            </p>
            
            {/* Children Menus */}
            {menu.children && menu.children.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Các trang liên quan:
                </h3>
                <ul className="space-y-2">
                  {menu.children.map((child: any) => (
                    <li key={child.id}>
                      <a
                        href={child.externalUrl || child.route || child.url || `/${child.slug}`}
                        target={child.target === 'BLANK' ? '_blank' : undefined}
                        rel={child.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                        className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                      >
                        {child.icon && <span>{child.icon}</span>}
                        {child.title}
                        {child.target === 'BLANK' && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Quay lại trang trước
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Priority 3: Both Page and Menu not found → 404
  if (slug === '') {
    return notFound();
  }

  return notFound();
}