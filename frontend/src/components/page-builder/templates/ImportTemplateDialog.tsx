/**
 * PageBuilder Template System - Import Template Dialog
 * Phase 5.3: Template Operations
 * 
 * Dialog for importing templates from JSON files
 */

'use client';

import React, { useState, useRef } from 'react';
import { PageTemplate, TemplateCategory, ImportTemplateData } from '@/types/template';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (templateData: ImportTemplateData) => Promise<boolean>;
}

export function ImportTemplateDialog({
  isOpen,
  onClose,
  onImport,
}: ImportTemplateDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PageTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate template structure
  const validateTemplate = (data: any): string | null => {
    if (!data.name || typeof data.name !== 'string') {
      return 'Template must have a name';
    }
    if (!data.category || typeof data.category !== 'string') {
      return 'Template must have a category';
    }
    if (!Array.isArray(data.structure)) {
      return 'Template must have a structure array';
    }
    if (data.structure.length === 0) {
      return 'Template structure cannot be empty';
    }

    // Validate structure elements
    for (const element of data.structure) {
      if (!element.id || !element.type) {
        return 'All elements must have id and type';
      }
    }

    return null;
  };

  // Handle file selection
  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setPreviewData(null);

    // Check file type
    if (!selectedFile.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);

    // Read and parse file
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);

      // Validate structure
      const validationError = validateTemplate(data);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }

      // Set preview data
      setPreviewData(data as PageTemplate);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON file format');
      } else {
        setError('Failed to read file');
      }
      setFile(null);
    }
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!previewData) return;

    setIsImporting(true);
    setError(null);

    try {
      const importData: ImportTemplateData = {
        template: previewData,
        replaceExisting: false, // Could be made configurable
      };

      const success = await onImport(importData);

      if (success) {
        handleClose();
      } else {
        setError('Failed to import template. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setIsDragging(false);
    onClose();
  };

  // Count elements
  const countElements = (elements: any[]): number => {
    let count = elements.length;
    elements.forEach(el => {
      if (el.children && Array.isArray(el.children)) {
        count += countElements(el.children);
      }
    });
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Import a template from a JSON file. The file will be validated before import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          {!file && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragging ? 'Drop file here' : 'Drop JSON file here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileChange(files[0]);
                  }
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Preview */}
          {previewData && (
            <div className="space-y-4">
              {/* Success Badge */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Template file validated successfully
                </AlertDescription>
              </Alert>

              {/* File Info */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{file?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPreviewData(null);
                      setError(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {(file!.size / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Template Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {previewData.name}
                  </h4>
                  <p className="text-sm text-gray-600">{previewData.description}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <Badge variant="outline" className="mt-1">
                      {previewData.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Elements</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {countElements(previewData.structure)}
                    </p>
                  </div>
                  {previewData.author && (
                    <div>
                      <p className="text-xs text-gray-500">Author</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {previewData.author}
                      </p>
                    </div>
                  )}
                  {previewData.createdAt && (
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {new Date(previewData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {previewData.tags && previewData.tags.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {previewData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!previewData || isImporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isImporting ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-pulse" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
