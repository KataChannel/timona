'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link, Unlink } from 'lucide-react';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

// Storage format (with ResponsiveValue)
interface BorderSettingsStorage {
  width?: number | ResponsiveValue<number>;
  style?: ('solid' | 'dashed' | 'dotted' | 'double' | 'none') | ResponsiveValue<'solid' | 'dashed' | 'dotted' | 'double' | 'none'>;
  color?: string | ResponsiveValue<string>;
  radius?: BorderRadius | ResponsiveValue<BorderRadius>;
}

// Resolved format (without ResponsiveValue, actual values)
interface BorderSettings {
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color?: string;
  radius?: BorderRadius;
}

interface BorderEditorProps {
  settings: BorderSettingsStorage;
  onChange: (settings: BorderSettingsStorage) => void;
  device?: Device;
}

const defaultRadius: BorderRadius = {
  topLeft: 0,
  topRight: 0,
  bottomRight: 0,
  bottomLeft: 0,
};

export function BorderEditor({ settings, onChange, device = 'desktop' }: BorderEditorProps) {
  const [radiusLinked, setRadiusLinked] = useState(true);
  const [isResponsive, setIsResponsive] = useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof BorderSettingsStorage];
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof BorderSettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof BorderSettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<BorderSettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: BorderSettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof BorderSettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof BorderSettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  const updateRadius = (corner: keyof BorderRadius, value: number) => {
    const currentRadius = currentValues.radius || defaultRadius;

    if (radiusLinked) {
      updateSetting('radius', {
        topLeft: value,
        topRight: value,
        bottomRight: value,
        bottomLeft: value,
      });
    } else {
      updateSetting('radius', {
        ...currentRadius,
        [corner]: value,
      });
    }
  };

  const radius = currentValues.radius || defaultRadius;

  return (
    <div className="space-y-6">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('width').desktop || getOverrides('style').desktop || getOverrides('color').desktop || getOverrides('radius').desktop,
          tablet: getOverrides('width').tablet || getOverrides('style').tablet || getOverrides('color').tablet || getOverrides('radius').tablet,
          mobile: getOverrides('width').mobile || getOverrides('style').mobile || getOverrides('color').mobile || getOverrides('radius').mobile,
        }}
        label="Border"
      />

      {/* Border Width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Border Width</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{currentValues.width || 1}px</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('width')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={0}
          max={10}
          step={1}
          value={currentValues.width || 1}
          onChange={(e) => updateSetting('width', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Border Style */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Border Style</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('style')[device] || false}
              device={device}
            />
          )}
        </div>
        <Select
          value={currentValues.style || 'solid'}
          onValueChange={(value: any) => updateSetting('style', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="solid">Solid ────</SelectItem>
            <SelectItem value="dashed">Dashed ─ ─ ─</SelectItem>
            <SelectItem value="dotted">Dotted · · · ·</SelectItem>
            <SelectItem value="double">Double ═══</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Border Color */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Border Color</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('color')[device] || false}
              device={device}
            />
          )}
        </div>
        <div className="flex gap-2">
          <Input
            type="color"
            value={currentValues.color || '#000000'}
            onChange={(e) => updateSetting('color', e.target.value)}
            className="w-16 h-10"
          />
          <Input
            type="text"
            value={currentValues.color || '#000000'}
            onChange={(e) => updateSetting('color', e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Border Radius</Label>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('radius')[device] || false}
                device={device}
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setRadiusLinked(!radiusLinked)}
          >
            {radiusLinked ? (
              <Link className="w-4 h-4" />
            ) : (
              <Unlink className="w-4 h-4" />
            )}
          </Button>
        </div>

        {radiusLinked ? (
          // Single radius input
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>All Corners</span>
              <span>{radius.topLeft}px</span>
            </div>
            <Input
              type="range"
              min={0}
              max={50}
              step={2}
              value={radius.topLeft}
              onChange={(e) => updateRadius('topLeft', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ) : (
          // Individual corner inputs
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Top Left</div>
              <Input
                type="number"
                min={0}
                max={50}
                value={radius.topLeft}
                onChange={(e) => updateRadius('topLeft', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500">Top Right</div>
              <Input
                type="number"
                min={0}
                max={50}
                value={radius.topRight}
                onChange={(e) => updateRadius('topRight', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500">Bottom Left</div>
              <Input
                type="number"
                min={0}
                max={50}
                value={radius.bottomLeft}
                onChange={(e) => updateRadius('bottomLeft', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500">Bottom Right</div>
              <Input
                type="number"
                min={0}
                max={50}
                value={radius.bottomRight}
                onChange={(e) => updateRadius('bottomRight', parseInt(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual Preview */}
      <div className="mt-4 p-4 bg-gray-50 rounded flex items-center justify-center">
        <div
          className="w-24 h-24 bg-white"
          style={{
            borderWidth: `${currentValues.width || 0}px`,
            borderStyle: currentValues.style || 'solid',
            borderColor: currentValues.color || '#000000',
            borderTopLeftRadius: `${radius.topLeft}px`,
            borderTopRightRadius: `${radius.topRight}px`,
            borderBottomRightRadius: `${radius.bottomRight}px`,
            borderBottomLeftRadius: `${radius.bottomLeft}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            Preview
          </div>
        </div>
      </div>
    </div>
  );
}
