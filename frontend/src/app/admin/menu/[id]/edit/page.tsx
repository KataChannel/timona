'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import {
  UPDATE_MENU_ADMIN,
  GET_MENU_BY_ID_ADMIN,
  GET_MENUS_TREE,
} from '@/graphql/menu.queries';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Combobox } from '@/components/ui/combobox';
import { DynamicMenuLinkSelector } from '@/components/menu/DynamicMenuLinkSelector';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export default function MenuFormPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params?.id as string;
  const isEdit = !!menuId;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    type: 'HEADER',
    parentId: '',
    order: 0,
    url: '',
    route: '',
    externalUrl: '',
    target: 'SELF',
    linkType: 'URL',
    icon: '',
    badge: '',
    badgeColor: '',
    image: '',
    isActive: true,
    isVisible: true,
    cssClass: '',
    // Dynamic link fields
    productId: '',
    blogPostId: '',
    pageId: '',
    categoryId: '',
    blogCategoryId: '',
    queryConditions: null,
    customData: null as Record<string, any> | null,
  });

  // Load menu data for editing
  const { data: menuData, loading: loadingMenu } = useQuery(GET_MENU_BY_ID_ADMIN, {
    variables: { id: menuId },
    skip: !isEdit,
    onError: (error) => {
      toast.error('Lỗi: ' + error.message);
      router.push('/admin/menu');
    },
  });

  // Update form data when menu data is loaded
  useEffect(() => {
    if (menuData?.menu) {
      setFormData({
        title: menuData.menu.title || '',
        slug: menuData.menu.slug || '',
        description: menuData.menu.description || '',
        type: menuData.menu.type || 'HEADER',
        parentId: menuData.menu.parentId || '',
        order: menuData.menu.order || 0,
        url: menuData.menu.url || '',
        route: menuData.menu.route || '',
        externalUrl: menuData.menu.externalUrl || '',
        target: menuData.menu.target || 'SELF',
        linkType: menuData.menu.linkType || 'URL',
        icon: menuData.menu.icon || '',
        badge: menuData.menu.badge || '',
        badgeColor: menuData.menu.badgeColor || '',
        image: menuData.menu.image || '',
        isActive: menuData.menu.isActive !== false,
        isVisible: menuData.menu.isVisible !== false,
        cssClass: menuData.menu.cssClass || '',
        productId: menuData.menu.productId || '',
        blogPostId: menuData.menu.blogPostId || '',
        pageId: menuData.menu.pageId || '',
        categoryId: menuData.menu.categoryId || '',
        blogCategoryId: menuData.menu.blogCategoryId || '',
        queryConditions: menuData.menu.queryConditions || null,
        customData: menuData.menu.customData || null,
      });
    }
  }, [menuData]);

  // Load menu tree for parent selection
  const { data: menusData } = useQuery(GET_MENUS_TREE);
  const menus = menusData?.menuTree || [];

  const [updateMenu, { loading: updating }] = useMutation(UPDATE_MENU_ADMIN, {
    onCompleted: () => {
      toast.success('Đã cập nhật menu thành công!');
      router.push('/admin/menu');
    },
    onError: (error) => toast.error('Lỗi: ' + error.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const input: any = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || undefined,
      type: formData.type || undefined,
      parentId: formData.parentId || undefined,
      order: parseInt(String(formData.order)) || 0,
      target: formData.target,
      linkType: formData.linkType || undefined,
      icon: formData.icon || undefined,
      badge: formData.badge || undefined,
      badgeColor: formData.badgeColor || undefined,
      image: formData.image || undefined,
      isActive: formData.isActive,
      isVisible: formData.isVisible,
      cssClass: formData.cssClass || undefined,
    };

    // Set URL based on linkType
    if (formData.linkType === 'URL') {
      if (formData.externalUrl) {
        input.externalUrl = formData.externalUrl;
      } else if (formData.route) {
        input.route = formData.route;
      } else {
        input.url = formData.url;
      }
    } else {
      // Dynamic link
      input.linkType = formData.linkType || undefined;
      input.productId = formData.productId || undefined;
      input.blogPostId = formData.blogPostId || undefined;
      input.pageId = formData.pageId || undefined;
      input.categoryId = formData.categoryId || undefined;
      input.blogCategoryId = formData.blogCategoryId || undefined;
      input.queryConditions = formData.queryConditions || undefined;
      input.customData = formData.customData || undefined;
    }

    console.log('Updating menu with id:', menuId, 'input:', input);
    await updateMenu({ variables: { id: menuId, input } });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleDynamicLinkChange = (values: any) => {
    // Tách customData ra khỏi các field khác
    const { customData, ...otherFields } = values;
    
    setFormData({
      ...formData,
      ...otherFields,
      customData: customData || formData.customData,
    });
  };

  if (loadingMenu) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEdit ? 'Chỉnh Sửa Menu' : 'Tạo Menu Mới'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý menu động với điều kiện tùy chỉnh
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu Đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="VD: Sản Phẩm Nổi Bật"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="VD: san-pham-noi-bat"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về menu..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Vị Trí Menu</Label>
                <Combobox
                  value={formData.type}
                  onChange={(type) => setFormData({ ...formData, type })}
                  options={[
                    { value: 'HEADER', label: 'Header' },
                    { value: 'FOOTER', label: 'Footer' },
                    { value: 'SIDEBAR', label: 'Sidebar' },
                    { value: 'MOBILE', label: 'Mobile' },
                    { value: 'CUSTOM', label: 'Custom' },
                  ]}
                  placeholder="Chọn vị trí menu"
                  searchPlaceholder="Tìm vị trí..."
                  emptyMessage="Không tìm thấy vị trí."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">Menu Cha</Label>
                <Combobox
                  value={formData.parentId || 'none'}
                  onChange={(parentId) => setFormData({ ...formData, parentId: parentId === 'none' ? '' : parentId })}
                  options={[
                    { value: 'none', label: '-- Không có --' },
                    ...menus.map((menu: any) => ({
                      value: menu.id,
                      label: menu.title,
                    })),
                  ]}
                  placeholder="Chọn menu cha"
                  searchPlaceholder="Tìm menu cha..."
                  emptyMessage="Không tìm thấy menu."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Thứ Tự</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Cấu Hình Liên Kết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkType">Loại Liên Kết</Label>
              <Combobox
                value={formData.linkType}
                onChange={(linkType) => setFormData({ ...formData, linkType })}
                options={[
                  { value: 'URL', label: 'URL Tùy Chỉnh' },
                  { value: 'PRODUCT_LIST', label: 'Danh Sách Sản Phẩm (Có Điều Kiện)' },
                  { value: 'PRODUCT_DETAIL', label: 'Chi Tiết Sản Phẩm' },
                  { value: 'BLOG_LIST', label: 'Danh Sách Bài Viết (Có Điều Kiện)' },
                  { value: 'BLOG_DETAIL', label: 'Chi Tiết Bài Viết' },
                  { value: 'CATEGORY', label: 'Danh Mục Sản Phẩm' },
                  { value: 'BLOG_CATEGORY', label: 'Danh Mục Bài Viết' },
                  { value: 'PAGE', label: 'Trang (Page Builder)' },
                ]}
                placeholder="Chọn loại liên kết"
                searchPlaceholder="Tìm loại liên kết..."
                emptyMessage="Không tìm thấy loại liên kết."
              />
            </div>

            {formData.linkType === 'URL' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL Nội Bộ</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/san-pham"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="/products"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">URL Bên Ngoài</Label>
                  <Input
                    id="externalUrl"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            ) : (
              <DynamicMenuLinkSelector
                linkType={formData.linkType}
                value={{
                  productId: formData.productId,
                  blogPostId: formData.blogPostId,
                  pageId: formData.pageId,
                  categoryId: formData.categoryId,
                  blogCategoryId: formData.blogCategoryId,
                  queryConditions: formData.queryConditions,
                }}
                onChange={handleDynamicLinkChange}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="target">Mở Liên Kết</Label>
              <Combobox
                value={formData.target}
                onChange={(target) => setFormData({ ...formData, target })}
                options={[
                  { value: 'SELF', label: 'Cùng Tab' },
                  { value: 'BLANK', label: 'Tab Mới' },
                  { value: 'MODAL', label: 'Modal' },
                ]}
                placeholder="Chọn cách mở liên kết"
                searchPlaceholder="Tìm..."
                emptyMessage="Không tìm thấy."
              />
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle>Hiển Thị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="VD: ShoppingCart, Home"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL Hình Ảnh</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/icon.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge Text</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="VD: New, Hot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeColor">Badge Color</Label>
                <Input
                  id="badgeColor"
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  placeholder="VD: red, blue, green"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cssClass">CSS Class</Label>
              <Input
                id="cssClass"
                value={formData.cssClass}
                onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
                placeholder="custom-menu-class"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài Đặt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Kích Hoạt</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
              <Label htmlFor="isVisible">Hiển Thị</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={updating || loadingMenu} className="w-full sm:w-auto">
            {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Cập Nhật Menu
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
