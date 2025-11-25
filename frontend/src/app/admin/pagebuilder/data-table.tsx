'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import { Page, PageStatus } from '@/types/page-builder';

interface DataTableProps {
  data: Page[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onView: (slug: string) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

type SortField = 'title' | 'slug' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc' | null;

const getStatusColor = (status: PageStatus) => {
  switch (status) {
    case PageStatus.PUBLISHED:
      return 'bg-green-100 text-green-800';
    case PageStatus.DRAFT:
      return 'bg-yellow-100 text-yellow-800';
    case PageStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusVariant = (status: PageStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case PageStatus.PUBLISHED:
      return 'default';
    case PageStatus.DRAFT:
      return 'secondary';
    case PageStatus.ARCHIVED:
      return 'outline';
    default:
      return 'outline';
  }
};

export function DataTable({
  data,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}: DataTableProps) {
  // Create refs to track if component is mounted
  const isMountedRef = useRef(false);
  
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Ensure dialog NEVER shows on initial mount
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      // Force dialog to be closed on mount
      setDeleteId(null);
      setShowDeleteDialog(false);
    }
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    let result = data;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(page => page.status === statusFilter);
    }

    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      result = result.filter(page =>
        (page.title?.toLowerCase().includes(searchLower) ||
        page.slug?.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [data, statusFilter, globalFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    if (sortDirection && sortField) {
      sorted.sort((a, b) => {
        let aVal: any = a[sortField as keyof Page];
        let bVal: any = b[sortField as keyof Page];

        // Handle dates
        if (sortField === 'updatedAt') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        // Handle strings
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
        }
        if (typeof bVal === 'string') {
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPageIndex(0);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-40" />;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting page:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search title or slug..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPageIndex(0);
              }}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setPageIndex(0);
          }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={PageStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={PageStatus.PUBLISHED}>Published</SelectItem>
              <SelectItem value={PageStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('title')}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Title
                    {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('slug')}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Slug
                    {getSortIcon('slug')}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('updatedAt')}
                    className="h-8 p-0 hover:bg-transparent"
                  >
                    Updated
                    {getSortIcon('updatedAt')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title || 'Untitled'}</TableCell>
                    <TableCell className="text-sm text-gray-600">/{page.slug || 'untitled'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(page.status)} className={getStatusColor(page.status)}>
                        {page.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {Array.isArray(page.blocks) ? page.blocks.length : 0}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(page.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {page.status === PageStatus.PUBLISHED && page.slug && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onView(page.slug)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Page
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteId(page.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {sortedData.length} page(s) total
            {globalFilter && ` (filtered)`}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              Page {pageIndex + 1} of {totalPages}
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(totalPages - 1)}
                disabled={pageIndex >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog - Only render when user explicitly opens */}
      {deleteId !== null && showDeleteDialog && (
        <AlertDialog open={true} onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
            setDeleteId(null);
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Page</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this page? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel 
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
