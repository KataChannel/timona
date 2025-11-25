'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useDynamicQuery } from '@/lib/graphql/dynamic-hooks';
import { useMutation } from '@apollo/client';
import { UPDATE_PRODUCTS_FROM_DETAILS } from './graphql/mutations';

// Types
import { SortField, SortDirection, FilterStatus, UniqueFilter, NormalizationResult } from './types';

// Components
import {
  StatsCards,
  SearchToolbar,
  ProductTable,
  Pagination,
  NormalizationModal,
  UpdateProductsModal,
} from './components';

// Hooks
import { useProductFilters, useProductPagination } from './hooks';

export default function SanPhamPage() {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [uniqueFilter, setUniqueFilter] = useState<UniqueFilter>('none');
  const [normalizing, setNormalizing] = useState(false);
  const [showNormalizeModal, setShowNormalizeModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // GraphQL query
  const { data: productsData, loading: queryLoading, refetch } = useDynamicQuery('GET_ALL', 'ext_sanphamhoadon', {
    fetchPolicy: 'network-only',
  });

  // GraphQL mutation for update products
  const [updateProductsMutation] = useMutation(UPDATE_PRODUCTS_FROM_DETAILS);

  // Extract products from GraphQL response
  const rawProducts = productsData?.getext_sanphamhoadons || [];

  // Apply filters and sorting
  const { filteredProducts, stats } = useProductFilters({
    products: rawProducts,
    searchTerm,
    filterStatus,
    uniqueFilter,
    sortField,
    sortDirection,
  });

  // Apply pagination
  const { paginatedProducts } = useProductPagination({
    products: filteredProducts,
    page,
    limit,
    setPage,
    dependencies: [searchTerm, filterStatus, uniqueFilter, sortField, sortDirection],
  });

  // Handlers
  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Đã tải lại dữ liệu');
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Lỗi khi tải dữ liệu');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleNormalization = async (dryRun: boolean, limitValue: number) => {
    setNormalizing(true);
    
    try {
      const response = await fetch('/api/ketoan/normalize-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun, limit: limitValue }),
      });

      const result: NormalizationResult = await response.json();

      if (result.success) {
        toast.success(result.message);
        if (!dryRun) {
          await handleRefresh();
        }
        setShowNormalizeModal(false);
      } else {
        toast.error(result.message || 'Lỗi khi chuẩn hóa dữ liệu');
      }
    } catch (error) {
      console.error('Normalization error:', error);
      toast.error('Không thể kết nối với server');
    } finally {
      setNormalizing(false);
    }
  };

  const handleUpdate = async (dryRun: boolean, limitValue: number) => {
    setUpdating(true);
    
    try {
      // Use GraphQL mutation instead of REST API
      const { data } = await updateProductsMutation({
        variables: {
          dryRun,
          limit: limitValue,
        },
      });

      const result = data?.updateProductsFromDetails;

      if (result?.success) {
        toast.success(result.message);
        
        // Show stats if available
        if (result.stats) {
          const { created, updated, skipped, errors } = result.stats;
          console.log('Update stats:', { created, updated, skipped, errors });
        }
        
        if (!dryRun) {
          await handleRefresh();
        }
        setShowUpdateModal(false);
      } else {
        toast.error(result?.message || 'Lỗi khi cập nhật sản phẩm');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Không thể kết nối với server');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quản Lý Sản Phẩm
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Danh sách sản phẩm từ hóa đơn với tính năng chuẩn hóa tên sản phẩm
        </p>
      </div>

      {/* Search Toolbar */}
      <SearchToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        uniqueFilter={uniqueFilter}
        onUniqueFilterChange={setUniqueFilter}
        stats={stats}
        filteredCount={filteredProducts.length}
        loading={queryLoading}
        onRefresh={handleRefresh}
        onNormalize={() => setShowNormalizeModal(true)}
        onUpdate={() => setShowUpdateModal(true)}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Products Table */}
      <ProductTable
        products={paginatedProducts}
        loading={queryLoading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage={
          searchTerm || filterStatus !== 'all'
            ? 'Không tìm thấy sản phẩm phù hợp'
            : 'Không có dữ liệu'
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={filteredProducts.length}
        itemsPerPage={limit}
        onPageChange={setPage}
      />

      {/* Normalization Modal */}
      <NormalizationModal
        isOpen={showNormalizeModal}
        onClose={() => setShowNormalizeModal(false)}
        onNormalize={handleNormalization}
        loading={normalizing}
      />

      {/* Update Products Modal */}
      <UpdateProductsModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdate}
        loading={updating}
      />
    </div>
  );
}
