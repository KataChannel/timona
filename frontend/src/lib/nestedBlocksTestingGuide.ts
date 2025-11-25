/**
 * Nested Blocks Testing & Verification Guide
 * 
 * Manual testing checklist dan common issues
 */

// ========== MANUAL TESTING CHECKLIST ==========

/**
 * TEST 1: Add Nested Block
 * 
 * Steps:
 * 1. Create a Container block in canvas
 * 2. Hover over Container block
 * 3. Click "Add Child" button
 * 4. Select "Text Block" dari dialog
 * 
 * Expected:
 * ✓ Text block muncul inside Container
 * ✓ Indentation menunjukkan nesting
 * ✓ Counter di Container settings menampilkan "1 nested block"
 * ✓ Data disave di backend
 */

/**
 * TEST 2: Drag Block ke Container
 * 
 * Steps:
 * 1. Create Flex Container dan Text Block di canvas
 * 2. Drag Text Block over Container
 * 3. Drop di atas Container
 * 
 * Expected:
 * ✓ Text Block berubah jadi nested child
 * ✓ Blue ring visual feedback saat hover
 * ✓ "Drop here" message muncul
 * ✓ Block muncul di dalam Container setelah drop
 */

/**
 * TEST 3: Deep Nesting (3+ levels)
 * 
 * Steps:
 * 1. Container > Flex > Container > Text
 * 2. Nested blocks di setiap level
 * 3. Edit blocks di deep levels
 * 
 * Expected:
 * ✓ All levels render correctly
 * ✓ Editing works at all depths
 * ✓ Depth counter in settings shows correct level
 * ✗ Warning jika exceed max depth (10)
 */

/**
 * TEST 4: Reorder Nested Blocks
 * 
 * Steps:
 * 1. Create Container with 3 Text blocks
 * 2. Drag Text block 3 ke position 1
 * 
 * Expected:
 * ✓ Order berubah dalam Container
 * ✓ Visual feedback saat drag
 * ✓ Data disave ke backend
 * ✓ Order persisten setelah reload
 */

/**
 * TEST 5: Delete Nested Block
 * 
 * Steps:
 * 1. Create Container with nested Text block
 * 2. Hover nested Text block
 * 3. Click delete button
 * 4. Confirm delete
 * 
 * Expected:
 * ✓ Nested block dihapus
 * ✓ Container counter diupdate
 * ✓ Data disave
 * ✓ No dangling references
 */

/**
 * TEST 6: Edit Nested Block
 * 
 * Steps:
 * 1. Create Container > Text block
 * 2. Click text block untuk select
 * 3. Edit via Right Panel
 * 4. Change text content
 * 
 * Expected:
 * ✓ Edit panel shows correct block
 * ✓ Changes apply immediately
 * ✓ Changes persist setelah reload
 */

/**
 * TEST 7: Edit Container Settings
 * 
 * Steps:
 * 1. Create Container dengan nested blocks
 * 2. Click Settings icon
 * 3. Change Layout dari "stack" ke "wrap"
 * 4. Change Gap dari 16 ke 32
 * 5. Save settings
 * 
 * Expected:
 * ✓ Layout berubah visual
 * ✓ Gap increases antara nested blocks
 * ✓ Settings disave
 * ✓ Persisten setelah reload
 */

/**
 * TEST 8: Mixed Container Types
 * 
 * Steps:
 * 1. Create Grid > Flex Row > Container structure
 * 2. Add different blocks di setiap level
 * 3. Test drag-drop across types
 * 
 * Expected:
 * ✓ All container types work as parents
 * ✓ Drag-drop works across types
 * ✓ Editing works for all combinations
 */

/**
 * TEST 9: Empty Container Behavior
 * 
 * Steps:
 * 1. Create Container tanpa children
 * 2. Add child, then delete all
 * 3. Verify empty state message
 * 
 * Expected:
 * ✓ Empty state message muncul
 * ✓ Counter shows "0 nested blocks"
 * ✓ Can still add more blocks
 */

/**
 * TEST 10: Save & Load
 * 
 * Steps:
 * 1. Create complex nested structure
 * 2. Save page
 * 3. Reload page
 * 4. Verify structure intact
 * 
 * Expected:
 * ✓ Nested structure persisten
 * ✓ All properties preserved
 * ✓ Order maintained
 * ✓ No data loss
 */

// ========== COMMON ISSUES & SOLUTIONS ==========

/**
 * ISSUE 1: Nested blocks tidak muncul
 * 
 * Diagnosis:
 * - Check browser console untuk errors
 * - Verify block.children array ada
 * - Check parent adalah container type
 * 
 * Solution:
 * 1. Open DevTools > Network
 * 2. Check GraphQL query returns children
 * 3. Verify BlockRenderer renders all children
 * 4. Check nested block IDs unique
 */

/**
 * ISSUE 2: Drag-drop tidak bekerja
 * 
 * Diagnosis:
 * - Droppable zone tidak menerima drops
 * - Drag feedback tidak muncul
 * 
 * Solution:
 * 1. Verify dnd-kit setup di PageBuilderCanvas
 * 2. Check droppable ref diset correctly
 * 3. Verify data.type match accepted types
 * 4. Check depth tidak exceed max
 */

/**
 * ISSUE 3: Settings tidak tersimpan
 * 
 * Diagnosis:
 * - Changes tidak persist setelah reload
 * - GraphQL mutation failed
 * 
 * Solution:
 * 1. Check handleBlockUpdate dipanggil
 * 2. Verify GraphQL mutation berhasil (check Network tab)
 * 3. Check blockId correct
 * 4. Verify API response diterima
 */

/**
 * ISSUE 4: Performance lambat dengan deep nesting
 * 
 * Diagnosis:
 * - Lag saat scroll/drag di deeply nested blocks
 * - Re-renders terlalu sering
 * 
 * Solution:
 * 1. Implement memoization di hooks
 * 2. Use React.memo untuk components
 * 3. Batasi max nesting depth
 * 4. Lazy load deeply nested blocks
 */

/**
 * ISSUE 5: Delete nested block causes issues
 * 
 * Diagnosis:
 * - Parent tidak update setelah delete
 * - Counter tidak berubah
 * 
 * Solution:
 * 1. Verify handleBlockDelete dipanggil
 * 2. Check parent refetch setelah delete
 * 3. Verify order recomputed untuk siblings
 * 4. Check no dangling references
 */

// ========== DEBUG UTILITIES ==========

export const debugNestedBlocks = {
  /**
   * Print block tree structure
   */
  printTree: (block: any, indent = 0) => {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}📦 ${block.type} (id: ${block.id}, order: ${block.order})`);
    if (block.children?.length) {
      block.children.forEach((child: any) => {
        debugNestedBlocks.printTree(child, indent + 1);
      });
    }
  },

  /**
   * Validate nested structure
   */
  validate: (block: any): string[] => {
    const errors: string[] = [];
    
    // Check for duplicate IDs
    const ids = new Set<string>();
    const checkIds = (b: any) => {
      if (ids.has(b.id)) errors.push(`Duplicate ID: ${b.id}`);
      ids.add(b.id);
      b.children?.forEach(checkIds);
    };
    checkIds(block);

    // Check depth
    const maxDepth = 10;
    const checkDepth = (b: any, depth: number) => {
      if (depth > maxDepth) {
        errors.push(`Depth ${depth} exceeds max ${maxDepth}`);
      }
      b.children?.forEach((c: any) => checkDepth(c, depth + 1));
    };
    checkDepth(block, 0);

    return errors;
  },

  /**
   * Count nested blocks
   */
  countAll: (block: any): number => {
    let count = 1; // Include self
    block.children?.forEach((child: any) => {
      count += debugNestedBlocks.countAll(child);
    });
    return count;
  },

  /**
   * Get max depth
   */
  getDepth: (block: any): number => {
    if (!block.children?.length) return 0;
    return 1 + Math.max(...block.children.map(debugNestedBlocks.getDepth));
  },
};

// ========== PERFORMANCE MONITORING ==========

export const performanceMonitor = {
  /**
   * Monitor render time
   */
  measureRenderTime: (blockId: string, startTime: number) => {
    const duration = performance.now() - startTime;
    if (duration > 100) {
      console.warn(`⚠️ Slow render for block ${blockId}: ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✓ Block ${blockId} rendered in ${duration.toFixed(2)}ms`);
    }
  },

  /**
   * Check for unnecessary re-renders
   */
  trackRenders: (blockId: string) => {
    const key = `render-count-${blockId}`;
    const count = (window as any)[key] || 0;
    (window as any)[key] = count + 1;
    if (count > 0) {
      console.warn(`⚠️ Block ${blockId} re-rendered ${count + 1} times`);
    }
  },
};

// ========== END-TO-END TEST SCENARIO ==========

/**
 * Create complex page structure for testing:
 * 
 * Page
 * ├─ Hero Block (top-level)
 * ├─ Container (stack layout)
 * │  ├─ Text Block: "Section Title"
 * │  └─ Grid Layout
 * │     ├─ Flex Row
 * │     │  ├─ Image Block
 * │     │  └─ Text Block: "Description"
 * │     ├─ Flex Row
 * │     │  ├─ Image Block
 * │     │  └─ Text Block: "Description"
 * │     └─ Flex Row
 * │        ├─ Image Block
 * │        └─ Text Block: "Description"
 * ├─ Section
 * │  └─ Flex Column
 * │     ├─ Heading Block
 * │     ├─ Text Block
 * │     └─ Button Block
 * └─ Footer Block (top-level)
 * 
 * Testing flow:
 * 1. Create above structure
 * 2. Save page
 * 3. Reload and verify intact
 * 4. Edit block at depth 3
 * 5. Reorder blocks at different levels
 * 6. Delete nested block
 * 7. Add new block deep inside
 * 8. Verify all changes persist
 */
