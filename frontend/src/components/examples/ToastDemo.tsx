'use client';

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, Info, Loader2, Bell } from 'lucide-react';

/**
 * Toast Demo Component
 * 
 * Demonstrates all toast variants with shadcn/ui theme integration
 */
export function ToastDemo() {
  // Basic toasts
  const showSuccessToast = () => {
    toast.success('Thao tác thành công!', {
      description: 'Dữ liệu đã được lưu',
    });
  };

  const showErrorToast = () => {
    toast.error('Có lỗi xảy ra!', {
      description: 'Không thể kết nối đến server',
    });
  };

  const showWarningToast = () => {
    toast.warning('Cảnh báo!', {
      description: 'Bạn đang thực hiện thao tác nguy hiểm',
    });
  };

  const showInfoToast = () => {
    toast.info('Thông tin', {
      description: 'Hệ thống sẽ bảo trì vào 2:00 AM',
    });
  };

  const showLoadingToast = () => {
    toast.loading('Đang xử lý...', {
      description: 'Vui lòng đợi',
    });
  };

  // Promise toast
  const showPromiseToast = () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve({ name: 'Template Hero Section' }), 3000);
    });

    toast.promise(promise, {
      loading: 'Đang áp dụng template...',
      success: (data: any) => `Template "${data.name}" với 5 blocks đã áp dụng!`,
      error: 'Lỗi khi áp dụng template',
    });
  };

  // Action toast
  const showActionToast = () => {
    toast('Template đã áp dụng', {
      description: '5 blocks đã được thêm vào page',
      action: {
        label: 'Hoàn tác',
        onClick: () => {
          toast.success('Đã hoàn tác!');
        },
      },
    });
  };

  // Custom icon toast
  const showCustomIconToast = () => {
    toast('Thông báo mới', {
      icon: <Bell className="h-5 w-5" />,
      description: 'Bạn có 3 thông báo chưa đọc',
    });
  };

  // Position variants
  const showPositionToasts = () => {
    toast.success('Top Left', { position: 'top-left' });
    setTimeout(() => toast.success('Top Center', { position: 'top-center' }), 300);
    setTimeout(() => toast.success('Top Right', { position: 'top-right' }), 600);
    setTimeout(() => toast.success('Bottom Left', { position: 'bottom-left' }), 900);
    setTimeout(() => toast.success('Bottom Center', { position: 'bottom-center' }), 1200);
    setTimeout(() => toast.success('Bottom Right', { position: 'bottom-right' }), 1500);
  };

  // Duration variants
  const showShortToast = () => {
    toast.success('Toast ngắn', {
      description: 'Tự động đóng sau 2 giây',
      duration: 2000,
    });
  };

  const showLongToast = () => {
    toast.info('Toast dài', {
      description: 'Tự động đóng sau 10 giây',
      duration: 10000,
    });
  };

  const showPersistentToast = () => {
    const toastId = toast.warning('Toast vĩnh viễn', {
      description: 'Không tự động đóng - cần bấm X',
      duration: Infinity,
      action: {
        label: 'Đóng',
        onClick: () => toast.dismiss(toastId),
      },
    });
  };

  // Rich content toast
  const showRichContentToast = () => {
    toast.success('Upload thành công!', {
      description: (
        <div className="mt-2 space-y-1">
          <p className="text-sm">File: document.pdf</p>
          <p className="text-sm text-muted-foreground">Size: 2.5 MB</p>
          <p className="text-sm text-muted-foreground">Time: 3.2s</p>
        </div>
      ),
    });
  };

  // Multiple toasts
  const showMultipleToasts = () => {
    toast.success('Toast 1');
    setTimeout(() => toast.info('Toast 2'), 100);
    setTimeout(() => toast.warning('Toast 3'), 200);
    setTimeout(() => toast.error('Toast 4'), 300);
  };

  // Delete confirmation
  const showDeleteConfirmation = () => {
    toast.warning('Xác nhận xóa?', {
      description: 'Hành động này không thể hoàn tác',
      action: {
        label: 'Xóa',
        onClick: () => {
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
              loading: 'Đang xóa...',
              success: 'Đã xóa thành công',
              error: 'Lỗi khi xóa',
            }
          );
        },
      },
      cancel: {
        label: 'Hủy',
        onClick: () => toast.info('Đã hủy'),
      },
      duration: Infinity,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Toast Demo</h1>
        <p className="text-muted-foreground">
          Sonner toast notifications với shadcn/ui theme integration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Basic Toasts
            </CardTitle>
            <CardDescription>
              Toast cơ bản với các type khác nhau
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={showSuccessToast} className="w-full" variant="default">
              Success Toast
            </Button>
            <Button onClick={showErrorToast} className="w-full" variant="destructive">
              Error Toast
            </Button>
            <Button onClick={showWarningToast} className="w-full" variant="outline">
              Warning Toast
            </Button>
            <Button onClick={showInfoToast} className="w-full" variant="secondary">
              Info Toast
            </Button>
            <Button onClick={showLoadingToast} className="w-full" variant="outline">
              Loading Toast
            </Button>
          </CardContent>
        </Card>

        {/* Promise & Action Toasts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5" />
              Advanced Toasts
            </CardTitle>
            <CardDescription>
              Promise-based và action toasts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={showPromiseToast} className="w-full" variant="default">
              Promise Toast
            </Button>
            <Button onClick={showActionToast} className="w-full" variant="secondary">
              Action Toast
            </Button>
            <Button onClick={showCustomIconToast} className="w-full" variant="outline">
              Custom Icon
            </Button>
            <Button onClick={showRichContentToast} className="w-full" variant="outline">
              Rich Content
            </Button>
            <Button onClick={showDeleteConfirmation} className="w-full" variant="destructive">
              Delete Confirm
            </Button>
          </CardContent>
        </Card>

        {/* Position & Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Variants
            </CardTitle>
            <CardDescription>
              Vị trí và thời gian hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={showPositionToasts} className="w-full" variant="outline">
              All Positions
            </Button>
            <Button onClick={showShortToast} className="w-full" variant="secondary">
              Short (2s)
            </Button>
            <Button onClick={showLongToast} className="w-full" variant="secondary">
              Long (10s)
            </Button>
            <Button onClick={showPersistentToast} className="w-full" variant="outline">
              Persistent
            </Button>
            <Button onClick={showMultipleToasts} className="w-full" variant="default">
              Multiple Toasts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Code Examples */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Cách sử dụng toast trong code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Basic Toast</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`import { toast } from 'sonner';

toast.success('Thành công!', {
  description: 'Dữ liệu đã được lưu',
});`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Promise Toast</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`toast.promise(
  fetchData(),
  {
    loading: 'Đang tải...',
    success: (data) => \`Tải \${data.length} items\`,
    error: 'Lỗi khi tải',
  }
);`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Action Toast</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`toast('Đã lưu', {
  action: {
    label: 'Hoàn tác',
    onClick: () => undo(),
  },
});`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Theme Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Theme Integration</CardTitle>
          <CardDescription>
            Toast tự động theo theme của app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Light Mode</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Background: White (bg-card)</li>
                <li>• Text: Dark (text-card-foreground)</li>
                <li>• Border: Light gray (border-border)</li>
                <li>• Success: Primary color</li>
                <li>• Error: Destructive color</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dark Mode</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Background: Dark + backdrop blur</li>
                <li>• Text: Light (text-card-foreground)</li>
                <li>• Border: Dark gray (border-border)</li>
                <li>• Success: Light primary</li>
                <li>• Error: Light destructive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ToastDemo;
