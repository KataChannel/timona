/**
 * Ownership Decorator
 * Decorator để auto-validate ownership của resource
 */

import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

export interface OwnershipRequirement {
  /**
   * Resource type being accessed (e.g., 'blog', 'product')
   */
  resource: string;

  /**
   * Field name(s) in the resource that contains owner user ID
   * Can be a single field or array of fields to check
   * 
   * @example
   * 'authorId' - Check if resource.authorId === user.id
   * ['authorId', 'createdBy'] - Check if resource.authorId === user.id OR resource.createdBy === user.id
   */
  ownershipField: string | string[];

  /**
   * Parameter name in route params that contains resource ID
   * @default 'id'
   */
  paramName?: string;

  /**
   * Whether to allow access if ownership check fails but user has 'all' scope permission
   * @default true
   */
  allowWithAllScope?: boolean;
}

/**
 * Require ownership of resource
 * 
 * Use this decorator to automatically validate that the user owns the resource
 * before allowing access. Combine with @RequirePermissions for complete access control.
 * 
 * @example
 * ```typescript
 * @Put(':id')
 * @RequirePermissions({ resource: 'blog', action: 'update', scope: 'own' })
 * @RequireOwnership({ resource: 'blog', ownershipField: 'authorId' })
 * async updateBlog(@Param('id') id: string, @Body() data: UpdateBlogDto) {
 *   return this.blogService.update(id, data);
 * }
 * ```
 * 
 * @example Multiple ownership fields
 * ```typescript
 * @Delete(':id')
 * @RequirePermissions({ resource: 'post', action: 'delete', scope: 'own' })
 * @RequireOwnership({ resource: 'post', ownershipField: ['authorId', 'createdBy'] })
 * async deletePost(@Param('id') id: string) {
 *   return this.postService.delete(id);
 * }
 * ```
 */
export const RequireOwnership = (requirement: OwnershipRequirement) =>
  SetMetadata(OWNERSHIP_KEY, {
    ...requirement,
    paramName: requirement.paramName || 'id',
    allowWithAllScope: requirement.allowWithAllScope !== false,
  });
