'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/graphql/category.queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryTreeProps {
  categories: Category[];
  selectedId?: string;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAddChild?: (parentCategory: Category) => void;
  showActions?: boolean;
  showProductCount?: boolean;
  className?: string;
}

export function CategoryTree({
  categories,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  showActions = false,
  showProductCount = true,
  className,
}: CategoryTreeProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {categories.map((category) => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          showActions={showActions}
          showProductCount={showProductCount}
        />
      ))}
    </div>
  );
}

interface CategoryTreeItemProps {
  category: Category;
  level: number;
  selectedId?: string;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAddChild?: (parentCategory: Category) => void;
  showActions?: boolean;
  showProductCount?: boolean;
}

function CategoryTreeItem({
  category,
  level,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  showActions,
  showProductCount,
}: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelect?.(category);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(category);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild?.(category);
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer',
          isSelected && 'bg-accent',
          !category.isActive && 'opacity-60'
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-accent-foreground/10 rounded transition-colors',
            !hasChildren && 'invisible'
          )}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-5 w-5 text-primary" />
          ) : (
            <Folder className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Category Image (if available) */}
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="w-6 h-6 rounded object-cover flex-shrink-0"
          />
        )}

        {/* Category Name */}
        <span className={cn('flex-1 font-medium text-sm', isSelected && 'font-semibold')}>
          {category.name}
        </span>

        {/* Product Count */}
        {showProductCount && category.productCount !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {category.productCount}
          </Badge>
        )}

        {/* Status Badge */}
        {!category.isActive && (
          <Badge variant="outline" className="text-xs">
            Ẩn
          </Badge>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleAddChild}
              title="Thêm danh mục con"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleEdit}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-600"
              onClick={handleDelete}
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              showActions={showActions}
              showProductCount={showProductCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simple category list view (alternative to tree)
interface CategoryListProps {
  categories: Category[];
  selectedId?: string;
  onSelect?: (category: Category) => void;
  className?: string;
}

export function CategoryList({
  categories,
  selectedId,
  onSelect,
  className,
}: CategoryListProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect?.(category)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-md hover:bg-accent transition-colors text-left',
            selectedId === category.id && 'bg-accent'
          )}
        >
          <div className="flex items-center gap-3">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <p className="font-medium">{category.name}</p>
              {category.productCount !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {category.productCount} sản phẩm
                </p>
              )}
            </div>
          </div>
          {!category.isActive && (
            <Badge variant="outline" className="text-xs">
              Ẩn
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

// Breadcrumb navigation for categories
interface CategoryBreadcrumbProps {
  categories: Category[];
  className?: string;
}

export function CategoryBreadcrumb({ categories, className }: CategoryBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center text-sm', className)}>
      <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
        Tất cả sản phẩm
      </Link>
      {categories.map((category, index) => (
        <React.Fragment key={category.id}>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <Link
            href={`/shop/${category.slug}`}
            className={cn(
              'hover:text-foreground transition-colors',
              index === categories.length - 1 ? 'font-medium' : 'text-muted-foreground'
            )}
          >
            {category.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
