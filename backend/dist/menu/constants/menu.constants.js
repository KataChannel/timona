"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENU_ERROR_MESSAGES = exports.MENU_CONSTANTS = void 0;
exports.MENU_CONSTANTS = {
    MAX_DEPTH: 5,
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
    DEFAULT_ORDER: 0,
    MAX_ORDER: 9999,
    MAX_TITLE_LENGTH: 100,
    MAX_SLUG_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_URL_LENGTH: 500,
    MAX_ICON_LENGTH: 50,
    MAX_CSS_CLASS_LENGTH: 100,
};
exports.MENU_ERROR_MESSAGES = {
    NOT_FOUND: 'Menu not found',
    ALREADY_EXISTS: 'Menu with this slug already exists',
    PROTECTED: 'This menu is protected and cannot be modified',
    CIRCULAR_REFERENCE: 'Circular reference detected in menu hierarchy',
    INVALID_PARENT: 'Invalid parent menu',
    MAX_DEPTH_EXCEEDED: 'Maximum menu depth exceeded',
    HAS_CHILDREN: 'Cannot delete menu with children',
};
//# sourceMappingURL=menu.constants.js.map