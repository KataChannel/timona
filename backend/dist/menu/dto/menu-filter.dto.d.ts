import { MenuType } from '@prisma/client';
export declare class MenuFilterDto {
    type?: MenuType;
    parentId?: string;
    isActive?: boolean;
    isVisible?: boolean;
    isPublic?: boolean;
    search?: string;
}
