/**
 * EXAMPLE: Page Builder với Layout Customization
 * Minh họa cách sử dụng PageLayoutSettings
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Save } from 'lucide-react';
import { PageLayoutSettings } from '@/features/page-builder';
import { PageLayoutSettings as LayoutSettingsType } from '@/types/page-builder';

/**
 * Example: Page Builder Editor với Layout Settings
 */
export function PageBuilderWithLayoutExample() {
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettingsType>({
    hasHeader: true,
    hasFooter: true,
    headerMenuId: null,
    footerMenuId: null,
    headerStyle: 'default',
    footerStyle: 'default',
    headerVariant: 'default',
    footerVariant: 'default',
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleSave = () => {
    console.log('Saving layout settings:', layoutSettings);
    // TODO: Call GraphQL mutation to save settings
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Builder Toolbar */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Page Builder</h1>
              <p className="text-sm text-gray-500">Đang chỉnh sửa: Trang Chủ</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Layout Settings Dialog */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Layout Settings
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cài Đặt Bố Cục Trang</DialogTitle>
                  </DialogHeader>

                  <div className="mt-4">
                    <PageLayoutSettings
                      settings={layoutSettings}
                      onChange={setLayoutSettings}
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu Thay Đổi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="sm">
                <Save className="h-4 w-4 mr-2" />
                Lưu Trang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nội Dung Trang</CardTitle>
                <CardDescription>
                  Kéo thả các blocks để xây dựng trang của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Khu Vực Nội Dung</p>
                    <p className="text-sm">Thả blocks vào đây</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Current Layout Settings Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cài Đặt Hiện Tại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Header:</span>
                  <span className="font-medium">
                    {layoutSettings.hasHeader ? '✅ Hiển thị' : '❌ Ẩn'}
                  </span>
                </div>
                
                {layoutSettings.hasHeader && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Header Style:</span>
                      <span className="font-medium capitalize">
                        {layoutSettings.headerStyle}
                      </span>
                    </div>
                    
                    {layoutSettings.headerMenuId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custom Menu:</span>
                        <span className="font-medium text-blue-600">Có</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-3 mt-3" />

                <div className="flex justify-between">
                  <span className="text-gray-600">Footer:</span>
                  <span className="font-medium">
                    {layoutSettings.hasFooter ? '✅ Hiển thị' : '❌ Ẩn'}
                  </span>
                </div>

                {layoutSettings.hasFooter && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Footer Style:</span>
                      <span className="font-medium capitalize">
                        {layoutSettings.footerStyle}
                      </span>
                    </div>
                    
                    {layoutSettings.footerMenuId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custom Menu:</span>
                        <span className="font-medium text-blue-600">Có</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thao Tác Nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cài Đặt Bố Cục
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageBuilderWithLayoutExample;
