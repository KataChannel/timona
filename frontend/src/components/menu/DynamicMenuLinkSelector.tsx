'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  GET_PRODUCTS_FOR_MENU,
  GET_BLOGS_FOR_MENU,
  GET_BLOG_CATEGORIES,
  GET_CATEGORIES,
} from '@/graphql/menu.queries';
import { Loader2 } from 'lucide-react';

interface DynamicMenuLinkSelectorProps {
  linkType: string;
  value: {
    productId?: string;
    blogPostId?: string;
    pageId?: string;
    categoryId?: string;
    blogCategoryId?: string;
    queryConditions?: any;
  };
  onChange: (value: any) => void;
}

export function DynamicMenuLinkSelector({
  linkType,
  value,
  onChange,
}: DynamicMenuLinkSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Render based on link type
  switch (linkType) {
    case 'PRODUCT_LIST':
      return <ProductListConditions value={value.queryConditions} onChange={(v) => onChange({ queryConditions: v })} />;

    case 'PRODUCT_DETAIL':
      return <ProductSelector value={value.productId} onChange={onChange} searchTerm={searchTerm} onSearchChange={setSearchTerm} />;

    case 'BLOG_LIST':
      return <BlogListConditions value={value.queryConditions} onChange={(v) => onChange({ queryConditions: v })} />;

    case 'BLOG_DETAIL':
      return <BlogSelector value={value.blogPostId} onChange={onChange} searchTerm={searchTerm} onSearchChange={setSearchTerm} />;

    case 'CATEGORY':
      return <CategorySelector value={value.categoryId} onChange={(v) => onChange({ categoryId: v })} />;

    case 'BLOG_CATEGORY':
      return <BlogCategorySelector value={value.blogCategoryId} onChange={(v) => onChange({ blogCategoryId: v })} />;

    case 'PAGE':
      return <PageSelector value={value.pageId} onChange={(v) => onChange({ pageId: v })} />;

    default:
      return null;
  }
}

// Product List Conditions
function ProductListConditions({ value, onChange }: { value?: any; onChange: (v: any) => void }) {
  const conditions = value || {};

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Sắp Xếp</Label>
          <Combobox
            value={conditions.sort || 'latest'}
            onChange={(sort) => onChange({ ...conditions, sort })}
            options={[
              { value: 'latest', label: 'Mới Nhất' },
              { value: 'bestseller', label: 'Bán Chạy' },
              { value: 'popular', label: 'Xem Nhiều' },
              { value: 'price_asc', label: 'Giá Tăng Dần' },
              { value: 'price_desc', label: 'Giá Giảm Dần' },
            ]}
            placeholder="Chọn cách sắp xếp"
            searchPlaceholder="Tìm..."
            emptyMessage="Không tìm thấy."
          />
        </div>

        <div className="space-y-2">
          <Label>Giới Hạn (Số Sản Phẩm)</Label>
          <Input
            type="number"
            value={conditions.limit || 12}
            onChange={(e) => onChange({ ...conditions, limit: parseInt(e.target.value) })}
            min={1}
            max={100}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={conditions.featured || false}
            onChange={(e) => onChange({ ...conditions, featured: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="featured">Chỉ Sản Phẩm Nổi Bật</Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="onSale"
            checked={conditions.onSale || false}
            onChange={(e) => onChange({ ...conditions, onSale: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="onSale">Chỉ Sản Phẩm Giảm Giá</Label>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Selector
function ProductSelector({ 
  value, 
  onChange, 
  searchTerm, 
  onSearchChange 
}: { 
  value?: string; 
  onChange: (v: any) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
}) {
  const { data, loading } = useQuery(GET_PRODUCTS_FOR_MENU, {
    variables: { search: searchTerm, limit: 50 },
  });

  const products = data?.products?.items || [];

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find((p: any) => p.id === productId);
    if (selectedProduct) {
      // Lưu cả productId và slug vào customData
      onChange({
        productId: selectedProduct.id,
        customData: {
          productSlug: selectedProduct.slug,
          productName: selectedProduct.name,
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chọn Sản Phẩm</Label>
        {loading ? (
          <div className="flex items-center justify-center py-8 border rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Combobox
            value={value || ''}
            onChange={handleProductChange}
            options={products.map((product: any) => ({
              value: product.id,
              label: product.name,
            }))}
            placeholder="Chọn sản phẩm"
            searchPlaceholder="Tìm sản phẩm..."
            emptyMessage="Không tìm thấy sản phẩm."
          />
        )}
      </div>
    </div>
  );
}

// Blog List Conditions
function BlogListConditions({ value, onChange }: { value?: any; onChange: (v: any) => void }) {
  const conditions = value || {};

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Sắp Xếp</Label>
          <Combobox
            value={conditions.sort || 'latest'}
            onChange={(sort) => onChange({ ...conditions, sort })}
            options={[
              { value: 'latest', label: 'Mới Nhất' },
              { value: 'oldest', label: 'Cũ Nhất' },
              { value: 'popular', label: 'Xem Nhiều' },
              { value: 'featured', label: 'Nổi Bật' },
            ]}
            placeholder="Chọn cách sắp xếp"
            searchPlaceholder="Tìm..."
            emptyMessage="Không tìm thấy."
          />
        </div>

        <div className="space-y-2">
          <Label>Giới Hạn (Số Bài Viết)</Label>
          <Input
            type="number"
            value={conditions.limit || 12}
            onChange={(e) => onChange({ ...conditions, limit: parseInt(e.target.value) })}
            min={1}
            max={100}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="blogFeatured"
            checked={conditions.featured || false}
            onChange={(e) => onChange({ ...conditions, featured: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="blogFeatured">Chỉ Bài Viết Nổi Bật</Label>
        </div>
      </CardContent>
    </Card>
  );
}

// Blog Selector
function BlogSelector({ 
  value, 
  onChange, 
  searchTerm, 
  onSearchChange 
}: { 
  value?: string; 
  onChange: (v: any) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
}) {
  const { data, loading } = useQuery(GET_BLOGS_FOR_MENU, {
    variables: { search: searchTerm, limit: 50 },
  });

  const blogs = data?.blogs?.items || [];

  const handleBlogChange = (blogPostId: string) => {
    const selectedBlog = blogs.find((b: any) => b.id === blogPostId);
    if (selectedBlog) {
      // Lưu cả blogPostId và slug vào customData
      onChange({
        blogPostId: selectedBlog.id,
        customData: {
          blogPostSlug: selectedBlog.slug,
          blogPostTitle: selectedBlog.title,
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chọn Bài Viết</Label>
        {loading ? (
          <div className="flex items-center justify-center py-8 border rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Combobox
            value={value || ''}
            onChange={handleBlogChange}
            options={blogs.map((blog: any) => ({
              value: blog.id,
              label: blog.title,
            }))}
            placeholder="Chọn bài viết"
            searchPlaceholder="Tìm bài viết..."
            emptyMessage="Không tìm thấy bài viết."
          />
        )}
      </div>
    </div>
  );
}

// Category Selector
function CategorySelector({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const { data, loading } = useQuery(GET_CATEGORIES);
  const categories = data?.categories || [];

  return (
    <div className="space-y-2">
      <Label>Chọn Danh Mục Sản Phẩm</Label>
      {loading ? (
        <div className="flex items-center justify-center py-8 border rounded-md">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Combobox
          value={value || ''}
          onChange={onChange}
          options={categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
          }))}
          placeholder="Chọn danh mục sản phẩm"
          searchPlaceholder="Tìm danh mục..."
          emptyMessage="Không tìm thấy danh mục."
        />
      )}
    </div>
  );
}

// Blog Category Selector
function BlogCategorySelector({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const { data, loading } = useQuery(GET_BLOG_CATEGORIES);
  const categories = data?.blogCategories || [];

  return (
    <div className="space-y-2">
      <Label>Chọn Danh Mục Bài Viết</Label>
      {loading ? (
        <div className="flex items-center justify-center py-8 border rounded-md">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Combobox
          value={value || ''}
          onChange={onChange}
          options={categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
          }))}
          placeholder="Chọn danh mục bài viết"
          searchPlaceholder="Tìm danh mục..."
          emptyMessage="Không tìm thấy danh mục."
        />
      )}
    </div>
  );
}

// Page Selector
function PageSelector({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>Chọn Trang (Page Builder)</Label>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập Page ID hoặc Slug..."
      />
      <p className="text-sm text-muted-foreground">
        Nhập ID hoặc slug của trang từ Page Builder
      </p>
    </div>
  );
}
