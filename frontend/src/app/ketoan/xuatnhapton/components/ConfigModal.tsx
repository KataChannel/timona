import React from 'react';
import { UserConfig } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigModalProps {
  isOpen: boolean;
  currentConfig: UserConfig | null;
  onSave: (config: UserConfig) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  currentConfig,
  onSave,
  onClose,
}) => {
  const [mst, setMst] = React.useState(currentConfig?.mst || '');
  const [companyName, setCompanyName] = React.useState(currentConfig?.companyName || '');
  
  React.useEffect(() => {
    if (currentConfig) {
      setMst(currentConfig.mst);
      setCompanyName(currentConfig.companyName);
    }
  }, [currentConfig]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mst.trim()) {
      onSave({ mst: mst.trim(), companyName: companyName.trim() });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cấu Hình Mã Số Thuế</DialogTitle>
          <DialogDescription>
            Nhập mã số thuế để phân loại hóa đơn bán/mua tự động
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mst">
                Mã Số Thuế (MST) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mst"
                value={mst}
                onChange={(e) => setMst(e.target.value)}
                placeholder="Nhập mã số thuế của bạn"
                required
              />
              <p className="text-xs text-muted-foreground">
                MST dùng để phân loại hóa đơn bán/mua
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="companyName">Tên Công Ty</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nhập tên công ty"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu Cấu Hình</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
