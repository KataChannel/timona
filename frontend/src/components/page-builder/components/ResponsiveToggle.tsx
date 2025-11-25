/**
 * ResponsiveToggle Component
 * 
 * Allows toggling between "All Devices" and "Device-Specific" modes
 * Shows visual indicators when device-specific values are set
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Monitor, Tablet, Smartphone, Link2, Unlink } from 'lucide-react';
import { Device, hasResponsiveOverride } from '../types/responsive';

interface ResponsiveToggleProps {
  /**
   * Current editing device
   */
  device: Device;
  
  /**
   * Whether responsive mode is enabled
   */
  isResponsive: boolean;
  
  /**
   * Callback when responsive mode is toggled
   */
  onToggle: (isResponsive: boolean) => void;
  
  /**
   * Optional: Check if this property has device-specific overrides
   */
  hasOverrides?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
  
  /**
   * Optional: Label for the toggle
   */
  label?: string;
}

export function ResponsiveToggle({
  device,
  isResponsive,
  onToggle,
  hasOverrides,
  label = 'Responsive',
}: ResponsiveToggleProps) {
  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const CurrentDeviceIcon = deviceIcons[device];

  return (
    <div className="flex items-center justify-between gap-2 py-2 px-1">
      {/* Label & Device Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <CurrentDeviceIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>

      {/* Responsive Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isResponsive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggle(!isResponsive)}
              className="h-8 gap-2"
            >
              {isResponsive ? (
                <>
                  <Unlink className="h-3.5 w-3.5" />
                  <span className="text-xs">Device-Specific</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  <span className="text-xs">All Devices</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-xs">
              {isResponsive
                ? 'Changes only affect the current device. Other devices keep their values.'
                : 'Changes affect all devices equally. Enable for device-specific customization.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Override Indicators */}
      {hasOverrides && isResponsive && (
        <div className="flex gap-1 ml-2">
          {(['desktop', 'tablet', 'mobile'] as Device[]).map((dev) => {
            const Icon = deviceIcons[dev];
            const hasOverride = hasOverrides[dev];
            
            if (!hasOverride) return null;

            return (
              <TooltipProvider key={dev}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`p-1 rounded ${
                        dev === device
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Custom value for {dev}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Device Indicator Badge
 * Shows which device is currently being edited
 */
interface DeviceIndicatorProps {
  device: Device;
  className?: string;
}

export function DeviceIndicator({ device, className = '' }: DeviceIndicatorProps) {
  const deviceConfig = {
    desktop: { icon: Monitor, label: 'Desktop', color: 'bg-blue-500' },
    tablet: { icon: Tablet, label: 'Tablet', color: 'bg-purple-500' },
    mobile: { icon: Smartphone, label: 'Mobile', color: 'bg-green-500' },
  };

  const config = deviceConfig[device];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} text-white text-sm font-medium ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

/**
 * Responsive Value Indicator
 * Shows a dot indicator when a value has device-specific overrides
 */
interface ResponsiveIndicatorProps {
  hasOverride: boolean;
  device: Device;
}

export function ResponsiveIndicator({ hasOverride, device }: ResponsiveIndicatorProps) {
  if (!hasOverride) return null;

  const colors = {
    desktop: 'bg-blue-500',
    tablet: 'bg-purple-500',
    mobile: 'bg-green-500',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-2 h-2 rounded-full ${colors[device]} animate-pulse`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Has device-specific value</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
