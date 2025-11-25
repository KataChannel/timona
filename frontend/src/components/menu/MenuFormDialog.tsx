'use client';

import { Menu } from '@/lib/graphql/menu-dynamic-queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuFormData {
  title: string;
  slug: string;
  description: string;
  type: string;
  route: string;
  url: string;
  icon: string;
  order: number;
  parentId: string;
  isActive: boolean;
  isVisible: boolean;
  isPublic: boolean;
}

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  formData: MenuFormData;
  onFormChange: (data: MenuFormData) => void;
  onSubmit: () => void;
  menus: Menu[];
  selectedMenuId?: string;
}

export function MenuFormDialog({
  open,
  onOpenChange,
  mode,
  formData,
  onFormChange,
  onSubmit,
  menus,
  selectedMenuId,
}: MenuFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo Menu Mới' : 'Chỉnh Sửa Menu'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'create'
              ? 'Thêm menu mới vào hệ thống'
              : 'Cập nhật thông tin menu'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    onFormChange({ ...formData, title: e.target.value })
                  }
                  placeholder="Dashboard"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    onFormChange({ ...formData, slug: e.target.value })
                  }
                  placeholder="dashboard"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  onFormChange({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả về menu..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Loại <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIDEBAR">Thanh bên</SelectItem>
                    <SelectItem value="HEADER">Đầu trang</SelectItem>
                    <SelectItem value="FOOTER">Chân trang</SelectItem>
                    <SelectItem value="MOBILE">Di động</SelectItem>
                    <SelectItem value="CUSTOM">Tùy chỉnh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Menu cha</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, parentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không có (Cấp gốc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có (Cấp gốc)</SelectItem>
                    {menus
                      .filter((m) => !m.parentId && m.id !== selectedMenuId)
                      .map((menu) => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Tên Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    onFormChange({ ...formData, icon: e.target.value })
                  }
                  placeholder="LayoutDashboard"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route">Đường dẫn nội bộ</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) =>
                    onFormChange({ ...formData, route: e.target.value })
                  }
                  placeholder="/admin/dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL bên ngoài</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) =>
                    onFormChange({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    onFormChange({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Hoạt động</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) =>
                    onFormChange({ ...formData, isVisible: checked })
                  }
                />
                <Label htmlFor="isVisible">Hiển thị</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    onFormChange({ ...formData, isPublic: checked })
                  }
                />
                <Label htmlFor="isPublic">Công khai</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Tạo Menu' : 'Cập Nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
