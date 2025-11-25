'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  StretchHorizontal,
  LayoutGrid,
  Rows,
  Columns,
} from 'lucide-react';

interface LayoutValue {
  display?: 'flex' | 'grid' | 'block' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: number;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

interface LayoutEditorProps {
  value: Partial<LayoutValue>;
  onChange: (value: Partial<LayoutValue>) => void;
}

export function LayoutEditor({ value, onChange }: LayoutEditorProps) {
  const display = value.display || 'flex';
  const isFlex = display === 'flex';
  const isGrid = display === 'grid';

  return (
    <div className="space-y-4">
      {/* Display Mode */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Display</Label>
        <Tabs value={display} onValueChange={(v) => onChange({ display: v as any })}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="block" className="text-xs">Block</TabsTrigger>
            <TabsTrigger value="flex" className="text-xs">Flex</TabsTrigger>
            <TabsTrigger value="grid" className="text-xs">Grid</TabsTrigger>
            <TabsTrigger value="inline-block" className="text-xs">Inline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Flexbox Controls */}
      {isFlex && (
        <div className="space-y-4">
          {/* Flex Direction */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Direction</Label>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={value.flexDirection === 'row' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ flexDirection: 'row' })}
                className="h-8"
              >
                <Rows className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant={value.flexDirection === 'column' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ flexDirection: 'column' })}
                className="h-8"
              >
                <Columns className="h-4 w-4" />
              </Button>
              <Button
                variant={value.flexDirection === 'row-reverse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ flexDirection: 'row-reverse' })}
                className="h-8"
              >
                <Rows className="h-4 w-4 rotate-90 scale-x-[-1]" />
              </Button>
              <Button
                variant={value.flexDirection === 'column-reverse' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ flexDirection: 'column-reverse' })}
                className="h-8"
              >
                <Columns className="h-4 w-4 scale-y-[-1]" />
              </Button>
            </div>
          </div>

          {/* Justify Content */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Justify</Label>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={value.justifyContent === 'flex-start' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ justifyContent: 'flex-start' })}
                className="h-8"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={value.justifyContent === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ justifyContent: 'center' })}
                className="h-8"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={value.justifyContent === 'flex-end' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ justifyContent: 'flex-end' })}
                className="h-8"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant={value.justifyContent === 'space-between' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ justifyContent: 'space-between' })}
                className="h-8 col-span-3"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Align Items */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Align</Label>
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={value.alignItems === 'flex-start' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ alignItems: 'flex-start' })}
                className="h-8"
              >
                <AlignStartVertical className="h-4 w-4" />
              </Button>
              <Button
                variant={value.alignItems === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ alignItems: 'center' })}
                className="h-8"
              >
                <AlignCenterVertical className="h-4 w-4" />
              </Button>
              <Button
                variant={value.alignItems === 'flex-end' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ alignItems: 'flex-end' })}
                className="h-8"
              >
                <AlignEndVertical className="h-4 w-4" />
              </Button>
              <Button
                variant={value.alignItems === 'stretch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ alignItems: 'stretch' })}
                className="h-8"
              >
                <StretchHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Flex Wrap */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Wrap</Label>
            <Tabs
              value={value.flexWrap || 'nowrap'}
              onValueChange={(v) => onChange({ flexWrap: v as any })}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nowrap" className="text-xs">No Wrap</TabsTrigger>
                <TabsTrigger value="wrap" className="text-xs">Wrap</TabsTrigger>
                <TabsTrigger value="wrap-reverse" className="text-xs">Reverse</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Gap */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Gap</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={value.gap || 0}
                onChange={(e) => onChange({ gap: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid Controls */}
      {isGrid && (
        <div className="space-y-4">
          {/* Grid Columns */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Columns</Label>
            <Input
              value={value.gridTemplateColumns || 'repeat(3, 1fr)'}
              onChange={(e) => onChange({ gridTemplateColumns: e.target.value })}
              placeholder="repeat(3, 1fr)"
              className="h-8 text-xs font-mono"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 6].map((cols) => (
                <Button
                  key={cols}
                  variant="outline"
                  size="sm"
                  onClick={() => onChange({ gridTemplateColumns: `repeat(${cols}, 1fr)` })}
                  className="h-6 px-2 text-xs"
                >
                  {cols}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Rows</Label>
            <Input
              value={value.gridTemplateRows || 'auto'}
              onChange={(e) => onChange({ gridTemplateRows: e.target.value })}
              placeholder="auto"
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Gap */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Gap</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={value.gap || 0}
                onChange={(e) => onChange({ gap: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
