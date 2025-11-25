'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layers,
  List,
  History,
  HelpCircle,
  ChevronUp,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface EditorFooterProps {
  selectedBlockId: string | null;
  device: 'desktop' | 'tablet' | 'mobile';
}

export function EditorFooter({
  selectedBlockId,
  device,
}: EditorFooterProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'layers' | 'history' | null>(null);
  const [zoom, setZoom] = useState(100);

  const toggleTab = (tab: 'structure' | 'layers' | 'history') => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <>
      {/* Expandable Panel */}
      {activeTab && (
        <div className="h-48 bg-white border-t border-gray-200 overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold capitalize">{activeTab}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab(null)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>

            {activeTab === 'structure' && (
              <div className="text-sm text-gray-600">
                Structure tree view will be here
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="text-sm text-gray-600">
                Layers panel will be here
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-sm text-gray-600">
                History panel will be here
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4">
        {/* Left Section - Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'structure' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleTab('structure')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Structure</span>
          </Button>

          <Button
            variant={activeTab === 'layers' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleTab('layers')}
            className="gap-2"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Layers</span>
          </Button>

          <Button
            variant={activeTab === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleTab('history')}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
        </div>

        {/* Center Section - Selection Info */}
        <div className="text-xs text-gray-500">
          {selectedBlockId ? (
            <span>Selected: {selectedBlockId}</span>
          ) : (
            <span>No block selected</span>
          )}
        </div>

        {/* Right Section - Zoom & Help */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm font-mono w-12 text-center">
            {zoom}%
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button variant="ghost" size="icon" title="Help">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
