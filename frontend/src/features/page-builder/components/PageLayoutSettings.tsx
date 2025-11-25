/**
 * Page Builder - Page Layout Settings Component
 * Clean Architecture - Presentation Layer
 * 
 * Component để cấu hình header/footer cho page với menu selection
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageLayoutSettings as LayoutSettings } from '@/types/page-builder';
import { useMenu } from '@/features/menu/hooks/useMenu';
import { MenuType } from '@/features/menu/types/menu.types';

interface PageLayoutSettingsProps {
  settings: LayoutSettings;
  onChange: (settings: LayoutSettings) => void;
}

/**
 * Component cấu hình layout settings cho page
 */
export function PageLayoutSettings({ settings, onChange }: PageLayoutSettingsProps) {
  const { menus: headerMenus, loading: loadingHeader } = useMenu({
    type: MenuType.HEADER,
    isPublic: true,
  });

  const { menus: footerMenus, loading: loadingFooter } = useMenu({
    type: MenuType.FOOTER,
    isPublic: true,
  });

  const handleChange = <K extends keyof LayoutSettings>(
    key: K,
    value: LayoutSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cài Đặt Header</CardTitle>
          <CardDescription>
            Tùy chỉnh hiển thị và kiểu dáng header cho trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show Header Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasHeader">Hiển Thị Header</Label>
              <p className="text-xs text-muted-foreground">
                Bật/tắt header trên trang này
              </p>
            </div>
            <Switch
              id="hasHeader"
              checked={settings.hasHeader ?? true}
              onCheckedChange={(checked) => handleChange('hasHeader', checked)}
            />
          </div>

          {settings.hasHeader && (
            <>
              <Separator />

              {/* Header Style */}
              <div className="space-y-2">
                <Label htmlFor="headerStyle">Kiểu Header</Label>
                <Select
                  value={settings.headerStyle || 'default'}
                  onValueChange={(value: any) => handleChange('headerStyle', value)}
                >
                  <SelectTrigger id="headerStyle">
                    <SelectValue placeholder="Chọn kiểu header" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc Định</SelectItem>
                    <SelectItem value="transparent">Trong Suốt</SelectItem>
                    <SelectItem value="fixed">Cố Định Trên Cùng</SelectItem>
                    <SelectItem value="sticky">Dính (Sticky)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default: Header bình thường | Transparent: Đè lên hero section | 
                  Fixed/Sticky: Luôn hiển thị khi scroll
                </p>
              </div>

              {/* Header Variant */}
              <div className="space-y-2">
                <Label htmlFor="headerVariant">Biến Thể Header</Label>
                <Select
                  value={settings.headerVariant || 'default'}
                  onValueChange={(value: any) => handleChange('headerVariant', value)}
                >
                  <SelectTrigger id="headerVariant">
                    <SelectValue placeholder="Chọn biến thể" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc Định</SelectItem>
                    <SelectItem value="minimal">Tối Giản</SelectItem>
                    <SelectItem value="centered">Căn Giữa</SelectItem>
                    <SelectItem value="mega">Mega Menu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Header Menu Selection */}
              <div className="space-y-2">
                <Label htmlFor="headerMenuId">Menu Header (Tùy Chọn)</Label>
                <Select
                  value={settings.headerMenuId || 'default'}
                  onValueChange={(value) =>
                    handleChange('headerMenuId', value === 'default' ? null : value)
                  }
                  disabled={loadingHeader}
                >
                  <SelectTrigger id="headerMenuId">
                    <SelectValue placeholder={loadingHeader ? 'Đang tải...' : 'Chọn menu'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Menu Mặc Định</SelectItem>
                    {headerMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Để trống để sử dụng menu header mặc định của website
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cài Đặt Footer</CardTitle>
          <CardDescription>
            Tùy chỉnh hiển thị và kiểu dáng footer cho trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show Footer Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasFooter">Hiển Thị Footer</Label>
              <p className="text-xs text-muted-foreground">
                Bật/tắt footer trên trang này
              </p>
            </div>
            <Switch
              id="hasFooter"
              checked={settings.hasFooter ?? true}
              onCheckedChange={(checked) => handleChange('hasFooter', checked)}
            />
          </div>

          {settings.hasFooter && (
            <>
              <Separator />

              {/* Footer Style */}
              <div className="space-y-2">
                <Label htmlFor="footerStyle">Kiểu Footer</Label>
                <Select
                  value={settings.footerStyle || 'default'}
                  onValueChange={(value: any) => handleChange('footerStyle', value)}
                >
                  <SelectTrigger id="footerStyle">
                    <SelectValue placeholder="Chọn kiểu footer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc Định</SelectItem>
                    <SelectItem value="minimal">Tối Giản</SelectItem>
                    <SelectItem value="extended">Mở Rộng</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default: Footer chuẩn | Minimal: Footer gọn | Extended: Footer đầy đủ với các cột
                </p>
              </div>

              {/* Footer Variant */}
              <div className="space-y-2">
                <Label htmlFor="footerVariant">Biến Thể Footer</Label>
                <Select
                  value={settings.footerVariant || 'default'}
                  onValueChange={(value: any) => handleChange('footerVariant', value)}
                >
                  <SelectTrigger id="footerVariant">
                    <SelectValue placeholder="Chọn biến thể" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc Định</SelectItem>
                    <SelectItem value="minimal">Tối Giản</SelectItem>
                    <SelectItem value="extended">Mở Rộng</SelectItem>
                    <SelectItem value="newsletter">Có Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Footer Menu Selection */}
              <div className="space-y-2">
                <Label htmlFor="footerMenuId">Menu Footer (Tùy Chọn)</Label>
                <Select
                  value={settings.footerMenuId || 'default'}
                  onValueChange={(value) =>
                    handleChange('footerMenuId', value === 'default' ? null : value)
                  }
                  disabled={loadingFooter}
                >
                  <SelectTrigger id="footerMenuId">
                    <SelectValue placeholder={loadingFooter ? 'Đang tải...' : 'Chọn menu'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Menu Mặc Định</SelectItem>
                    {footerMenus.map((menu) => (
                      <SelectItem key={menu.id} value={menu.id}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Để trống để sử dụng menu footer mặc định của website
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
