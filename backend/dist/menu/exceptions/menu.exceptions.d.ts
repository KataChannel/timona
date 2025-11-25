import { NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
export declare class MenuNotFoundException extends NotFoundException {
    constructor(identifier: string);
}
export declare class MenuAlreadyExistsException extends ConflictException {
    constructor(slug: string);
}
export declare class MenuProtectedException extends ForbiddenException {
    constructor(menuId: string);
}
export declare class MenuCircularReferenceException extends BadRequestException {
    constructor();
}
export declare class MenuInvalidParentException extends BadRequestException {
    constructor(parentId: string);
}
export declare class MenuMaxDepthExceededException extends BadRequestException {
    constructor(maxDepth: number);
}
