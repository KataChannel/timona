'use client';

import { useState } from 'react';
import { useWebsiteSetting } from '@/hooks/useWebsiteSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Construction, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Quick toggle component cho Offline Mode
 * Hiển thị trong admin để dễ dàng bật/tắt maintenance mode
 */
export function OfflineModeToggle() {
  const { value: isOffline, loading } = useWebsiteSetting('site.offline');
  const { value: redirectUrl } = useWebsiteSetting('site.offline_redirect_url');
  const [showWarning, setShowWarning] = useState(false);

  const isOfflineEnabled = isOffline === 'true';

  const handleToggle = () => {
    if (!isOfflineEnabled) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Construction className="w-5 h-5" />
          Offline Mode Quick Toggle
        </CardTitle>
        <CardDescription>
          Nhanh chóng bật/tắt chế độ bảo trì website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div>
            <Label className="text-base font-semibold">Trạng thái hiện tại</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isOfflineEnabled ? `Redirect: ${redirectUrl || '/maintenance'}` : 'Website đang hoạt động bình thường'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOfflineEnabled ? (
              <span className="flex items-center gap-2 text-orange-600 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                OFFLINE
              </span>
            ) : (
              <span className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4" />
                ONLINE
              </span>
            )}
          </div>
        </div>

        {/* Warning Alert */}
        {showWarning && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>Cảnh báo:</strong> Khi bật Offline Mode, tất cả người dùng (trừ admin) sẽ bị redirect. 
              Vui lòng đến <strong>Settings → Website → GENERAL</strong> để cấu hình chi tiết.
            </AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Để cấu hình đầy đủ, vào Settings → Website → GENERAL → Maintenance</p>
          <p>🔒 Admin panel vẫn accessible khi offline</p>
        </div>
      </CardContent>
    </Card>
  );
}
