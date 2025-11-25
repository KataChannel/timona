import { useQuery, useMutation } from '@apollo/client';
import React from 'react';
import {
  GET_CATEGORIES,
  GET_CATEGORY_TREE,
  GET_CATEGORY,
  GET_CATEGORY_BY_SLUG,
  GET_ACTIVE_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  Category,
  PaginatedCategories,
  GetCategoriesInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../graphql/category.queries';

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useCategories(input?: GetCategoriesInput) {
  const { data, loading, error, refetch } = useQuery<{
    categories: PaginatedCategories;
  }>(GET_CATEGORIES, {
    variables: { input },
  });

  return {
    categories: data?.categories.items || [],
    pagination: {
      total: data?.categories.total || 0,
      page: data?.categories.page || 1,
      limit: data?.categories.limit || 10,
      totalPages: data?.categories.totalPages || 0,
    },
    loading,
    error,
    refetch,
  };
}

export function useCategoryTree() {
  const { data, loading, error, refetch } = useQuery<{
    categoryTree: Category[];
  }>(GET_CATEGORY_TREE);

  return {
    categoryTree: data?.categoryTree || [],
    loading,
    error,
    refetch,
  };
}

export function useCategory(id: string) {
  const { data, loading, error, refetch } = useQuery<{ category: Category }>(
    GET_CATEGORY,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    category: data?.category,
    loading,
    error,
    refetch,
  };
}

export function useCategoryBySlug(slug: string) {
  const { data, loading, error, refetch } = useQuery<{
    categoryBySlug: Category;
  }>(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  return {
    category: data?.categoryBySlug,
    loading,
    error,
    refetch,
  };
}

export function useActiveCategories() {
  const { data, loading, error, refetch } = useQuery<{
    categories: PaginatedCategories;
  }>(GET_ACTIVE_CATEGORIES);

  return {
    categories: data?.categories.items || [],
    total: data?.categories.total || 0,
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateCategory() {
  const [createCategory, { data, loading, error }] = useMutation<
    { createCategory: Category },
    { input: CreateCategoryInput }
  >(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }, { query: GET_CATEGORY_TREE }],
  });

  return {
    createCategory: (input: CreateCategoryInput) =>
      createCategory({ variables: { input } }),
    category: data?.createCategory,
    loading,
    error,
  };
}

export function useUpdateCategory() {
  const [updateCategory, { data, loading, error }] = useMutation<
    { updateCategory: Category },
    { id: string; input: UpdateCategoryInput }
  >(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORY_TREE }],
  });

  return {
    updateCategory: (id: string, input: UpdateCategoryInput) =>
      updateCategory({ variables: { id, input } }),
    category: data?.updateCategory,
    loading,
    error,
  };
}

export function useDeleteCategory() {
  const [deleteCategory, { data, loading, error }] = useMutation<
    { deleteCategory: boolean },
    { id: string }
  >(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }, { query: GET_CATEGORY_TREE }],
  });

  return {
    deleteCategory: (id: string) => deleteCategory({ variables: { id } }),
    success: data?.deleteCategory,
    loading,
    error,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useCategoryManagement() {
  const { createCategory, loading: creating, error: createError } = useCreateCategory();
  const { updateCategory, loading: updating, error: updateError } = useUpdateCategory();
  const { deleteCategory, loading: deleting, error: deleteError } = useDeleteCategory();

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading: creating || updating || deleting,
    error: createError || updateError || deleteError,
  };
}

export function useCategorySelector() {
  const { categoryTree, loading, error } = useCategoryTree();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (cats: Category[], level: number = 0) => {
      cats.forEach((cat) => {
        result.push({ ...cat, level } as Category & { level: number });
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, level + 1);
        }
      });
    };
    flatten(categories);
    return result;
  };

  const flatCategories = React.useMemo(
    () => flattenCategories(categoryTree),
    [categoryTree]
  );

  const selectedCategory = React.useMemo(
    () => flatCategories.find((cat) => cat.id === selectedCategoryId),
    [flatCategories, selectedCategoryId]
  );

  return {
    categoryTree,
    flatCategories,
    selectedCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    error,
  };
}

export function useCategoryNavigation() {
  const { categoryTree, loading, error } = useCategoryTree();
  const [breadcrumbs, setBreadcrumbs] = React.useState<Category[]>([]);

  const findCategoryPath = (
    categories: Category[],
    targetId: string,
    path: Category[] = []
  ): Category[] | null => {
    for (const category of categories) {
      const currentPath = [...path, category];
      if (category.id === targetId) {
        return currentPath;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryPath(category.children, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const navigateToCategory = (categoryId: string) => {
    const path = findCategoryPath(categoryTree, categoryId);
    if (path) {
      setBreadcrumbs(path);
    }
  };

  return {
    categoryTree,
    breadcrumbs,
    navigateToCategory,
    loading,
    error,
  };
}
