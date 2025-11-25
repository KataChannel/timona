import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

interface RbacTableSkeletonProps {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
}

const RbacTableSkeleton: React.FC<RbacTableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  showAvatar = false,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              {colIndex === 0 && showAvatar ? (
                // First column with avatar
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ) : colIndex === 0 ? (
                // First column without avatar
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              ) : colIndex === columns - 1 ? (
                // Last column (actions)
                <div className="flex items-center gap-2 justify-end">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ) : (
                // Other columns
                <Skeleton className="h-4 w-[100px]" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default RbacTableSkeleton;
