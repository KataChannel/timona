'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, Unlink } from 'lucide-react';
import { AdvancedColorPicker } from './AdvancedColorPicker';

interface BorderValue {
  width: number;
  style: string;
  color: string;
  radius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
}

interface BorderEditorProps {
  value: Partial<BorderValue>;
  onChange: (value: Partial<BorderValue>) => void;
}

const BORDER_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'double', label: 'Double' },
  { value: 'groove', label: 'Groove' },
  { value: 'ridge', label: 'Ridge' },
  { value: 'inset', label: 'Inset' },
  { value: 'outset', label: 'Outset' },
];

const RADIUS_PRESETS = [0, 4, 8, 12, 16, 24, 32, 9999];

export function BorderEditor({ value, onChange }: BorderEditorProps) {
  const [linkedRadius, setLinkedRadius] = useState(true);

  const radius = value.radius || { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };

  const handleRadiusChange = (corner: keyof typeof radius, newValue: number) => {
    if (linkedRadius) {
      onChange({
        ...value,
        radius: {
          topLeft: newValue,
          topRight: newValue,
          bottomRight: newValue,
          bottomLeft: newValue,
        },
      });
    } else {
      onChange({
        ...value,
        radius: { ...radius, [corner]: newValue },
      });
    }
  };

  const handlePresetRadius = (preset: number) => {
    onChange({
      ...value,
      radius: {
        topLeft: preset,
        topRight: preset,
        bottomRight: preset,
        bottomLeft: preset,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Border Width & Style */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Width</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="20"
              value={value.width || 0}
              onChange={(e) => onChange({ width: parseInt(e.target.value) || 0 })}
              className="h-8 text-xs"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Style</Label>
          <select
            value={value.style || 'solid'}
            onChange={(e) => onChange({ style: e.target.value })}
            className="w-full h-8 px-2 text-xs border rounded-md"
          >
            {BORDER_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Border Color */}
      <AdvancedColorPicker
        label="Border Color"
        value={value.color || '#000000'}
        onChange={(color) => onChange({ color })}
        showOpacity={true}
      />

      {/* Border Radius Visual Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Border Radius</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLinkedRadius(!linkedRadius)}
            className="h-6 px-2"
          >
            {linkedRadius ? (
              <Link className="h-3 w-3" />
            ) : (
              <Unlink className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Visual Radius Editor */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
          {/* Top Left */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
            <Input
              type="number"
              min="0"
              value={radius.topLeft}
              onChange={(e) => handleRadiusChange('topLeft', parseInt(e.target.value) || 0)}
              className="w-14 h-7 text-xs text-center"
            />
          </div>

          {/* Top Right */}
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2">
            <Input
              type="number"
              min="0"
              value={radius.topRight}
              onChange={(e) => handleRadiusChange('topRight', parseInt(e.target.value) || 0)}
              className="w-14 h-7 text-xs text-center"
            />
          </div>

          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2">
            <Input
              type="number"
              min="0"
              value={radius.bottomRight}
              onChange={(e) => handleRadiusChange('bottomRight', parseInt(e.target.value) || 0)}
              className="w-14 h-7 text-xs text-center"
            />
          </div>

          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2">
            <Input
              type="number"
              min="0"
              value={radius.bottomLeft}
              onChange={(e) => handleRadiusChange('bottomLeft', parseInt(e.target.value) || 0)}
              className="w-14 h-7 text-xs text-center"
            />
          </div>

          {/* Preview Box */}
          <div
            className="w-full h-24 bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-blue-500 transition-all"
            style={{
              borderTopLeftRadius: `${radius.topLeft}px`,
              borderTopRightRadius: `${radius.topRight}px`,
              borderBottomRightRadius: `${radius.bottomRight}px`,
              borderBottomLeftRadius: `${radius.bottomLeft}px`,
              borderWidth: `${value.width || 0}px`,
              borderStyle: value.style || 'solid',
              borderColor: value.color || '#3B82F6',
            }}
          />
        </div>

        {/* Radius Presets */}
        <div className="flex flex-wrap gap-1">
          {RADIUS_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => handlePresetRadius(preset)}
              className="h-7 px-2 text-xs"
            >
              {preset === 9999 ? '∞' : preset}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
