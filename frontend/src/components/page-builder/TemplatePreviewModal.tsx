'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BlockTemplate, TemplateBlockDefinition } from '@/data/blockTemplates';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Image,
  Type,
  Square,
  Grid3x3,
  Columns,
  Layout,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: BlockTemplate | null;
  onApply: () => void;
  isApplying?: boolean;
}

interface TreeNodeProps {
  block: TemplateBlockDefinition;
  depth: number;
  isLast: boolean;
  parentLines: boolean[];
}

const getBlockIcon = (type: string) => {
  switch (type) {
    case 'TEXT':
      return <Type className="h-4 w-4" />;
    case 'IMAGE':
      return <Image className="h-4 w-4" />;
    case 'BUTTON':
      return <Square className="h-4 w-4" />;
    case 'CONTAINER':
      return <Layout className="h-4 w-4" />;
    case 'SECTION':
      return <FileText className="h-4 w-4" />;
    case 'GRID':
      return <Grid3x3 className="h-4 w-4" />;
    case 'FLEX_ROW':
    case 'FLEX_COLUMN':
      return <Columns className="h-4 w-4" />;
    default:
      return <Square className="h-4 w-4" />;
  }
};

const getBlockTypeColor = (type: string) => {
  switch (type) {
    case 'TEXT':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'IMAGE':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    case 'BUTTON':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'CONTAINER':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    case 'SECTION':
      return 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20';
    case 'GRID':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
    case 'FLEX_ROW':
    case 'FLEX_COLUMN':
      return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ block, depth, isLast, parentLines }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = block.children && block.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors',
          'group'
        )}
        onClick={toggleExpand}
      >
        {/* Tree lines */}
        <div className="flex items-center">
          {parentLines.map((hasLine, idx) => (
            <div key={idx} className="w-6 flex justify-center">
              {hasLine && (
                <div className="w-px h-full bg-border" />
              )}
            </div>
          ))}
          {depth > 0 && (
            <>
              <div className="w-6 flex items-center justify-center">
                <div className={cn(
                  'w-px bg-border',
                  isLast ? 'h-1/2' : 'h-full'
                )} />
              </div>
              <div className="w-6 h-px bg-border" />
            </>
          )}
        </div>

        {/* Expand/collapse icon */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Block icon */}
        <div className={cn(
          'flex-shrink-0 p-1.5 rounded border',
          getBlockTypeColor(block.type)
        )}>
          {getBlockIcon(block.type)}
        </div>

        {/* Block info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {block.type}
            </span>
            <Badge variant="outline" className="text-xs">
              Depth {depth}
            </Badge>
            {hasChildren && (
              <Badge variant="secondary" className="text-xs">
                {block.children!.length} {block.children!.length === 1 ? 'child' : 'children'}
              </Badge>
            )}
          </div>
          {block.content && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {typeof block.content === 'string'
                ? block.content.substring(0, 50)
                : JSON.stringify(block.content).substring(0, 50)}
              {(typeof block.content === 'string' ? block.content.length : JSON.stringify(block.content).length) > 50 && '...'}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {block.children!.map((child, index) => (
            <TreeNode
              key={index}
              block={child}
              depth={depth + 1}
              isLast={index === block.children!.length - 1}
              parentLines={[...parentLines, depth > 0 && !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function TemplatePreviewModal({
  open,
  onOpenChange,
  template,
  onApply,
  isApplying = false,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  // Calculate statistics
  const calculateStats = (blocks: TemplateBlockDefinition[]) => {
    let total = 0;
    let maxDepth = 0;
    const typeCount: Record<string, number> = {};

    const traverse = (block: TemplateBlockDefinition, depth: number) => {
      total++;
      maxDepth = Math.max(maxDepth, depth);
      typeCount[block.type] = (typeCount[block.type] || 0) + 1;

      if (block.children) {
        block.children.forEach(child => traverse(child, depth + 1));
      }
    };

    blocks.forEach(block => traverse(block, 0));

    return { total, maxDepth, typeCount };
  };

  const stats = calculateStats(template.blocks);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {template.description}
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {template.category}
            </Badge>
          </div>
        </DialogHeader>

        {/* Thumbnail Preview */}
        {template.thumbnail && (
          <div className="w-full rounded-lg border overflow-hidden bg-muted/30">
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Blocks</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.maxDepth}</div>
            <div className="text-sm text-muted-foreground">Max Depth</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{Object.keys(stats.typeCount).length}</div>
            <div className="text-sm text-muted-foreground">Block Types</div>
          </div>
        </div>

        <Separator />

        {/* Block Type Distribution */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Block Types Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <Badge
                key={type}
                variant="outline"
                className={cn('text-xs', getBlockTypeColor(type))}
              >
                <span className="flex items-center gap-1">
                  {getBlockIcon(type)}
                  {type}: {count}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tree View */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Template Structure</h3>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-1">
              {template.blocks.map((block, index) => (
                <TreeNode
                  key={index}
                  block={block}
                  depth={0}
                  isLast={index === template.blocks.length - 1}
                  parentLines={[]}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={onApply} disabled={isApplying}>
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
