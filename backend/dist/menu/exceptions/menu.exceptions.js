"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuMaxDepthExceededException = exports.MenuInvalidParentException = exports.MenuCircularReferenceException = exports.MenuProtectedException = exports.MenuAlreadyExistsException = exports.MenuNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class MenuNotFoundException extends common_1.NotFoundException {
    constructor(identifier) {
        super(`Menu with identifier "${identifier}" not found`);
    }
}
exports.MenuNotFoundException = MenuNotFoundException;
class MenuAlreadyExistsException extends common_1.ConflictException {
    constructor(slug) {
        super(`Menu with slug "${slug}" already exists`);
    }
}
exports.MenuAlreadyExistsException = MenuAlreadyExistsException;
class MenuProtectedException extends common_1.ForbiddenException {
    constructor(menuId) {
        super(`Menu "${menuId}" is protected and cannot be modified or deleted`);
    }
}
exports.MenuProtectedException = MenuProtectedException;
class MenuCircularReferenceException extends common_1.BadRequestException {
    constructor() {
        super('Circular reference detected in menu hierarchy');
    }
}
exports.MenuCircularReferenceException = MenuCircularReferenceException;
class MenuInvalidParentException extends common_1.BadRequestException {
    constructor(parentId) {
        super(`Invalid parent menu with ID "${parentId}"`);
    }
}
exports.MenuInvalidParentException = MenuInvalidParentException;
class MenuMaxDepthExceededException extends common_1.BadRequestException {
    constructor(maxDepth) {
        super(`Menu hierarchy depth cannot exceed ${maxDepth} levels`);
    }
}
exports.MenuMaxDepthExceededException = MenuMaxDepthExceededException;
//# sourceMappingURL=menu.exceptions.js.map