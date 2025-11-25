'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BlogCarouselBlockContent } from '@/types/page-builder';
import { useQuery } from '@apollo/client';
import { GET_BLOG_CATEGORIES } from '@/graphql/blog.queries';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface BlogCarouselSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: BlogCarouselBlockContent;
  onSave: (settings: BlogCarouselBlockContent) => void;
}

export const BlogCarouselSettingsDialog: React.FC<BlogCarouselSettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<BlogCarouselBlockContent>(settings);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Load blog categories
  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES, {
    fetchPolicy: 'cache-first',
  });

  const categories = categoriesData?.blogCategories || [];

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<BlogCarouselBlockContent>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const filterTypes = [
    { value: 'all', label: 'Tất cả bài viết' },
    { value: 'featured', label: 'Bài viết nổi bật' },
    { value: 'recent', label: 'Bài viết mới nhất' },
    { value: 'category', label: 'Theo danh mục' },
  ];

  const selectedCategory = categories.find((cat: any) => cat.id === localSettings.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cài đặt Blog Carousel</DialogTitle>
          <DialogDescription>
            Cấu hình hiển thị bài viết trong carousel
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={localSettings.title || ''}
                onChange={(e) => updateSettings({ title: e.target.value })}
                placeholder="Tin tức nổi bật"
              />
            </div>

            {/* Filter Type */}
            <div className="space-y-2">
              <Label htmlFor="filterType">Loại lọc</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {filterTypes.find((f) => f.value === localSettings.filterType)?.label || 'Chọn loại lọc'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm..." />
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      {filterTypes.map((filter) => (
                        <CommandItem
                          key={filter.value}
                          onSelect={() => {
                            updateSettings({ filterType: filter.value as any });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              localSettings.filterType === filter.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {filter.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Category Selection (only if filterType is 'category') */}
            {localSettings.filterType === 'category' && (
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between"
                    >
                      {selectedCategory ? selectedCategory.name : 'Chọn danh mục...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Tìm danh mục..." />
                      <CommandEmpty>Không tìm thấy danh mục.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category: any) => (
                          <CommandItem
                            key={category.id}
                            onSelect={() => {
                              updateSettings({ categoryId: category.id });
                              setCategoryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                localSettings.categoryId === category.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Items to Show */}
            <div className="space-y-2">
              <Label htmlFor="itemsToShow">Số bài viết hiển thị</Label>
              <Input
                id="itemsToShow"
                type="number"
                min={1}
                max={20}
                value={localSettings.itemsToShow || 6}
                onChange={(e) => updateSettings({ itemsToShow: parseInt(e.target.value) || 6 })}
              />
            </div>

            {/* Responsive Settings */}
            <div className="space-y-2">
              <Label>Số cột hiển thị</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mobile" className="text-xs">Mobile</Label>
                  <Input
                    id="mobile"
                    type="number"
                    min={1}
                    max={3}
                    value={localSettings.responsive?.mobile || 1}
                    onChange={(e) =>
                      updateSettings({
                        responsive: {
                          ...localSettings.responsive,
                          mobile: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tablet" className="text-xs">Tablet</Label>
                  <Input
                    id="tablet"
                    type="number"
                    min={1}
                    max={4}
                    value={localSettings.responsive?.tablet || 2}
                    onChange={(e) =>
                      updateSettings({
                        responsive: {
                          ...localSettings.responsive,
                          tablet: parseInt(e.target.value) || 2,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="desktop" className="text-xs">Desktop</Label>
                  <Input
                    id="desktop"
                    type="number"
                    min={1}
                    max={6}
                    value={localSettings.responsive?.desktop || 3}
                    onChange={(e) =>
                      updateSettings({
                        responsive: {
                          ...localSettings.responsive,
                          desktop: parseInt(e.target.value) || 3,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <Label>Tùy chọn hiển thị</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showExcerpt" className="font-normal">
                    Hiện mô tả ngắn
                  </Label>
                  <Switch
                    id="showExcerpt"
                    checked={localSettings.showExcerpt !== false}
                    onCheckedChange={(checked) => updateSettings({ showExcerpt: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showAuthor" className="font-normal">
                    Hiện tác giả
                  </Label>
                  <Switch
                    id="showAuthor"
                    checked={localSettings.showAuthor !== false}
                    onCheckedChange={(checked) => updateSettings({ showAuthor: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDate" className="font-normal">
                    Hiện ngày đăng
                  </Label>
                  <Switch
                    id="showDate"
                    checked={localSettings.showDate !== false}
                    onCheckedChange={(checked) => updateSettings({ showDate: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCategory" className="font-normal">
                    Hiện danh mục
                  </Label>
                  <Switch
                    id="showCategory"
                    checked={localSettings.showCategory !== false}
                    onCheckedChange={(checked) => updateSettings({ showCategory: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Carousel Settings */}
            <div className="space-y-3">
              <Label>Cài đặt carousel</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showNavigation" className="font-normal">
                    Hiện nút điều hướng
                  </Label>
                  <Switch
                    id="showNavigation"
                    checked={localSettings.showNavigation !== false}
                    onCheckedChange={(checked) => updateSettings({ showNavigation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="loop" className="font-normal">
                    Lặp lại vô tận
                  </Label>
                  <Switch
                    id="loop"
                    checked={localSettings.loop !== false}
                    onCheckedChange={(checked) => updateSettings({ loop: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoplay" className="font-normal">
                    Tự động chuyển
                  </Label>
                  <Switch
                    id="autoplay"
                    checked={localSettings.autoplay === true}
                    onCheckedChange={(checked) => updateSettings({ autoplay: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Autoplay Delay */}
            {localSettings.autoplay && (
              <div className="space-y-2">
                <Label htmlFor="autoplayDelay">Thời gian chuyển (ms)</Label>
                <Input
                  id="autoplayDelay"
                  type="number"
                  min={1000}
                  max={10000}
                  step={1000}
                  value={localSettings.autoplayDelay || 5000}
                  onChange={(e) => updateSettings({ autoplayDelay: parseInt(e.target.value) || 5000 })}
                />
              </div>
            )}

            {/* View All Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showViewAllButton" className="font-normal">
                  Hiện nút "Xem tất cả"
                </Label>
                <Switch
                  id="showViewAllButton"
                  checked={localSettings.showViewAllButton !== false}
                  onCheckedChange={(checked) => updateSettings({ showViewAllButton: checked })}
                />
              </div>
            </div>

            {/* View All Link */}
            {localSettings.showViewAllButton && (
              <div className="space-y-2">
                <Label htmlFor="viewAllLink">Link "Xem tất cả"</Label>
                <Input
                  id="viewAllLink"
                  value={localSettings.viewAllLink || '/tin-tuc'}
                  onChange={(e) => updateSettings({ viewAllLink: e.target.value })}
                  placeholder="/tin-tuc"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
