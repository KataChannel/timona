'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Layers, Sparkles, Bookmark } from 'lucide-react';
import { ElementsLibrary } from './ElementsLibrary';
import { TemplatesLibrary } from './TemplatesLibrary';
import { SavedBlocksLibrary } from './SavedBlocksLibrary';

interface LeftPanelProps {
  onClose: () => void;
}

export function LeftPanel({ onClose }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'templates' | 'saved'>('elements');

  return (
    <div className="w-full sm:w-80 md:w-96 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-lg">
      {/* Panel Header */}
      <div className="h-11 sm:h-12 border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 bg-gradient-to-r from-blue-50 via-white to-white">
        <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Components</span>
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 hover:text-red-600">
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 min-h-0 overflow-y-auto">
        <TabsList className="w-full justify-start rounded-none border-b bg-white h-auto p-1">
          <TabsTrigger value="elements" className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Elements</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 gap-1.5 text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-white to-gray-50">
          <TabsContent value="elements" className="mt-0 h-full data-[state=inactive]:hidden">
            <ElementsLibrary />
          </TabsContent>

          <TabsContent value="templates" className="mt-0 h-full data-[state=inactive]:hidden">
            <TemplatesLibrary />
          </TabsContent>

          <TabsContent value="saved" className="mt-0 h-full data-[state=inactive]:hidden">
            <SavedBlocksLibrary />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
