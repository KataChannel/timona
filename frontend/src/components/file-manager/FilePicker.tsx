'use client';

import React, { useState } from 'react';
import { FileManager } from './FileManager';
import { File, FileType } from '@/types/file';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';

interface FilePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: File | string) => void;
  allowMultiple?: boolean;
  fileTypes?: FileType[];
  allowUrl?: boolean;
}

export function FilePicker({
  open,
  onOpenChange,
  onSelect,
  allowMultiple = false,
  fileTypes,
  allowUrl = true,
}: FilePickerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'url'>('browse');

  const handleSelect = () => {
    if (activeTab === 'browse' && selectedFile) {
      onSelect(selectedFile);
      onOpenChange(false);
      setSelectedFile(null);
    } else if (activeTab === 'url' && urlInput.trim()) {
      onSelect(urlInput.trim());
      onOpenChange(false);
      setUrlInput('');
    }
  };

  const handleFileSelection = (file: File) => {
    console.log('FilePicker: File selected', file);
    if (!allowMultiple) {
      // Single select mode: auto-select and close
      console.log('FilePicker: Auto-selecting in single mode');
      onSelect(file);
      onOpenChange(false);
      setSelectedFile(null);
    } else {
      // Multiple select mode: store selection (to be implemented)
      setSelectedFile(file);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setUrlInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select File</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Files</TabsTrigger>
            {allowUrl && <TabsTrigger value="url">Enter URL</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-hidden">
            <div className="h-full">
              <FileManager
                onSelect={handleFileSelection}
                allowMultiple={allowMultiple}
                fileTypes={fileTypes}
              />
            </div>
          </TabsContent>

          {allowUrl && (
            <TabsContent value="url" className="flex-1">
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Image URL</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="url-input"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter a direct URL to an image file
                  </p>
                </div>

                {/* Preview */}
                {urlInput && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md aspect-video flex items-center justify-center overflow-hidden">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={
              (activeTab === 'browse' && !selectedFile) ||
              (activeTab === 'url' && !urlInput.trim())
            }
          >
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
