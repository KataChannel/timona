'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  query: any; // GraphQL query
  queryName: string; // Name of the query field
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  query,
  queryName,
  placeholder = 'Chọn danh mục',
  label,
  disabled = false,
  allowEmpty = true,
}: CategorySelectProps) {
  const { data, loading } = useQuery(query);

  const categories = data?.[queryName] || [];

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select 
        value={value || "none"} 
        onValueChange={(val) => onChange(val === "none" ? "" : val)} 
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? 'Đang tải...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              {allowEmpty && (
                <SelectItem value="none">
                  <span className="text-muted-foreground">Không chọn</span>
                </SelectItem>
              )}
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.postCount !== undefined && (
                    <span className="ml-2 text-muted-foreground">({category.postCount})</span>
                  )}
                  {category._count?.products !== undefined && (
                    <span className="ml-2 text-muted-foreground">
                      ({category._count.products})
                    </span>
                  )}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CategorySelect;
