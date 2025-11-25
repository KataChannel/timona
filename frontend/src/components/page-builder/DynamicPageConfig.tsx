'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link2 } from 'lucide-react';
import type { DynamicConfig, DataBinding, PageBlock } from '@/types/page-builder';

interface DynamicPageConfigProps {
  config?: DynamicConfig;
  blocks?: PageBlock[];
  onChange: (config: DynamicConfig) => void;
}

export function DynamicPageConfig({ config, blocks = [], onChange }: DynamicPageConfigProps) {
  const [localConfig, setLocalConfig] = React.useState<DynamicConfig>(
    config || {
      dataSource: 'product',
      slugPattern: '',
      slugField: 'slug',
      dataBindings: [],
    }
  );

  const updateConfig = (updates: Partial<DynamicConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const addBinding = () => {
    const newBinding: DataBinding = {
      blockId: '',
      sourceField: '',
      targetProperty: 'content.html',
    };
    updateConfig({
      dataBindings: [...localConfig.dataBindings, newBinding],
    });
  };

  const updateBinding = (index: number, updates: Partial<DataBinding>) => {
    const newBindings = [...localConfig.dataBindings];
    newBindings[index] = { ...newBindings[index], ...updates };
    updateConfig({ dataBindings: newBindings });
  };

  const removeBinding = (index: number) => {
    updateConfig({
      dataBindings: localConfig.dataBindings.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 border-l-4 border-blue-500 pl-4">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Link2 className="w-4 h-4" />
        Dynamic Configuration
      </h3>

      {/* Data Source */}
      <div className="space-y-2">
        <Label className="text-sm">Data Source</Label>
        <Select
          value={localConfig.dataSource}
          onValueChange={(value) => updateConfig({ dataSource: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="post">Blog Post</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="custom">Custom API</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Slug Pattern */}
      <div className="space-y-2">
        <Label className="text-sm">URL Pattern</Label>
        <Input
          value={localConfig.slugPattern}
          onChange={(e) => updateConfig({ slugPattern: e.target.value })}
          placeholder="/product/:productSlug"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Use <code className="bg-gray-100 px-1 rounded">:paramName</code> for dynamic segments
        </p>
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label className="text-sm">Slug Field Name</Label>
        <Input
          value={localConfig.slugField}
          onChange={(e) => updateConfig({ slugField: e.target.value })}
          placeholder="slug"
          className="font-mono text-sm"
        />
      </div>

      {/* Data Bindings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Data Bindings</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBinding}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Binding
          </Button>
        </div>

        {localConfig.dataBindings.map((binding, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Block Selection */}
            <div className="col-span-4">
              <Label className="text-xs text-gray-600">Block</Label>
              <Select
                value={binding.blockId}
                onValueChange={(value) => updateBinding(index, { blockId: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block.id} value={block.id}>
                      {block.type} - {block.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Field */}
            <div className="col-span-3">
              <Label className="text-xs text-gray-600">Source Field</Label>
              <Input
                value={binding.sourceField}
                onChange={(e) => updateBinding(index, { sourceField: e.target.value })}
                placeholder="name"
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Target Property */}
            <div className="col-span-4">
              <Label className="text-xs text-gray-600">Target Property</Label>
              <Input
                value={binding.targetProperty}
                onChange={(e) => updateBinding(index, { targetProperty: e.target.value })}
                placeholder="content.html"
                className="h-8 text-xs font-mono"
              />
            </div>

            {/* Remove Button */}
            <div className="col-span-1 flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBinding(index)}
                className="h-8 w-8 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {localConfig.dataBindings.length === 0 && (
          <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">
            No data bindings configured. Click &quot;Add Binding&quot; to start.
          </div>
        )}
      </div>
    </div>
  );
}

