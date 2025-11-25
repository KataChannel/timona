import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldCheck, Key } from 'lucide-react';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';
import UserRoleAssignment from './UserRoleAssignment';

interface RbacManagementProps {
  className?: string;
}

const RbacManagement: React.FC<RbacManagementProps> = ({ className = '' }) => {
  const searchParams = useSearchParams();
  const subtabParam = searchParams.get('subtab');
  
  // Initialize active subtab from URL or default to 'roles'
  const [activeSubtab, setActiveSubtab] = useState(
    subtabParam === 'permissions' || subtabParam === 'assignments' 
      ? subtabParam 
      : 'roles'
  );

  // Update subtab when URL parameter changes
  useEffect(() => {
    const subtab = searchParams.get('subtab');
    if (subtab === 'roles' || subtab === 'permissions' || subtab === 'assignments') {
      setActiveSubtab(subtab);
    }
  }, [searchParams]);
  const tabs = [
    {
      value: 'roles',
      label: 'Vai trò',
      icon: Users,
      component: RoleManagement,
      description: 'Quản lý vai trò hệ thống và phân cấp',
    },
    {
      value: 'permissions',
      label: 'Quyền hạn',
      icon: Key,
      component: PermissionManagement,
      description: 'Định nghĩa và quản lý quyền hạn hệ thống',
    },
    {
      value: 'assignments',
      label: 'Phân quyền User',
      icon: ShieldCheck,
      component: UserRoleAssignment,
      description: 'Gán vai trò và quyền hạn cho người dùng',
    },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Vai trò & Quyền hạn</CardTitle>
          <CardDescription>
            Quản lý kiểm soát truy cập, vai trò và quyền hạn hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubtab} onValueChange={setActiveSubtab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{tab.description}</p>
                </div>
                <tab.component />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RbacManagement;