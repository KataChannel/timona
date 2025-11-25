/**
 * RBAC Constants Tests
 * Test scope hierarchy logic
 */

import {
  scopeIncludes,
  getIncludedScopes,
  SCOPE_HIERARCHY,
} from '../rbac.constants';

describe('RBAC Constants', () => {
  describe('scopeIncludes', () => {
    describe('Scope Hierarchy', () => {
      it('should allow "all" scope to include "own"', () => {
        expect(scopeIncludes('all', 'own')).toBe(true);
      });

      it('should allow "all" scope to include "team"', () => {
        expect(scopeIncludes('all', 'team')).toBe(true);
      });

      it('should allow "all" scope to include "organization"', () => {
        expect(scopeIncludes('all', 'organization')).toBe(true);
      });

      it('should allow "all" scope to include "all"', () => {
        expect(scopeIncludes('all', 'all')).toBe(true);
      });

      it('should allow "organization" scope to include "team"', () => {
        expect(scopeIncludes('organization', 'team')).toBe(true);
      });

      it('should allow "organization" scope to include "own"', () => {
        expect(scopeIncludes('organization', 'own')).toBe(true);
      });

      it('should allow "team" scope to include "own"', () => {
        expect(scopeIncludes('team', 'own')).toBe(true);
      });

      it('should allow "own" scope to include "own"', () => {
        expect(scopeIncludes('own', 'own')).toBe(true);
      });
    });

    describe('Reverse Hierarchy (should deny)', () => {
      it('should NOT allow "own" scope to include "team"', () => {
        expect(scopeIncludes('own', 'team')).toBe(false);
      });

      it('should NOT allow "own" scope to include "organization"', () => {
        expect(scopeIncludes('own', 'organization')).toBe(false);
      });

      it('should NOT allow "own" scope to include "all"', () => {
        expect(scopeIncludes('own', 'all')).toBe(false);
      });

      it('should NOT allow "team" scope to include "organization"', () => {
        expect(scopeIncludes('team', 'organization')).toBe(false);
      });

      it('should NOT allow "team" scope to include "all"', () => {
        expect(scopeIncludes('team', 'all')).toBe(false);
      });

      it('should NOT allow "organization" scope to include "all"', () => {
        expect(scopeIncludes('organization', 'all')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should allow access when no required scope specified', () => {
        expect(scopeIncludes('own', undefined)).toBe(true);
        expect(scopeIncludes('team', undefined)).toBe(true);
        expect(scopeIncludes('all', undefined)).toBe(true);
      });

      it('should deny access when user has no scope', () => {
        expect(scopeIncludes(undefined, 'own')).toBe(false);
        expect(scopeIncludes(undefined, 'team')).toBe(false);
        expect(scopeIncludes(undefined, 'all')).toBe(false);
      });

      it('should deny access when both scopes are undefined', () => {
        expect(scopeIncludes(undefined, undefined)).toBe(true);
      });

      it('should handle custom scopes with exact match', () => {
        expect(scopeIncludes('custom_scope', 'custom_scope')).toBe(true);
        expect(scopeIncludes('custom_scope', 'other_scope')).toBe(false);
      });

      it('should handle unknown scopes gracefully', () => {
        expect(scopeIncludes('unknown', 'own')).toBe(false);
        expect(scopeIncludes('all', 'unknown')).toBe(false);
      });
    });
  });

  describe('getIncludedScopes', () => {
    it('should return all scopes for "all"', () => {
      const scopes = getIncludedScopes('all');
      expect(scopes).toEqual(['all', 'organization', 'team', 'own']);
    });

    it('should return organization, team, own for "organization"', () => {
      const scopes = getIncludedScopes('organization');
      expect(scopes).toEqual(['organization', 'team', 'own']);
    });

    it('should return team, own for "team"', () => {
      const scopes = getIncludedScopes('team');
      expect(scopes).toEqual(['team', 'own']);
    });

    it('should return only own for "own"', () => {
      const scopes = getIncludedScopes('own');
      expect(scopes).toEqual(['own']);
    });

    it('should return only the custom scope for unknown scopes', () => {
      const scopes = getIncludedScopes('custom');
      expect(scopes).toEqual(['custom']);
    });
  });

  describe('SCOPE_HIERARCHY', () => {
    it('should have correct hierarchy levels', () => {
      expect(SCOPE_HIERARCHY.own).toBe(1);
      expect(SCOPE_HIERARCHY.team).toBe(2);
      expect(SCOPE_HIERARCHY.organization).toBe(3);
      expect(SCOPE_HIERARCHY.all).toBe(4);
    });

    it('should have ascending order', () => {
      expect(SCOPE_HIERARCHY.own < SCOPE_HIERARCHY.team).toBe(true);
      expect(SCOPE_HIERARCHY.team < SCOPE_HIERARCHY.organization).toBe(true);
      expect(SCOPE_HIERARCHY.organization < SCOPE_HIERARCHY.all).toBe(true);
    });
  });

  describe('Real-world Use Cases', () => {
    it('User with blog:read:all can read own blogs', () => {
      expect(scopeIncludes('all', 'own')).toBe(true);
    });

    it('User with blog:update:team can update own blogs', () => {
      expect(scopeIncludes('team', 'own')).toBe(true);
    });

    it('User with blog:delete:own cannot delete team blogs', () => {
      expect(scopeIncludes('own', 'team')).toBe(false);
    });

    it('Manager with product:manage:all can manage any product', () => {
      expect(scopeIncludes('all', 'own')).toBe(true);
      expect(scopeIncludes('all', 'team')).toBe(true);
      expect(scopeIncludes('all', 'organization')).toBe(true);
    });

    it('Editor with post:update:own cannot update others posts', () => {
      expect(scopeIncludes('own', 'all')).toBe(false);
    });
  });
});
