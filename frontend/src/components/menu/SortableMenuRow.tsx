'use client';

import { Menu } from '@/lib/graphql/menu-dynamic-queries';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Power,
  Menu as MenuIcon,
  ExternalLink,
  GripVertical,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export interface MenuTreeItem extends Menu {
  children?: MenuTreeItem[];
  expanded?: boolean;
}

interface SortableMenuRowProps {
  menu: MenuTreeItem;
  level?: number;
  allMenus: Menu[];
  onDelete: (id: string, title: string) => void;
  onToggleActive: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleExpand: (id: string) => void;
  getTypeColor: (type: string) => string;
  expanded?: boolean;
}

export function SortableMenuRow({
  menu,
  level = 0,
  allMenus,
  onDelete,
  onToggleActive,
  onToggleVisibility,
  onToggleExpand,
  getTypeColor,
  expanded = false,
}: SortableMenuRowProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = menu.children && menu.children.length > 0;

  return (
    <>
      <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'bg-muted')}>
        <TableCell style={{ paddingLeft: `${level * 2 + 1}rem` }}>
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onToggleExpand(menu.id)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {menu.icon && <MenuIcon className="h-4 w-4 text-muted-foreground" />}
            <div>
              <div className="font-medium">{menu.title}</div>
              <div className="text-sm text-muted-foreground">{menu.slug}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={getTypeColor(menu.type)}>{menu.type}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {menu.route || menu.url || '-'}
            {menu.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
          </div>
        </TableCell>
        <TableCell>{menu.order}</TableCell>
        <TableCell>
          <Badge variant={menu.isActive ? 'default' : 'secondary'}>
            {menu.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={menu.isVisible ? 'default' : 'outline'}>
            {menu.isVisible ? 'Hiển thị' : 'Ẩn'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(menu.id)}
              title={menu.isActive ? 'Tạm dừng' : 'Kích hoạt'}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleVisibility(menu.id)}
              title={menu.isVisible ? 'Ẩn' : 'Hiển thị'}
            >
              {menu.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/menu/${menu.id}/edit`)} title="Chỉnh sửa">
              <Pencil className="h-4 w-4" />
            </Button>
            {!menu.isProtected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(menu.id, menu.title)}
                title="Xóa"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {hasChildren &&
        expanded &&
        menu.children!.map((child) => (
          <SortableMenuRow
            key={child.id}
            menu={child}
            level={level + 1}
            allMenus={allMenus}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onToggleVisibility={onToggleVisibility}
            onToggleExpand={onToggleExpand}
            getTypeColor={getTypeColor}
            expanded={child.expanded}
          />
        ))}
    </>
  );
}
