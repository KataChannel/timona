'use client';

import React, { useState, useCallback } from 'react';
import { X, Palette, Type, Layout, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface TemplateCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    template: string;
    data: any;
  };
  onApply: (customizedTemplate: any) => void;
}

export const TemplateCustomizationModal: React.FC<TemplateCustomizationModalProps> = ({
  isOpen,
  onClose,
  template,
  onApply,
}) => {
  const [customization, setCustomization] = useState({
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      text: '#374151',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingSize: 'large',
      bodySize: 'medium',
    },
    layout: {
      spacing: 'normal',
      borderRadius: 'medium',
      shadow: 'medium',
      animation: 'enabled',
    },
    content: {
      title: '',
      subtitle: '',
      ctaText: 'Get Started',
    },
  });

  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState('desktop');

  // Handle customization changes
  const updateCustomization = useCallback((section: string, field: string, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  }, []);

  // Generate customized template
  const generateCustomTemplate = useCallback(() => {
    let customTemplate = template.template;
    
    // Apply color customizations
    customTemplate = customTemplate.replace(/bg-blue-500/g, `bg-[${customization.colors.primary}]`);
    customTemplate = customTemplate.replace(/bg-purple-500/g, `bg-[${customization.colors.secondary}]`);
    customTemplate = customTemplate.replace(/text-gray-900/g, `text-[${customization.colors.text}]`);
    
    // Apply typography customizations
    if (customization.typography.headingSize === 'small') {
      customTemplate = customTemplate.replace(/text-3xl/g, 'text-2xl');
      customTemplate = customTemplate.replace(/text-5xl/g, 'text-4xl');
    } else if (customization.typography.headingSize === 'large') {
      customTemplate = customTemplate.replace(/text-2xl/g, 'text-3xl');
      customTemplate = customTemplate.replace(/text-3xl/g, 'text-4xl');
    }
    
    // Apply layout customizations
    if (customization.layout.borderRadius === 'none') {
      customTemplate = customTemplate.replace(/rounded-lg/g, 'rounded-none');
    } else if (customization.layout.borderRadius === 'large') {
      customTemplate = customTemplate.replace(/rounded-lg/g, 'rounded-2xl');
    }
    
    return customTemplate;
  }, [template.template, customization]);

  // Apply customized template
  const handleApply = useCallback(() => {
    const customizedTemplate = {
      ...template,
      template: generateCustomTemplate(),
      customization,
      data: {
        ...template.data,
        ...customization.content,
      },
    };
    
    onApply(customizedTemplate);
    onClose();
  }, [template, customization, generateCustomTemplate, onApply, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 border-b bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Customize {template.name}
              </h2>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(
                previewMode === 'desktop' ? 'mobile' : 'desktop'
              )}>
                <Layout className="h-4 w-4 mr-1" />
                {previewMode === 'desktop' ? 'Mobile' : 'Desktop'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full pt-20">
          {/* Customization Panel */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 m-4">
                <TabsTrigger value="colors" className="text-xs">
                  <Palette className="h-3 w-3 mr-1" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="typography" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">
                  <Layout className="h-3 w-3 mr-1" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="content" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Content
                </TabsTrigger>
              </TabsList>

              <div className="p-4 space-y-6">
                {/* Colors Tab */}
                <TabsContent value="colors" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Color Scheme</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(customization.colors).map(([key, value]) => (
                        <div key={key}>
                          <Label className="text-xs font-medium capitalize">{key}</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => updateCustomization('colors', key, e.target.value)}
                              className="w-8 h-8 rounded border"
                            />
                            <Input
                              value={value}
                              onChange={(e) => updateCustomization('colors', key, e.target.value)}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Typography Tab */}
                <TabsContent value="typography" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Font Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">Heading Font</Label>
                        <Select
                          value={customization.typography.headingFont}
                          onValueChange={(value) => updateCustomization('typography', 'headingFont', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Poppins">Poppins</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium">Heading Size</Label>
                        <Select
                          value={customization.typography.headingSize}
                          onValueChange={(value) => updateCustomization('typography', 'headingSize', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Layout Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium">Border Radius</Label>
                        <Select
                          value={customization.layout.borderRadius}
                          onValueChange={(value) => updateCustomization('layout', 'borderRadius', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Animations</Label>
                        <Switch
                          checked={customization.layout.animation === 'enabled'}
                          onCheckedChange={(checked) => 
                            updateCustomization('layout', 'animation', checked ? 'enabled' : 'disabled')
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Content Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">Title</Label>
                        <Input
                          value={customization.content.title}
                          onChange={(e) => updateCustomization('content', 'title', e.target.value)}
                          placeholder="Enter title"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium">Subtitle</Label>
                        <Textarea
                          value={customization.content.subtitle}
                          onChange={(e) => updateCustomization('content', 'subtitle', e.target.value)}
                          placeholder="Enter subtitle"
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium">CTA Text</Label>
                        <Input
                          value={customization.content.ctaText}
                          onChange={(e) => updateCustomization('content', 'ctaText', e.target.value)}
                          placeholder="Enter CTA text"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Live Preview</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {previewMode === 'desktop' ? '1200px' : '375px'} viewport
                  </div>
                </div>
                
                <div className="p-6">
                  <div 
                    className={`mx-auto transition-all duration-300 ${
                      previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
                    }`}
                    dangerouslySetInnerHTML={{ __html: generateCustomTemplate() }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Preview updates automatically as you customize
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply} className="bg-gradient-to-r from-purple-500 to-blue-500">
                Apply Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};