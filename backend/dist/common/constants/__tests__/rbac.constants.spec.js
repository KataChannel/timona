"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rbac_constants_1 = require("../rbac.constants");
describe('RBAC Constants', () => {
    describe('scopeIncludes', () => {
        describe('Scope Hierarchy', () => {
            it('should allow "all" scope to include "own"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('all', 'own')).toBe(true);
            });
            it('should allow "all" scope to include "team"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('all', 'team')).toBe(true);
            });
            it('should allow "all" scope to include "organization"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('all', 'organization')).toBe(true);
            });
            it('should allow "all" scope to include "all"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('all', 'all')).toBe(true);
            });
            it('should allow "organization" scope to include "team"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('organization', 'team')).toBe(true);
            });
            it('should allow "organization" scope to include "own"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('organization', 'own')).toBe(true);
            });
            it('should allow "team" scope to include "own"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('team', 'own')).toBe(true);
            });
            it('should allow "own" scope to include "own"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('own', 'own')).toBe(true);
            });
        });
        describe('Reverse Hierarchy (should deny)', () => {
            it('should NOT allow "own" scope to include "team"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('own', 'team')).toBe(false);
            });
            it('should NOT allow "own" scope to include "organization"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('own', 'organization')).toBe(false);
            });
            it('should NOT allow "own" scope to include "all"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('own', 'all')).toBe(false);
            });
            it('should NOT allow "team" scope to include "organization"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('team', 'organization')).toBe(false);
            });
            it('should NOT allow "team" scope to include "all"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('team', 'all')).toBe(false);
            });
            it('should NOT allow "organization" scope to include "all"', () => {
                expect((0, rbac_constants_1.scopeIncludes)('organization', 'all')).toBe(false);
            });
        });
        describe('Edge Cases', () => {
            it('should allow access when no required scope specified', () => {
                expect((0, rbac_constants_1.scopeIncludes)('own', undefined)).toBe(true);
                expect((0, rbac_constants_1.scopeIncludes)('team', undefined)).toBe(true);
                expect((0, rbac_constants_1.scopeIncludes)('all', undefined)).toBe(true);
            });
            it('should deny access when user has no scope', () => {
                expect((0, rbac_constants_1.scopeIncludes)(undefined, 'own')).toBe(false);
                expect((0, rbac_constants_1.scopeIncludes)(undefined, 'team')).toBe(false);
                expect((0, rbac_constants_1.scopeIncludes)(undefined, 'all')).toBe(false);
            });
            it('should deny access when both scopes are undefined', () => {
                expect((0, rbac_constants_1.scopeIncludes)(undefined, undefined)).toBe(true);
            });
            it('should handle custom scopes with exact match', () => {
                expect((0, rbac_constants_1.scopeIncludes)('custom_scope', 'custom_scope')).toBe(true);
                expect((0, rbac_constants_1.scopeIncludes)('custom_scope', 'other_scope')).toBe(false);
            });
            it('should handle unknown scopes gracefully', () => {
                expect((0, rbac_constants_1.scopeIncludes)('unknown', 'own')).toBe(false);
                expect((0, rbac_constants_1.scopeIncludes)('all', 'unknown')).toBe(false);
            });
        });
    });
    describe('getIncludedScopes', () => {
        it('should return all scopes for "all"', () => {
            const scopes = (0, rbac_constants_1.getIncludedScopes)('all');
            expect(scopes).toEqual(['all', 'organization', 'team', 'own']);
        });
        it('should return organization, team, own for "organization"', () => {
            const scopes = (0, rbac_constants_1.getIncludedScopes)('organization');
            expect(scopes).toEqual(['organization', 'team', 'own']);
        });
        it('should return team, own for "team"', () => {
            const scopes = (0, rbac_constants_1.getIncludedScopes)('team');
            expect(scopes).toEqual(['team', 'own']);
        });
        it('should return only own for "own"', () => {
            const scopes = (0, rbac_constants_1.getIncludedScopes)('own');
            expect(scopes).toEqual(['own']);
        });
        it('should return only the custom scope for unknown scopes', () => {
            const scopes = (0, rbac_constants_1.getIncludedScopes)('custom');
            expect(scopes).toEqual(['custom']);
        });
    });
    describe('SCOPE_HIERARCHY', () => {
        it('should have correct hierarchy levels', () => {
            expect(rbac_constants_1.SCOPE_HIERARCHY.own).toBe(1);
            expect(rbac_constants_1.SCOPE_HIERARCHY.team).toBe(2);
            expect(rbac_constants_1.SCOPE_HIERARCHY.organization).toBe(3);
            expect(rbac_constants_1.SCOPE_HIERARCHY.all).toBe(4);
        });
        it('should have ascending order', () => {
            expect(rbac_constants_1.SCOPE_HIERARCHY.own < rbac_constants_1.SCOPE_HIERARCHY.team).toBe(true);
            expect(rbac_constants_1.SCOPE_HIERARCHY.team < rbac_constants_1.SCOPE_HIERARCHY.organization).toBe(true);
            expect(rbac_constants_1.SCOPE_HIERARCHY.organization < rbac_constants_1.SCOPE_HIERARCHY.all).toBe(true);
        });
    });
    describe('Real-world Use Cases', () => {
        it('User with blog:read:all can read own blogs', () => {
            expect((0, rbac_constants_1.scopeIncludes)('all', 'own')).toBe(true);
        });
        it('User with blog:update:team can update own blogs', () => {
            expect((0, rbac_constants_1.scopeIncludes)('team', 'own')).toBe(true);
        });
        it('User with blog:delete:own cannot delete team blogs', () => {
            expect((0, rbac_constants_1.scopeIncludes)('own', 'team')).toBe(false);
        });
        it('Manager with product:manage:all can manage any product', () => {
            expect((0, rbac_constants_1.scopeIncludes)('all', 'own')).toBe(true);
            expect((0, rbac_constants_1.scopeIncludes)('all', 'team')).toBe(true);
            expect((0, rbac_constants_1.scopeIncludes)('all', 'organization')).toBe(true);
        });
        it('Editor with post:update:own cannot update others posts', () => {
            expect((0, rbac_constants_1.scopeIncludes)('own', 'all')).toBe(false);
        });
    });
});
//# sourceMappingURL=rbac.constants.spec.js.map