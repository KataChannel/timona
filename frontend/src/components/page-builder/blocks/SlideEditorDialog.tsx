'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Pencil } from 'lucide-react';

interface CarouselSlide {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'embed';
  mediaOnly?: boolean; // Show only media, hide all text content
  cta?: {
    text: string;
    link: string;
  };
  badge?: string;
  bgColor?: string;
  textColor?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'background';
  imageOverlay?: number;
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
}

interface SlideEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: CarouselSlide;
  onSave: (slide: CarouselSlide) => void;
}

export function SlideEditorDialog({ open, onOpenChange, slide, onSave }: SlideEditorDialogProps) {
  const [localSlide, setLocalSlide] = useState(slide);

  const handleSave = () => {
    onSave(localSlide);
  };

  const bgColorPresets = [
    { value: 'bg-gradient-to-r from-blue-500 to-purple-600', label: 'Blue to Purple' },
    { value: 'bg-gradient-to-r from-green-400 to-blue-500', label: 'Green to Blue' },
    { value: 'bg-gradient-to-r from-pink-500 to-yellow-500', label: 'Pink to Yellow' },
    { value: 'bg-gradient-to-r from-red-500 to-orange-500', label: 'Red to Orange' },
    { value: 'bg-gradient-to-r from-purple-400 to-pink-600', label: 'Purple to Pink' },
    { value: 'bg-gray-900', label: 'Dark Gray' },
    { value: 'bg-white', label: 'White' },
  ];

  const textColorPresets = [
    { value: 'text-white', label: 'White' },
    { value: 'text-black', label: 'Black' },
    { value: 'text-gray-900', label: 'Dark Gray' },
    { value: 'text-blue-600', label: 'Blue' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Slide
          </DialogTitle>
          <DialogDescription>
            Customize slide content and appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Media Only Warning */}
            {localSlide.mediaOnly && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Media Only Mode Active</h4>
                    <p className="text-sm text-amber-800">
                      Content fields below will be hidden when "Show Media Only" is enabled. 
                      Go to <strong>Media</strong> tab to disable this mode if you want to show text content.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Badge */}
            <div className="space-y-2">
              <Label htmlFor="badge">Badge (Optional)</Label>
              <Input
                id="badge"
                value={localSlide.badge || ''}
                onChange={(e) =>
                  setLocalSlide({ ...localSlide, badge: e.target.value })
                }
                placeholder="e.g., NEW, SALE, HOT"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={localSlide.title || ''}
                onChange={(e) =>
                  setLocalSlide({ ...localSlide, title: e.target.value })
                }
                placeholder="Enter slide title"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                value={localSlide.subtitle || ''}
                onChange={(e) =>
                  setLocalSlide({ ...localSlide, subtitle: e.target.value })
                }
                placeholder="Enter slide subtitle"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={localSlide.description || ''}
                onChange={(e) =>
                  setLocalSlide({ ...localSlide, description: e.target.value })
                }
                placeholder="Enter slide description"
                rows={3}
              />
            </div>

            {/* CTA */}
            <div className="space-y-4 pt-2">
              <Label>Call to Action (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText" className="text-sm">Button Text</Label>
                  <Input
                    id="ctaText"
                    value={localSlide.cta?.text || ''}
                    onChange={(e) =>
                      setLocalSlide({
                        ...localSlide,
                        cta: { ...localSlide.cta, text: e.target.value, link: localSlide.cta?.link || '' },
                      })
                    }
                    placeholder="e.g., Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLink" className="text-sm">Button Link</Label>
                  <Input
                    id="ctaLink"
                    value={localSlide.cta?.link || ''}
                    onChange={(e) =>
                      setLocalSlide({
                        ...localSlide,
                        cta: { ...localSlide.cta, link: e.target.value, text: localSlide.cta?.text || '' },
                      })
                    }
                    placeholder="e.g., /products"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            {/* Show Media Only Toggle */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="mediaOnly" className="text-base font-semibold text-purple-900">
                    🎯 Show Media Only
                  </Label>
                  <p className="text-sm text-purple-700">
                    Display only media (image/video) - hide all text content (title, description, etc.)
                  </p>
                </div>
                <Switch
                  id="mediaOnly"
                  checked={localSlide.mediaOnly || false}
                  onCheckedChange={(checked) =>
                    setLocalSlide({ ...localSlide, mediaOnly: checked })
                  }
                />
              </div>
              {localSlide.mediaOnly && (
                <div className="mt-3 p-3 bg-white rounded border border-purple-200">
                  <p className="text-sm text-purple-800">
                    ✓ <strong>Media Only Mode Active:</strong> Only media will be displayed. All text content will be hidden.
                  </p>
                </div>
              )}
            </div>

            {/* Media Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <Select
                value={localSlide.mediaType || 'image'}
                onValueChange={(value: any) =>
                  setLocalSlide({ ...localSlide, mediaType: value })
                }
              >
                <SelectTrigger id="mediaType">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">📷 Image</SelectItem>
                  <SelectItem value="video">🎬 Video URL</SelectItem>
                  <SelectItem value="embed">📺 Video Embed (YouTube/Vimeo)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the type of media to display on this slide
              </p>
            </div>

            {/* Media Type Guide */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">📚 Media Type Guide</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📷</span>
                  <div>
                    <strong className="text-blue-900">Image</strong>
                    <p className="text-blue-700">Display static images with customizable position and overlay</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🎬</span>
                  <div>
                    <strong className="text-blue-900">Video URL</strong>
                    <p className="text-blue-700">Direct video file (MP4, WebM) - plays inline with controls</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">📺</span>
                  <div>
                    <strong className="text-blue-900">Video Embed</strong>
                    <p className="text-blue-700">YouTube, Vimeo embeds - responsive player with full features</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Controls - Only show for image type */}
            {(!localSlide.mediaType || localSlide.mediaType === 'image') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={localSlide.image || ''}
                    onChange={(e) =>
                      setLocalSlide({ ...localSlide, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  {localSlide.image && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={localSlide.image}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagePosition">Image Position</Label>
                  <Select
                    value={localSlide.imagePosition || 'right'}
                    onValueChange={(value: any) =>
                      setLocalSlide({ ...localSlide, imagePosition: value })
                    }
                  >
                    <SelectTrigger id="imagePosition">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="background">Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {localSlide.imagePosition === 'background' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="imageOverlay">Image Overlay</Label>
                      <span className="text-sm text-muted-foreground">
                        {localSlide.imageOverlay || 50}%
                      </span>
                    </div>
                    <Input
                      id="imageOverlay"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={localSlide.imageOverlay || 50}
                      onChange={(e) =>
                        setLocalSlide({ ...localSlide, imageOverlay: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Darkness of overlay on background image
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Video Controls - Only show for video and embed types */}
            {(localSlide.mediaType === 'video' || localSlide.mediaType === 'embed') && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">
                  {localSlide.mediaType === 'embed' ? 'Video Embed URL' : 'Video File URL'}
                </Label>
                <Input
                  id="videoUrl"
                  value={localSlide.videoUrl || ''}
                  onChange={(e) =>
                    setLocalSlide({ ...localSlide, videoUrl: e.target.value })
                  }
                  placeholder={
                    localSlide.mediaType === 'embed'
                      ? 'https://www.youtube.com/watch?v=... or https://vimeo.com/...'
                      : 'https://example.com/video.mp4'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {localSlide.mediaType === 'embed'
                    ? 'Supports YouTube, Vimeo, and other embed services'
                    : 'Direct link to video file (MP4, WebM, etc.)'}
                </p>
                {localSlide.videoUrl && localSlide.mediaType === 'embed' && (
                  <div className="mt-2 border rounded-lg overflow-hidden bg-gray-100 p-4">
                    <p className="text-sm text-gray-600">
                      ✓ Video URL detected. Will be embedded in the slide.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Current Configuration Summary */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                ✓ Current Configuration
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Media Type:</span>
                  <span className="font-medium capitalize px-2 py-1 bg-white rounded border">
                    {localSlide.mediaType === 'image' && '📷 Image'}
                    {localSlide.mediaType === 'video' && '🎬 Video'}
                    {localSlide.mediaType === 'embed' && '📺 Embed'}
                    {!localSlide.mediaType && '📷 Image (default)'}
                  </span>
                </div>
                {localSlide.image && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Image URL:</span>
                    <span className="font-medium text-xs truncate max-w-[200px] text-green-600">
                      ✓ Set
                    </span>
                  </div>
                )}
                {localSlide.videoUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Video URL:</span>
                    <span className="font-medium text-xs truncate max-w-[200px] text-green-600">
                      ✓ Set
                    </span>
                  </div>
                )}
                {localSlide.imagePosition && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium capitalize">
                      {localSlide.imagePosition}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">💡 Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                <li>Use high-quality images (1920x1080 recommended)</li>
                <li>Video embeds are more performant than video files</li>
                <li>Background images work best with overlay enabled</li>
                <li>Each slide can have different media types</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4 mt-4">
            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <Select
                value={localSlide.bgColor}
                onValueChange={(value) =>
                  setLocalSlide({ ...localSlide, bgColor: value })
                }
              >
                <SelectTrigger id="bgColor">
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  {bgColorPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${preset.value}`} />
                        {preset.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localSlide.bgColor && (
                <div className={`w-full h-12 rounded ${localSlide.bgColor}`} />
              )}
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Select
                value={localSlide.textColor}
                onValueChange={(value) =>
                  setLocalSlide({ ...localSlide, textColor: value })
                }
              >
                <SelectTrigger id="textColor">
                  <SelectValue placeholder="Select text color" />
                </SelectTrigger>
                <SelectContent>
                  {textColorPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${preset.value} bg-current`} />
                        {preset.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Animation */}
            <div className="space-y-2">
              <Label htmlFor="animation">Animation (Coming Soon)</Label>
              <Select
                value={localSlide.animation || 'slide'}
                onValueChange={(value: any) =>
                  setLocalSlide({ ...localSlide, animation: value })
                }
                disabled
              >
                <SelectTrigger id="animation">
                  <SelectValue placeholder="Select animation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Slide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
