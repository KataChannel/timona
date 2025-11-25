'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, Unlink } from 'lucide-react';

interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface VisualSpacingEditorProps {
  type: 'padding' | 'margin';
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
}

export function VisualSpacingEditor({ type, value, onChange }: VisualSpacingEditorProps) {
  const [isLinked, setIsLinked] = useState(true);

  const handleChange = (side: keyof SpacingValue, val: number) => {
    if (isLinked) {
      onChange({ top: val, right: val, bottom: val, left: val });
    } else {
      onChange({ ...value, [side]: val });
    }
  };

  const handleInputChange = (side: keyof SpacingValue, inputVal: string) => {
    const num = parseInt(inputVal) || 0;
    handleChange(side, num);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium capitalize">{type}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLinked(!isLinked)}
          className="h-6 px-2"
        >
          {isLinked ? <Link className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
        </Button>
      </div>

      {/* Visual Box Model */}
      <div className="relative bg-gray-50 rounded-lg p-4">
        {/* Top */}
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.top}
              onChange={(e) => handleInputChange('top', e.target.value)}
              className="w-16 h-6 text-xs text-center"
              min="0"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>

        {/* Middle (Left, Center, Right) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.left}
              onChange={(e) => handleInputChange('left', e.target.value)}
              className="w-16 h-6 text-xs text-center"
              min="0"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>

          {/* Center Box */}
          <div className={`px-4 py-3 rounded border-2 ${
            type === 'padding' ? 'bg-blue-50 border-blue-300' : 'bg-orange-50 border-orange-300'
          }`}>
            <div className="text-xs font-medium text-center text-gray-600">
              {type === 'padding' ? 'Content' : 'Element'}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.right}
              onChange={(e) => handleInputChange('right', e.target.value)}
              className="w-16 h-6 text-xs text-center"
              min="0"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value.bottom}
              onChange={(e) => handleInputChange('bottom', e.target.value)}
              className="w-16 h-6 text-xs text-center"
              min="0"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-1 left-2 text-[10px] text-gray-400">T</div>
        <div className="absolute bottom-1 left-2 text-[10px] text-gray-400">B</div>
        <div className="absolute top-1/2 -translate-y-1/2 left-1 text-[10px] text-gray-400">L</div>
        <div className="absolute top-1/2 -translate-y-1/2 right-1 text-[10px] text-gray-400">R</div>
      </div>

      {/* Quick Presets */}
      <div className="flex gap-2">
        {[0, 4, 8, 16, 24, 32].map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => onChange({ top: preset, right: preset, bottom: preset, left: preset })}
            className="h-6 px-2 text-xs"
          >
            {preset}
          </Button>
        ))}
      </div>
    </div>
  );
}
