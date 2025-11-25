export interface Product {
  id: string;
  ten: string | null;
  ten2: string | null;
  ma: string | null;
  dvt: string | null;
  dgia: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizationResult {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    normalized: number;
    pending: number;
  };
}

export interface ProductStats {
  total: number;
  normalized: number;
  pending: number;
}

export type SortField = 'ten' | 'ma' | 'dgia' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
export type FilterStatus = 'all' | 'normalized' | 'pending';
export type UniqueFilter = 'none' | 'ma' | 'ten2';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
