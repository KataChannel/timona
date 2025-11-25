'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Upload, 
  RotateCw, 
  Crop,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  Maximize2,
  Download,
  Link as LinkIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  modelName?: string;
  recordId?: string;
  imageField?: string;
  onUploadComplete?: (result: any) => void;
}

interface ImageEditState {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  blur?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export function ImageUploadComponent({ 
  modelName = 'product', 
  recordId,
  imageField = 'imageUrl',
  onUploadComplete 
}: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [editState, setEditState] = useState<ImageEditState>({
    quality: 80,
    format: 'jpeg'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle paste image
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          setSelectedImage(blob);
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
          };
          reader.readAsDataURL(blob);
          toast.success('Đã paste hình ảnh');
          break;
        }
      }
    }
  };

  // Handle copy from URL
  const handleCopyFromUrl = async () => {
    if (!imageUrl) {
      toast.error('Vui lòng nhập URL hình ảnh');
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      
      setSelectedImage(file);
      setImagePreview(imageUrl);
      toast.success('Đã copy hình ảnh từ URL');
    } catch (error) {
      toast.error('Không thể tải hình ảnh từ URL');
    }
  };

  // Apply image edits
  const applyEdits = () => {
    if (!imagePreview || !canvasRef.current) return;

    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      let width = img.width;
      let height = img.height;

      // Apply resize
      if (editState.resize?.width || editState.resize?.height) {
        width = editState.resize.width || width;
        height = editState.resize.height || height;
      }

      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Apply transformations
      ctx.save();

      // Rotate
      if (editState.rotate) {
        ctx.translate(width / 2, height / 2);
        ctx.rotate((editState.rotate * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);
      }

      // Flip
      if (editState.flip) {
        ctx.translate(0, height);
        ctx.scale(1, -1);
      }

      // Flop
      if (editState.flop) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Apply blur (simplified)
      if (editState.blur) {
        ctx.filter = `blur(${editState.blur}px)`;
      }

      ctx.restore();

      // Update preview
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'edited-image.jpg', { type: `image/${editState.format}` });
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(blob));
        }
      }, `image/${editState.format}`, (editState.quality || 80) / 100);
    };
  };

  // Upload image
  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('Vui lòng chọn hình ảnh');
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Call GraphQL API to upload
      // Mock result
      const mockResult = {
        success: true,
        url: 'https://example.com/uploaded-image.jpg',
        filename: selectedImage.name,
        size: selectedImage.size,
        width: 800,
        height: 600
      };

      setUploadResult(mockResult);
      toast.success('Upload hình ảnh thành công!');

      if (onUploadComplete) {
        onUploadComplete(mockResult);
      }
    } catch (error: any) {
      toast.error(`Lỗi upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload & Edit Hình Ảnh
          </CardTitle>
          <CardDescription>
            Copy/paste, upload hoặc copy từ URL để tải hình ảnh lên
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="upload">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">Copy từ URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn hoặc paste hình ảnh (Ctrl+V)</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onPaste={handlePaste}
                  tabIndex={0}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click để chọn hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hoặc nhấn Ctrl+V để paste hình ảnh
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label>URL hình ảnh</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button onClick={handleCopyFromUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Mapping Configuration */}
          {recordId && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label>Mapping Configuration</Label>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Model:</span>{' '}
                  <Badge variant="outline">{modelName}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Record ID:</span>{' '}
                  <Badge variant="outline">{recordId}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Field:</span>{' '}
                  <Badge variant="outline">{imageField}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview & Edit */}
      {imagePreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-[400px] mx-auto rounded"
              />
            </div>

            {/* Edit Controls */}
            <div className="space-y-4">
              {/* Resize */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    placeholder="Width (px)"
                    onChange={(e) =>
                      setEditState({
                        ...editState,
                        resize: { ...editState.resize, width: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    type="number"
                    placeholder="Height (px)"
                    onChange={(e) =>
                      setEditState({
                        ...editState,
                        resize: { ...editState.resize, height: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              {/* Rotate */}
              <div className="space-y-2">
                <Label>Rotate: {editState.rotate || 0}°</Label>
                <Slider
                  value={[editState.rotate || 0]}
                  onValueChange={(value: number[]) =>
                    setEditState({ ...editState, rotate: value[0] })
                  }
                  min={0}
                  max={360}
                  step={15}
                />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label>Quality: {editState.quality}%</Label>
                <Slider
                  value={[editState.quality || 80]}
                  onValueChange={(value: number[]) =>
                    setEditState({ ...editState, quality: value[0] })
                  }
                  min={1}
                  max={100}
                />
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={editState.format}
                  onValueChange={(value: any) =>
                    setEditState({ ...editState, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transform Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditState({ ...editState, flip: !editState.flip })}
                >
                  <FlipVertical className="mr-2 h-4 w-4" />
                  Flip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditState({ ...editState, flop: !editState.flop })}
                >
                  <FlipHorizontal className="mr-2 h-4 w-4" />
                  Flop
                </Button>
                <Button variant="outline" size="sm" onClick={applyEdits}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Apply Edits
                </Button>
              </div>
            </div>

            {/* Upload Button */}
            <Button onClick={handleUpload} className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload lên MinIO
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Upload Thành Công
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>File name:</span>
              <Badge variant="outline">{uploadResult.filename}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <Badge variant="outline">{(uploadResult.size / 1024).toFixed(2)} KB</Badge>
            </div>
            <div className="flex justify-between">
              <span>Dimensions:</span>
              <Badge variant="outline">
                {uploadResult.width} x {uploadResult.height}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label>URL:</Label>
              <Input value={uploadResult.url} readOnly />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for image editing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
