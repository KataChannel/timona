import React from 'react';
import { PageBlock, FlexBlockContent } from '@/types/page-builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LayoutBlockWrapper } from './LayoutBlockWrapper';

interface FlexBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  onUpdateChild?: (childId: string, content: any, style?: any) => void;
  onDeleteChild?: (childId: string) => void;
  children?: React.ReactNode;
}

export const FlexBlock: React.FC<FlexBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  children,
}) => {
  const content = block.content as FlexBlockContent;
  const [editContent, setEditContent] = React.useState<FlexBlockContent>(content || {
    direction: 'row',
    justifyContent: 'start',
    alignItems: 'start',
    wrap: false,
    gap: 16,
  });

  const justifyContentMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  const alignItemsMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const flexStyles: React.CSSProperties = {
    // First apply block.style from Properties Panel
    ...block.style,
    // Then override with flex-specific styles that must not be changed
    display: 'flex',
    flexDirection: content.direction || 'row',
    justifyContent: justifyContentMap[content.justifyContent || 'start'],
    alignItems: alignItemsMap[content.alignItems || 'start'],
    flexWrap: content.wrap ? 'wrap' : 'nowrap',
    gap: `${content.gap || 16}px`,
    width: '100%',
    position: 'relative',
    minHeight: children ? 'auto' : '150px',
    borderRadius: '8px',
    // Only apply default padding if not set in block.style
    ...(isEditable && !block.style?.padding && !block.style?.paddingTop && !block.style?.paddingRight && !block.style?.paddingBottom && !block.style?.paddingLeft
      ? { padding: '16px' }
      : {}),
  };

  const settingsPanel = (
    <>
      <div>
        <Label className="text-xs">Direction</Label>
        <Select
          value={editContent.direction || 'row'}
          onValueChange={(value) => setEditContent({ ...editContent, direction: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">Row (Horizontal)</SelectItem>
            <SelectItem value="column">Column (Vertical)</SelectItem>
            <SelectItem value="row-reverse">Row Reverse</SelectItem>
            <SelectItem value="column-reverse">Column Reverse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Justify Content</Label>
        <Select
          value={editContent.justifyContent || 'start'}
          onValueChange={(value) => setEditContent({ ...editContent, justifyContent: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="between">Space Between</SelectItem>
            <SelectItem value="around">Space Around</SelectItem>
            <SelectItem value="evenly">Space Evenly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Align Items</Label>
        <Select
          value={editContent.alignItems || 'start'}
          onValueChange={(value) => setEditContent({ ...editContent, alignItems: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Gap (px)</Label>
        <Input
          type="number"
          value={editContent.gap || 16}
          onChange={(e) => setEditContent({ ...editContent, gap: parseInt(e.target.value) })}
          className="text-xs"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="wrap" className="text-xs">Wrap</Label>
        <Switch
          id="wrap"
          checked={editContent.wrap || false}
          onCheckedChange={(checked) => setEditContent({ ...editContent, wrap: checked })}
        />
      </div>
    </>
  );

  return (
    <LayoutBlockWrapper
      block={block}
      isEditable={isEditable}
      children={children}
      onDelete={onDelete}
      onAddChild={onAddChild}
      onUpdate={(content) => {
        setEditContent(content);
        onUpdate(content);
      }}
      onUpdateChild={onUpdateChild}
      onDeleteChild={onDeleteChild}
      containerStyles={flexStyles}
      settingsPanel={settingsPanel}
      title="Flex Block Settings"
    />
  );
};
