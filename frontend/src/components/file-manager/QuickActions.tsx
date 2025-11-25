'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FolderPlus,
  Download,
  Share2,
  Trash2,
  Search,
  Settings,
  FileDown,
  Link,
  Users,
  Lock,
  Unlock,
  Star,
  Tag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuickActionsProps {
  onUpload?: () => void;
  onCreateFolder?: () => void;
  onBulkDownload?: () => void;
  onShare?: () => void;
}

export function QuickActions({
  onUpload,
  onCreateFolder,
  onBulkDownload,
  onShare
}: QuickActionsProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder?.();
      setFolderName('');
      setCreateFolderOpen(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload Files',
      description: 'Upload new files or folders',
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      action: onUpload,
      badge: 'Ctrl+U'
    },
    {
      title: 'New Folder',
      description: 'Create a new folder',
      icon: FolderPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      action: () => setCreateFolderOpen(true),
      badge: 'Ctrl+N'
    },
    {
      title: 'Bulk Download',
      description: 'Download multiple files',
      icon: FileDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      action: onBulkDownload,
      badge: null
    },
    {
      title: 'Share',
      description: 'Share files with others',
      icon: Share2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      action: () => setShareDialogOpen(true),
      badge: null
    },
  ];

  const tools = [
    {
      title: 'Find Duplicates',
      description: 'Scan for duplicate files',
      icon: Search,
      color: 'text-yellow-600'
    },
    {
      title: 'Manage Tags',
      description: 'Organize with tags',
      icon: Tag,
      color: 'text-pink-600'
    },
    {
      title: 'Permissions',
      description: 'Manage file permissions',
      icon: Lock,
      color: 'text-red-600'
    },
    {
      title: 'Starred Files',
      description: 'View favorite files',
      icon: Star,
      color: 'text-yellow-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Frequently used file operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto justify-start text-left p-4 hover:border-primary transition-all group"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className={`p-2.5 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-semibold">{action.title}</div>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tools & Utilities</CardTitle>
          <CardDescription>Advanced file management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.title}
                  variant="ghost"
                  className="h-auto flex-col items-center gap-2 p-4 hover:bg-accent"
                >
                  <Icon className={`h-6 w-6 ${tool.color}`} />
                  <div className="text-center">
                    <div className="font-medium text-xs">{tool.title}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {tool.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                }}
              />
              <p className="text-xs text-muted-foreground">
                Create a new folder to organize your files
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim()}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a shareable link for selected files
            </p>
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="https://files.example.com/share/abc123xyz"
                  className="font-mono text-sm"
                />
                <Button size="sm">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Access Control</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Anyone with link
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Lock className="h-4 w-4 mr-2" />
                  Password protected
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
