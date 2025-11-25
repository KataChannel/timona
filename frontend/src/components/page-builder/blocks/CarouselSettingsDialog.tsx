'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

interface CarouselSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    autoPlay: boolean;
    autoPlayInterval: number;
    showIndicators: boolean;
    showArrows: boolean;
    loop: boolean;
    height: string;
    transition: string;
    indicatorStyle: string;
    arrowStyle: string;
    slidesPerView?: number;
    animationType?: 'fade' | 'slide' | 'zoom' | 'none';
    animationDuration?: number;
    dataSource?: {
      type: 'manual' | 'api' | 'database';
      endpoint?: string;
      query?: string;
      variables?: any;
      queryType?: 'featured' | 'products' | 'custom';
      limit?: number;
      filters?: any;
      titleField?: string;
      subtitleField?: string;
      descriptionField?: string;
      imageField?: string;
      priceField?: string;
      linkField?: string;
      badgeField?: string;
    };
  };
  onSave: (settings: any) => void;
}

export function CarouselSettingsDialog({ open, onOpenChange, settings, onSave }: CarouselSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Carousel Settings
          </DialogTitle>
          <DialogDescription>
            Customize your carousel behavior and appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="behavior" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="datasource">Data Source</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="datasource" className="space-y-4 mt-4">
            {/* Data Source Type */}
            <div className="space-y-2">
              <Label htmlFor="dataSourceType">Data Source</Label>
              <Select
                value={localSettings.dataSource?.type || 'manual'}
                onValueChange={(value: 'manual' | 'api' | 'database') =>
                  setLocalSettings({
                    ...localSettings,
                    dataSource: {
                      ...localSettings.dataSource,
                      type: value,
                    },
                  })
                }
              >
                <SelectTrigger id="dataSourceType">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Slides</SelectItem>
                  <SelectItem value="database">Database (GraphQL)</SelectItem>
                  <SelectItem value="api">API Endpoint</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how carousel content is loaded
              </p>
            </div>

            {/* Database Settings */}
            {localSettings.dataSource?.type === 'database' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="queryType">Query Type</Label>
                  <Select
                    value={localSettings.dataSource?.queryType || 'featured'}
                    onValueChange={(value: 'featured' | 'products' | 'custom') =>
                      setLocalSettings({
                        ...localSettings,
                        dataSource: {
                          ...localSettings.dataSource,
                          type: 'database',
                          queryType: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="queryType">
                      <SelectValue placeholder="Select query type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured Products</SelectItem>
                      <SelectItem value="products">All Products</SelectItem>
                      <SelectItem value="custom">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Number of Items</Label>
                  <Input
                    id="limit"
                    type="number"
                    min={1}
                    max={50}
                    value={localSettings.dataSource?.limit || 10}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dataSource: {
                          ...localSettings.dataSource,
                          type: 'database',
                          limit: parseInt(e.target.value) || 10,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of items to display (1-50)
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✅ Database Mode:</strong> Carousel will automatically load products from your database. 
                    Field mappings are configured automatically for products.
                  </p>
                </div>
              </>
            )}

            {/* API Settings */}
            {localSettings.dataSource?.type === 'api' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint</Label>
                  <Input
                    id="endpoint"
                    type="text"
                    placeholder="/api/products"
                    value={localSettings.dataSource?.endpoint || ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dataSource: {
                          ...localSettings.dataSource,
                          type: 'api',
                          endpoint: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>🔧 API Mode:</strong> Configure API endpoint to fetch carousel data dynamically. 
                    Advanced configuration coming soon.
                  </p>
                </div>
              </>
            )}

            {/* Manual Mode Info */}
            {localSettings.dataSource?.type === 'manual' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>✏️ Manual Mode:</strong> Add and edit slides manually using the "Add Slide" button. 
                  Perfect for custom content and complete control.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4 mt-4">
            {/* Auto Play */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="autoPlay">Auto Play</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically advance slides
                </p>
              </div>
              <Switch
                id="autoPlay"
                checked={localSettings.autoPlay}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, autoPlay: checked })
                }
              />
            </div>

            {/* Auto Play Interval */}
            {localSettings.autoPlay && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoPlayInterval">Slide Duration</Label>
                  <span className="text-sm text-muted-foreground">
                    {localSettings.autoPlayInterval / 1000}s
                  </span>
                </div>
                <Input
                  id="autoPlayInterval"
                  type="range"
                  min={2000}
                  max={10000}
                  step={500}
                  value={localSettings.autoPlayInterval}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalSettings({ ...localSettings, autoPlayInterval: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Time each slide is displayed (2-10 seconds)
                </p>
              </div>
            )}

            {/* Loop */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="loop">Loop</Label>
                <p className="text-sm text-muted-foreground">
                  Return to first slide after last
                </p>
              </div>
              <Switch
                id="loop"
                checked={localSettings.loop}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, loop: checked })
                }
              />
            </div>

            {/* Transition Effect */}
            <div className="space-y-2">
              <Label htmlFor="transition">Transition Effect</Label>
              <Select
                value={localSettings.transition}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, transition: value })
                }
              >
                <SelectTrigger id="transition">
                  <SelectValue placeholder="Select transition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animation Type */}
            <div className="space-y-2">
              <Label htmlFor="animationType">Slide Animation</Label>
              <Select
                value={localSettings.animationType || 'fade'}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, animationType: value as any })
                }
              >
                <SelectTrigger id="animationType">
                  <SelectValue placeholder="Select animation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade In</SelectItem>
                  <SelectItem value="slide">Slide In</SelectItem>
                  <SelectItem value="zoom">Zoom In</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Animation applied when each slide appears
              </p>
            </div>

            {/* Animation Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animationDuration">Animation Duration</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.animationDuration || 600}ms
                </span>
              </div>
              <Input
                id="animationDuration"
                type="range"
                min={300}
                max={2000}
                step={100}
                value={localSettings.animationDuration || 600}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalSettings({ ...localSettings, animationDuration: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How long the animation takes (300-2000ms)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Carousel Height</Label>
              <Select
                value={localSettings.height}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, height: value })
                }
              >
                <SelectTrigger id="height">
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="sm">Small (300px)</SelectItem>
                  <SelectItem value="md">Medium (400px)</SelectItem>
                  <SelectItem value="lg">Large (500px)</SelectItem>
                  <SelectItem value="xl">Extra Large (600px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Slides Per View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slidesPerView">Slides Per View</Label>
                <span className="text-sm text-muted-foreground font-semibold">
                  {localSettings.slidesPerView || 1}
                </span>
              </div>
              <Input
                id="slidesPerView"
                type="range"
                min={1}
                max={5}
                step={1}
                value={localSettings.slidesPerView || 1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalSettings({ ...localSettings, slidesPerView: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Display multiple slides simultaneously (1-5 slides)
              </p>
            </div>

            {/* Info box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Note:</strong> Each slide can have different media types (image/video). 
                Use "Edit Slide" to configure media type and content for individual slides.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4 mt-4">
            {/* Show Arrows */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="showArrows">Show Navigation Arrows</Label>
                <p className="text-sm text-muted-foreground">
                  Display previous/next buttons
                </p>
              </div>
              <Switch
                id="showArrows"
                checked={localSettings.showArrows}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showArrows: checked })
                }
              />
            </div>

            {/* Arrow Style */}
            {localSettings.showArrows && (
              <div className="space-y-2">
                <Label htmlFor="arrowStyle">Arrow Style</Label>
                <Select
                  value={localSettings.arrowStyle}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, arrowStyle: value })
                  }
                >
                  <SelectTrigger id="arrowStyle">
                    <SelectValue placeholder="Select arrow style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show Indicators */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="showIndicators">Show Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Display slide position indicators
                </p>
              </div>
              <Switch
                id="showIndicators"
                checked={localSettings.showIndicators}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, showIndicators: checked })
                }
              />
            </div>

            {/* Indicator Style */}
            {localSettings.showIndicators && (
              <div className="space-y-2">
                <Label htmlFor="indicatorStyle">Indicator Style</Label>
                <Select
                  value={localSettings.indicatorStyle}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, indicatorStyle: value })
                  }
                >
                  <SelectTrigger id="indicatorStyle">
                    <SelectValue placeholder="Select indicator style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="lines">Lines</SelectItem>
                    <SelectItem value="numbers">Numbers</SelectItem>
                    <SelectItem value="thumbnails">Thumbnails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
