import { MenuTreeItem } from '@/components/menu/SortableMenuRow';
import { Menu } from '@/lib/graphql/menu-dynamic-queries';

/**
 * Build hierarchical menu tree from flat array
 */
export function buildMenuTree(items: Menu[], expandedMenus: Set<string>): MenuTreeItem[] {
  const map = new Map<string, MenuTreeItem>();
  const roots: MenuTreeItem[] = [];

  // Create map of all items
  items.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
      expanded: expandedMenus.has(item.id),
    });
  });

  // Build tree structure
  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by order recursively
  const sortByOrder = (nodes: MenuTreeItem[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((node) => {
      if (node.children) sortByOrder(node.children);
    });
  };
  sortByOrder(roots);

  return roots;
}

/**
 * Flatten tree structure for drag and drop
 */
export function flattenMenuTree(tree: MenuTreeItem[]): Menu[] {
  const result: Menu[] = [];
  const flatten = (items: MenuTreeItem[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children && item.expanded) {
        flatten(item.children);
      }
    });
  };
  flatten(tree);
  return result;
}

/**
 * Get menu type color
 */
export function getMenuTypeColor(type: string): string {
  const colors: Record<string, string> = {
    SIDEBAR: 'bg-blue-100 text-blue-800',
    HEADER: 'bg-green-100 text-green-800',
    FOOTER: 'bg-purple-100 text-purple-800',
    MOBILE: 'bg-orange-100 text-orange-800',
    CUSTOM: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.CUSTOM;
}
