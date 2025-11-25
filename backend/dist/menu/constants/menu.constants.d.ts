export declare const MENU_CONSTANTS: {
    readonly MAX_DEPTH: 5;
    readonly DEFAULT_PAGE_SIZE: 50;
    readonly MAX_PAGE_SIZE: 100;
    readonly MIN_PAGE_SIZE: 1;
    readonly DEFAULT_ORDER: 0;
    readonly MAX_ORDER: 9999;
    readonly MAX_TITLE_LENGTH: 100;
    readonly MAX_SLUG_LENGTH: 100;
    readonly MAX_DESCRIPTION_LENGTH: 500;
    readonly MAX_URL_LENGTH: 500;
    readonly MAX_ICON_LENGTH: 50;
    readonly MAX_CSS_CLASS_LENGTH: 100;
};
export declare const MENU_ERROR_MESSAGES: {
    readonly NOT_FOUND: "Menu not found";
    readonly ALREADY_EXISTS: "Menu with this slug already exists";
    readonly PROTECTED: "This menu is protected and cannot be modified";
    readonly CIRCULAR_REFERENCE: "Circular reference detected in menu hierarchy";
    readonly INVALID_PARENT: "Invalid parent menu";
    readonly MAX_DEPTH_EXCEEDED: "Maximum menu depth exceeded";
    readonly HAS_CHILDREN: "Cannot delete menu with children";
};
