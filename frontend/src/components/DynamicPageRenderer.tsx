'use client';

import React, { useEffect, useState } from 'react';
import type { Page, PageBlock, DynamicConfig } from '@/types/page-builder';
// ✅ MIGRATED: Import Dynamic GraphQL
import { useFindUnique } from '@/hooks/useDynamicGraphQL';

interface DynamicPageRendererProps {
  pageTemplate: Page;
  slug: string;
}

export function DynamicPageRenderer({ pageTemplate, slug }: DynamicPageRendererProps) {
  const [renderedBlocks, setRenderedBlocks] = useState<PageBlock[]>([]);

  // ✅ MIGRATED: Load product data with Dynamic GraphQL
  const { data: product, loading, error } = useFindUnique('product', 
    { slug }, // where
    {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        compareAtPrice: true,
        stock: true,
        sku: true,
        images: {
          select: {
            url: true,
            alt: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        }
      },
    },
    {
      skip: !slug || !pageTemplate.isDynamic,
    }
  );

  // Apply data bindings to blocks
  useEffect(() => {
    if (!product || !pageTemplate.dynamicConfig || !pageTemplate.blocks) {
      setRenderedBlocks(pageTemplate.blocks || []);
      return;
    }

    const productData = product; // ✅ MIGRATED: Direct access (no .getProductBySlug wrapper)
    const { dataBindings } = pageTemplate.dynamicConfig;

    // Clone blocks and apply data bindings
    const updatedBlocks = pageTemplate.blocks.map((block) => {
      const binding = dataBindings.find((b) => b.blockId === block.id);
      if (!binding) return block;

      // Get value from product data
      const value = getNestedValue(productData, binding.sourceField);
      
      // Apply transform if specified
      const transformedValue = binding.transform
        ? applyTransform(value, binding.transform)
        : value;

      // Set value to target property
      return setNestedValue(block, binding.targetProperty, transformedValue);
    });

    setRenderedBlocks(updatedBlocks);
  }, [product, pageTemplate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-2">Product not found</p>
          <p className="text-gray-600">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  // Render page with updated blocks
  // Note: You'll need to import and use your actual PageRenderer component
  return (
    <div className="dynamic-page">
      {renderedBlocks.map((block) => (
        <div key={block.id} className="block">
          {/* Render block based on type */}
          {/* This is placeholder - integrate with your actual block renderer */}
          <pre>{JSON.stringify(block, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

// Helper: Get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => {
    // Handle array access: images[0].url
    const arrayMatch = prop.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      return current?.[arrayName]?.[parseInt(index)];
    }
    return current?.[prop];
  }, obj);
}

// Helper: Set nested value in object
function setNestedValue(obj: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const parts = path.split('.');
  let current = clone;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
  return clone;
}

// Helper: Apply transformation
function applyTransform(value: any, transform: string): any {
  switch (transform) {
    case 'formatCurrency':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    
    case 'formatDate':
      return new Date(value).toLocaleDateString('vi-VN');
    
    case 'uppercase':
      return String(value).toUpperCase();
    
    case 'lowercase':
      return String(value).toLowerCase();
    
    default:
      return value;
  }
}

