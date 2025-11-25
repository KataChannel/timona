import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Menu } from '@prisma/client';

@ObjectType()
export class MenuHierarchicalDto {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  type!: string;

  @Field({ nullable: true })
  parentId?: string | null;

  @Field(() => Int)
  order!: number;

  @Field(() => Int)
  level!: number;

  @Field({ nullable: true })
  path?: string | null;

  @Field({ nullable: true })
  url?: string | null;

  @Field({ nullable: true })
  route?: string | null;

  @Field({ nullable: true })
  externalUrl?: string | null;

  @Field()
  target!: string;

  @Field({ nullable: true })
  icon?: string | null;

  @Field({ nullable: true })
  iconType?: string | null;

  @Field({ nullable: true })
  badge?: string | null;

  @Field({ nullable: true })
  badgeColor?: string | null;

  @Field({ nullable: true })
  image?: string | null;

  @Field(() => [String])
  requiredPermissions!: string[];

  @Field(() => [String])
  requiredRoles!: string[];

  @Field()
  isPublic!: boolean;

  @Field()
  isActive!: boolean;

  @Field()
  isVisible!: boolean;

  @Field()
  isProtected!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field({ nullable: true })
  createdBy?: string | null;

  @Field({ nullable: true })
  updatedBy?: string | null;

  @Field(() => [MenuHierarchicalDto], { nullable: true })
  children?: MenuHierarchicalDto[] | null;

  static fromEntity(menu: any): MenuHierarchicalDto {
    const dto = new MenuHierarchicalDto();
    const { children, ...rest } = menu;
    
    Object.assign(dto, rest);
    
    if (children && Array.isArray(children)) {
      dto.children = children.map((child: any) => MenuHierarchicalDto.fromEntity(child));
    }
    
    return dto;
  }

  static fromEntities(menus: any[]): MenuHierarchicalDto[] {
    return menus.map((menu) => MenuHierarchicalDto.fromEntity(menu));
  }
}
