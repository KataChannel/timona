'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Filter, Layout, Play, MousePointer } from 'lucide-react';
import { ProductCarouselBlockContent } from '@/types/page-builder';

interface ProductCarouselSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ProductCarouselBlockContent;
  onSave: (settings: ProductCarouselBlockContent) => void;
}

export function ProductCarouselSettingsDialog({ 
  open, 
  onOpenChange, 
  settings, 
  onSave 
}: ProductCarouselSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<ProductCarouselBlockContent>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const updateSettings = (updates: Partial<ProductCarouselBlockContent>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  const updateResponsive = (device: 'mobile' | 'tablet' | 'desktop', value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      responsive: {
        ...prev.responsive,
        [device]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Product Carousel Settings
          </DialogTitle>
          <DialogDescription>
            Customize your product carousel behavior, filters, and appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content" className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-1.5">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1.5">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-1.5">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-1.5">
              <MousePointer className="w-4 h-4" />
              <span className="hidden sm:inline">Controls</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Carousel Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Featured Products"
                  value={localSettings.title || ''}
                  onChange={(e) => updateSettings({ title: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed at the top of the carousel
                </p>
              </div>

              {/* Items to Show */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="itemsToShow" className="text-sm font-medium">
                    Number of Products
                  </Label>
                  <span className="text-sm font-semibold text-primary">
                    {localSettings.itemsToShow || 8}
                  </span>
                </div>
                <Input
                  id="itemsToShow"
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={localSettings.itemsToShow || 8}
                  onChange={(e) => updateSettings({ itemsToShow: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Total products to display in carousel (3-20 items)
                </p>
              </div>

              {/* View All Button */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showViewAllButton" className="text-sm font-medium">
                      Show "View All" Button
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Link to full product listing page
                    </p>
                  </div>
                  <Switch
                    id="showViewAllButton"
                    checked={localSettings.showViewAllButton}
                    onCheckedChange={(checked) => updateSettings({ showViewAllButton: checked })}
                  />
                </div>

                {localSettings.showViewAllButton && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="viewAllLink" className="text-sm font-medium">
                      View All Link URL
                    </Label>
                    <Input
                      id="viewAllLink"
                      type="text"
                      placeholder="/san-pham"
                      value={localSettings.viewAllLink || ''}
                      onChange={(e) => updateSettings({ viewAllLink: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Filter Tab */}
          <TabsContent value="filter" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Data Source Table Selection */}
              <div className="space-y-2">
                <Label htmlFor="dataSourceTable" className="text-sm font-medium">
                  Data Source Table
                </Label>
                <Select
                  value={localSettings.dataSourceTable || 'ext_sanphamhoadon'}
                  onValueChange={(value: any) => updateSettings({ dataSourceTable: value })}
                >
                  <SelectTrigger id="dataSourceTable">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ext_sanphamhoadon">ext_sanphamhoadon (Sản phẩm)</SelectItem>
                    <SelectItem value="ext_listhoadon">ext_listhoadon (Danh sách hóa đơn)</SelectItem>
                    <SelectItem value="ext_detailhoadon">ext_detailhoadon (Chi tiết hóa đơn)</SelectItem>
                    <SelectItem value="Product">Product (Sản phẩm E-commerce)</SelectItem>
                    <SelectItem value="Post">Post (Bài viết)</SelectItem>
                    <SelectItem value="custom">Custom (Tùy chỉnh)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Chọn bảng dữ liệu nguồn để lấy sản phẩm
                </p>
              </div>

              {/* Filter Type */}
              <div className="space-y-2">
                <Label htmlFor="filterType" className="text-sm font-medium">
                  Product Filter Type
                </Label>
                <Select
                  value={localSettings.filterType || 'all'}
                  onValueChange={(value: any) => updateSettings({ filterType: value })}
                >
                  <SelectTrigger id="filterType">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="featured">Featured Products</SelectItem>
                    <SelectItem value="bestseller">Best Sellers</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="custom">Custom GraphQL Query</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose which products to display
                </p>
              </div>

              {/* Category Filter */}
              {localSettings.filterType === 'category' && (
                <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label htmlFor="category" className="text-sm font-medium text-blue-900">
                    Category Slug
                  </Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="e.g., dien-thoai-smartphone"
                    value={localSettings.category || ''}
                    onChange={(e) => updateSettings({ category: e.target.value })}
                  />
                  <p className="text-xs text-blue-700">
                    Enter the category slug to filter products
                  </p>
                </div>
              )}

              {/* Custom Query */}
              {localSettings.filterType === 'custom' && (
                <div className="space-y-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <Label htmlFor="customQuery" className="text-sm font-medium text-purple-900">
                    Custom GraphQL Query
                  </Label>
                  <textarea
                    id="customQuery"
                    rows={10}
                    placeholder="Enter GraphQL query..."
                    value={localSettings.customQuery || ''}
                    onChange={(e) => updateSettings({ customQuery: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-md font-mono bg-white"
                  />
                  <p className="text-xs text-purple-700 mb-2">
                    Advanced: Define custom GraphQL query for products
                  </p>
                  
                  {/* Sample Query Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sampleQuery = `query GetProducts($limit: Int) {
  ext_sanphamhoadon(
    limit: $limit
    orderBy: { createdAt: desc }
    where: {
      ten: { contains: "" }
      dgia: { gt: 0 }
    }
  ) {
    id
    ten
    ten2
    ma
    dvt
    dgia
    createdAt
  }
}`;
                      updateSettings({ customQuery: sampleQuery });
                    }}
                    className="w-full"
                  >
                    📝 Load Sample Query
                  </Button>
                </div>
              )}

              {/* Filter Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  <strong>✅ Data Source:</strong> Products are loaded from table{' '}
                  <code className="px-1.5 py-0.5 bg-green-100 rounded text-xs font-mono">
                    {localSettings.dataSourceTable || 'ext_sanphamhoadon'}
                  </code>{' '}
                  using dynamic GraphQL queries.
                </p>
                <p className="text-xs text-green-700 mt-1">
                  💡 Tip: Chọn "Custom GraphQL Query" để tùy chỉnh hoàn toàn query lấy dữ liệu
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Responsive Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Responsive Items Per View
                </h3>
                
                {/* Desktop */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktopItems" className="text-sm font-medium">
                      🖥️ Desktop (&gt; 1024px)
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {localSettings.responsive?.desktop || 4}
                    </span>
                  </div>
                  <Input
                    id="desktopItems"
                    type="range"
                    min={2}
                    max={6}
                    step={1}
                    value={localSettings.responsive?.desktop || 4}
                    onChange={(e) => updateResponsive('desktop', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Items displayed on large screens
                  </p>
                </div>

                {/* Tablet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tabletItems" className="text-sm font-medium">
                      📱 Tablet (640px - 1024px)
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {localSettings.responsive?.tablet || 3}
                    </span>
                  </div>
                  <Input
                    id="tabletItems"
                    type="range"
                    min={2}
                    max={4}
                    step={1}
                    value={localSettings.responsive?.tablet || 3}
                    onChange={(e) => updateResponsive('tablet', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Items displayed on medium screens
                  </p>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mobileItems" className="text-sm font-medium">
                      📱 Mobile (&lt; 640px)
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {localSettings.responsive?.mobile || 2}
                    </span>
                  </div>
                  <Input
                    id="mobileItems"
                    type="range"
                    min={1}
                    max={3}
                    step={1}
                    value={localSettings.responsive?.mobile || 2}
                    onChange={(e) => updateResponsive('mobile', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Items displayed on small screens
                  </p>
                </div>
              </div>

              {/* Layout Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Responsive Design:</strong> Carousel automatically adjusts based on screen size. 
                  Mobile-first approach ensures optimal viewing on all devices.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Autoplay */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay" className="text-sm font-medium">
                    Autoplay
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically scroll through products
                  </p>
                </div>
                <Switch
                  id="autoplay"
                  checked={localSettings.autoplay}
                  onCheckedChange={(checked) => updateSettings({ autoplay: checked })}
                />
              </div>

              {/* Autoplay Delay */}
              {localSettings.autoplay && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplayDelay" className="text-sm font-medium">
                      Autoplay Speed
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {(localSettings.autoplayDelay || 3000) / 1000}s
                    </span>
                  </div>
                  <Input
                    id="autoplayDelay"
                    type="range"
                    min={2000}
                    max={10000}
                    step={500}
                    value={localSettings.autoplayDelay || 3000}
                    onChange={(e) => updateSettings({ autoplayDelay: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Time between slides (2-10 seconds)
                  </p>
                </div>
              )}

              {/* Loop */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="loop" className="text-sm font-medium">
                    Loop Carousel
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Return to first item after reaching the end
                  </p>
                </div>
                <Switch
                  id="loop"
                  checked={localSettings.loop}
                  onCheckedChange={(checked) => updateSettings({ loop: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Show Navigation */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="showNavigation" className="text-sm font-medium">
                    Navigation Arrows
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show previous/next buttons
                  </p>
                </div>
                <Switch
                  id="showNavigation"
                  checked={localSettings.showNavigation}
                  onCheckedChange={(checked) => updateSettings({ showNavigation: checked })}
                />
              </div>

              {/* Controls Preview */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    🎨 Control Preview
                  </p>
                  <div className="flex items-center gap-3 justify-center py-6">
                    {localSettings.showNavigation && (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 border-2 border-gray-200">
                          ‹
                        </div>
                        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border text-sm text-gray-600">
                          Product Cards
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 border-2 border-gray-200">
                          ›
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {localSettings.showNavigation 
                      ? '✓ Navigation arrows enabled' 
                      : '✗ Navigation arrows hidden'}
                  </p>
                </div>
              </div>

              {/* Touch/Swipe Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>👆 Touch Support:</strong> Carousel supports touch/swipe gestures on mobile devices automatically.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="min-w-[100px]"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
