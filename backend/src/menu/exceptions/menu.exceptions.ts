import { NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';

export class MenuNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Menu with identifier "${identifier}" not found`);
  }
}

export class MenuAlreadyExistsException extends ConflictException {
  constructor(slug: string) {
    super(`Menu with slug "${slug}" already exists`);
  }
}

export class MenuProtectedException extends ForbiddenException {
  constructor(menuId: string) {
    super(`Menu "${menuId}" is protected and cannot be modified or deleted`);
  }
}

export class MenuCircularReferenceException extends BadRequestException {
  constructor() {
    super('Circular reference detected in menu hierarchy');
  }
}

export class MenuInvalidParentException extends BadRequestException {
  constructor(parentId: string) {
    super(`Invalid parent menu with ID "${parentId}"`);
  }
}

export class MenuMaxDepthExceededException extends BadRequestException {
  constructor(maxDepth: number) {
    super(`Menu hierarchy depth cannot exceed ${maxDepth} levels`);
  }
}
