import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MenuService } from '../../services/menu.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MenuType } from '../types/menu.type';
import { CreateMenuInput, UpdateMenuInput } from '../inputs/menu.input';

@Resolver(() => MenuType)
export class MenuResolver {
  constructor(private menuService: MenuService) {}

  @Query(() => [MenuType], { name: 'menus' })
  async getMenus(@Args('type', { nullable: true }) type?: string) {
    return this.menuService.getMenus(type);
  }

  @Query(() => MenuType, { name: 'menu' })
  async getMenu(@Args('id', { type: () => ID }) id: string) {
    return this.menuService.getMenuById(id);
  }

  @Query(() => MenuType, { name: 'menuBySlug' })
  async getMenuBySlug(@Args('slug') slug: string) {
    return this.menuService.getMenuBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => MenuType)
  async createMenu(
    @Args('input') input: CreateMenuInput,
    @Context() context: any,
  ) {
    const userId = context.req?.user?.id;
    return this.menuService.createMenu(input, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => MenuType)
  async updateMenu(
    @Args('input') input: UpdateMenuInput,
    @Context() context: any,
  ) {
    const userId = context.req?.user?.id;
    return this.menuService.updateMenu(input.id, input, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteMenu(@Args('id', { type: () => ID }) id: string) {
    return this.menuService.deleteMenu(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async reorderMenus(
    @Args('items', { type: () => [ReorderMenuInput] }) items: ReorderMenuInput[],
  ) {
    return this.menuService.reorderMenus(items);
  }
}

// Helper input for reordering
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
class ReorderMenuInput {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number;
}
