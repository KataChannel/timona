'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  useMenus,
  useUpdateMenu,
  useDeleteMenu,
} from '@/lib/hooks/useMenus';
import { Menu } from '@/lib/graphql/menu-dynamic-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableMenuRow, MenuTreeItem } from '@/components/menu/SortableMenuRow';
import {
  buildMenuTree,
  flattenMenuTree,
  getMenuTypeColor,
} from '@/lib/utils/menu-utils';

/**
 * Trang Quản Lý Menu
 * 
 * Tính năng:
 * - Quản lý menu theo cấu trúc cây (parent/child)
 * - Kéo thả để sắp xếp lại menu
 * - Kéo thả để thay đổi cấp độ menu (cha <-> con)
 * - Sử dụng Universal Dynamic Query System
 */

export default function MenuManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use dynamic hooks
  const where = useMemo(() => {
    const filter: any = {};
    if (selectedType !== 'all') {
      filter.type = selectedType;
    }
    if (searchTerm) {
      filter.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { slug: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    return filter;
  }, [selectedType, searchTerm]);

  const { menus: menusData, loading, refetch } = useMenus({
    where,
    orderBy: { order: 'asc' },
  });

  // Ensure menus is always Menu[] type
  const menus = useMemo(() => {
    return Array.isArray(menusData) ? (menusData as Menu[]) : [];
  }, [menusData]);

  // Build menu tree structure
  const menuTree = useMemo(
    () => buildMenuTree(menus, expandedMenus),
    [menus, expandedMenus]
  );

  // Flatten tree for drag and drop
  const flatMenus = useMemo(() => flattenMenuTree(menuTree) as MenuTreeItem[], [menuTree]);
  
  const { updateMenu: updateMenuMutation } = useUpdateMenu();
  const { deleteMenu: deleteMenuMutation } = useDeleteMenu();

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = flatMenus.findIndex((m) => m.id === active.id);
    const newIndex = flatMenus.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const moved = flatMenus[oldIndex];
    const target = flatMenus[newIndex];

    try {
      // Update order
      const newOrder = target.order;
      await updateMenuMutation(moved.id, { order: newOrder });

      // Update all affected menus' orders
      const reordered = arrayMove(flatMenus, oldIndex, newIndex);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].order !== i) {
          await updateMenuMutation(reordered[i].id, { order: i });
        }
      }

      toast.success('Menu order updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update menu order');
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete menu "${title}"?`)) return;
    try {
      await deleteMenuMutation(id);
      toast.success('Menu deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete menu');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      // Get current menu to toggle isActive
      const menu = menus.find((m) => m.id === id);
      if (!menu) return;
      await updateMenuMutation(id, { isActive: !menu.isActive });
      toast.success('Menu status updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update menu status');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      // Get current menu to toggle isVisible
      const menu = menus.find((m) => m.id === id);
      if (!menu) return;
      await updateMenuMutation(id, { isVisible: !menu.isVisible });
      toast.success('Menu visibility updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update menu visibility');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Menu</h1>
          <p className="text-muted-foreground">
            Quản lý menu và điều hướng ứng dụng của bạn
          </p>
        </div>
        <Button onClick={() => router.push('/admin/menu/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Menu Mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Combobox
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'SIDEBAR', label: 'Thanh bên' },
                { value: 'HEADER', label: 'Đầu trang' },
                { value: 'FOOTER', label: 'Chân trang' },
                { value: 'MOBILE', label: 'Di động' },
                { value: 'CUSTOM', label: 'Tùy chỉnh' },
              ]}
              placeholder="Lọc theo loại"
              searchPlaceholder="Tìm loại menu..."
              emptyMessage="Không tìm thấy loại menu."
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu ({menus.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Đường dẫn</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : flatMenus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Không có menu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={flatMenus.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {flatMenus.map((menu) => (
                      <SortableMenuRow
                        key={menu.id}
                        menu={menu}
                        level={menu.level || 0}
                        allMenus={menus}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onToggleVisibility={handleToggleVisibility}
                        onToggleExpand={handleToggleExpand}
                        getTypeColor={getMenuTypeColor}
                        expanded={menu.expanded}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
            <DragOverlay>
              {activeId ? (
                <div className="bg-background border rounded-lg p-4 shadow-lg">
                  <div className="font-medium">
                    {flatMenus.find((m) => m.id === activeId)?.title}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
