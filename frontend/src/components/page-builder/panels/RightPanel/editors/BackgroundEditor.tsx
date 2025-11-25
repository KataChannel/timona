'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

interface GradientValue {
  type: 'linear' | 'radial';
  colors: string[];
  angle: number;
}

interface ImageValue {
  url: string;
  size: 'cover' | 'contain' | 'auto';
  position: string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
}

interface OverlayValue {
  color: string;
  opacity: number;
}

// Storage format (with ResponsiveValue)
interface BackgroundSettingsStorage {
  type?: ('color' | 'gradient' | 'image') | ResponsiveValue<'color' | 'gradient' | 'image'>;
  color?: string | ResponsiveValue<string>;
  gradient?: GradientValue | ResponsiveValue<GradientValue>;
  image?: ImageValue | ResponsiveValue<ImageValue>;
  overlay?: OverlayValue | ResponsiveValue<OverlayValue>;
}

// Resolved format (without ResponsiveValue, actual values)
interface BackgroundSettings {
  type?: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: GradientValue;
  image?: ImageValue;
  overlay?: OverlayValue;
}

interface BackgroundEditorProps {
  settings: BackgroundSettingsStorage;
  onChange: (settings: BackgroundSettingsStorage) => void;
  device?: Device;
}

export function BackgroundEditor({ settings, onChange, device = 'desktop' }: BackgroundEditorProps) {
  const [isResponsive, setIsResponsive] = React.useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof BackgroundSettingsStorage];
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof BackgroundSettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof BackgroundSettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<BackgroundSettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: BackgroundSettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof BackgroundSettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof BackgroundSettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  const updateGradient = (key: string, value: any) => {
    updateSetting('gradient', {
      ...(currentValues.gradient || { type: 'linear', colors: ['#000000', '#ffffff'], angle: 0 }),
      [key]: value,
    });
  };

  const updateImage = (key: string, value: any) => {
    updateSetting('image', {
      ...(currentValues.image || { url: '', size: 'cover', position: 'center', repeat: 'no-repeat' }),
      [key]: value,
    });
  };

  const updateOverlay = (key: string, value: any) => {
    updateSetting('overlay', {
      ...(currentValues.overlay || { color: '#000000', opacity: 50 }),
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('type').desktop || getOverrides('color').desktop || getOverrides('gradient').desktop || getOverrides('image').desktop || getOverrides('overlay').desktop,
          tablet: getOverrides('type').tablet || getOverrides('color').tablet || getOverrides('gradient').tablet || getOverrides('image').tablet || getOverrides('overlay').tablet,
          mobile: getOverrides('type').mobile || getOverrides('color').mobile || getOverrides('gradient').mobile || getOverrides('image').mobile || getOverrides('overlay').mobile,
        }}
        label="Background"
      />

      {/* Background Type */}
      <Tabs value={currentValues.type || 'color'} onValueChange={(v: any) => updateSetting('type', v)}>
        <TabsList className="w-full">
          <TabsTrigger value="color" className="flex-1">Color</TabsTrigger>
          <TabsTrigger value="gradient" className="flex-1">Gradient</TabsTrigger>
          <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
        </TabsList>

        {/* Color Tab */}
        <TabsContent value="color" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Background Color</Label>
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
                value={currentValues.color || '#ffffff'}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={currentValues.color || ''}
                onChange={(e) => updateSetting('color', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>

        {/* Gradient Tab */}
        <TabsContent value="gradient" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gradient Type</Label>
              {isResponsive && (
                <ResponsiveIndicator
                  hasOverride={getOverrides('gradient')[device] || false}
                  device={device}
                />
              )}
            </div>
            <Select
              value={currentValues.gradient?.type || 'linear'}
              onValueChange={(value: any) => updateGradient('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Color</Label>
            <Input
              type="color"
              value={currentValues.gradient?.colors?.[0] || '#000000'}
              onChange={(e) => {
                const colors = [...(currentValues.gradient?.colors || ['#000000', '#ffffff'])];
                colors[0] = e.target.value;
                updateGradient('colors', colors);
              }}
              className="w-full h-10 p-1 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label>End Color</Label>
            <Input
              type="color"
              value={currentValues.gradient?.colors?.[1] || '#ffffff'}
              onChange={(e) => {
                const colors = [...(currentValues.gradient?.colors || ['#000000', '#ffffff'])];
                colors[1] = e.target.value;
                updateGradient('colors', colors);
              }}
              className="w-full h-10 p-1 cursor-pointer"
            />
          </div>

          {currentValues.gradient?.type === 'linear' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Angle</Label>
                <span className="text-sm text-gray-500">{currentValues.gradient?.angle || 0}°</span>
              </div>
              <Input
                type="range"
                min={0}
                max={360}
                step={15}
                value={currentValues.gradient?.angle || 0}
                onChange={(e) => updateGradient('angle', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Image URL</Label>
              {isResponsive && (
                <ResponsiveIndicator
                  hasOverride={getOverrides('image')[device] || false}
                  device={device}
                />
              )}
            </div>
            <Input
              type="text"
              value={currentValues.image?.url || ''}
              onChange={(e) => updateImage('url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Background Size</Label>
            <Select
              value={currentValues.image?.size || 'cover'}
              onValueChange={(value: any) => updateImage('size', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover (Fill)</SelectItem>
                <SelectItem value="contain">Contain (Fit)</SelectItem>
                <SelectItem value="auto">Auto (Original)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={currentValues.image?.position || 'center'}
              onValueChange={(value) => updateImage('position', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select
              value={currentValues.image?.repeat || 'no-repeat'}
              onValueChange={(value: any) => updateImage('repeat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-repeat">No Repeat</SelectItem>
                <SelectItem value="repeat">Repeat</SelectItem>
                <SelectItem value="repeat-x">Repeat X</SelectItem>
                <SelectItem value="repeat-y">Repeat Y</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overlay */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Overlay</Label>
              {isResponsive && (
                <ResponsiveIndicator
                  hasOverride={getOverrides('overlay')[device] || false}
                  device={device}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Overlay Color</Label>
              <Input
                type="color"
                value={currentValues.overlay?.color || '#000000'}
                onChange={(e) => updateOverlay('color', e.target.value)}
                className="w-full h-10 p-1 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overlay Opacity</Label>
                <span className="text-sm text-gray-500">{currentValues.overlay?.opacity || 0}%</span>
              </div>
              <Input
                type="range"
                min={0}
                max={100}
                step={5}
                value={currentValues.overlay?.opacity || 0}
                onChange={(e) => updateOverlay('opacity', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
