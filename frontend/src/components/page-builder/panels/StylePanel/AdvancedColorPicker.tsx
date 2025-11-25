'use client';

import React, { useState } from 'react';
import { HexColorPicker, RgbaColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pipette, Palette } from 'lucide-react';

interface AdvancedColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showOpacity?: boolean;
  showGradient?: boolean;
}

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB',
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4',
];

export function AdvancedColorPicker({
  label,
  value,
  onChange,
  showOpacity = true,
  showGradient = false,
}: AdvancedColorPickerProps) {
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid');
  const [isOpen, setIsOpen] = useState(false);

  // Convert hex to rgba if needed
  const getRgbaFromHex = (hex: string): { r: number; g: number; b: number; a: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  };

  const [rgbaColor, setRgbaColor] = useState(getRgbaFromHex(value || '#000000'));

  const handleRgbaChange = (color: { r: number; g: number; b: number; a: number }) => {
    setRgbaColor(color);
    const { r, g, b, a } = color;
    if (a < 1) {
      onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
    } else {
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      
      <div className="flex gap-2">
        {/* Color Preview & Picker Trigger */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-9 p-1"
              style={{ backgroundColor: value || '#ffffff' }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              {/* Color Mode Tabs */}
              {showGradient && (
                <Tabs value={colorMode} onValueChange={(v) => setColorMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="solid">Solid</TabsTrigger>
                    <TabsTrigger value="gradient">Gradient</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Color Picker */}
              {colorMode === 'solid' && (
                <div className="space-y-3">
                  {showOpacity ? (
                    <RgbaColorPicker color={rgbaColor} onChange={handleRgbaChange} />
                  ) : (
                    <HexColorPicker color={value || '#000000'} onChange={onChange} />
                  )}

                  {/* Opacity Slider */}
                  {showOpacity && (
                    <div className="space-y-1">
                      <Label className="text-xs">Opacity</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(rgbaColor.a * 100)}
                          onChange={(e) => {
                            const a = parseInt(e.target.value) / 100;
                            handleRgbaChange({ ...rgbaColor, a });
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs w-10 text-right">
                          {Math.round(rgbaColor.a * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Color Presets */}
                  <div>
                    <Label className="text-xs mb-2 block">Presets</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => onChange(preset)}
                          className="w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: preset }}
                          title={preset}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient Editor (placeholder) */}
              {colorMode === 'gradient' && (
                <div className="text-xs text-gray-500 text-center py-4">
                  Gradient editor coming soon
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Hex Input */}
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 h-9 text-xs font-mono"
        />

        {/* Eyedropper (future) */}
        <Button variant="outline" size="icon" className="h-9 w-9" disabled>
          <Pipette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
