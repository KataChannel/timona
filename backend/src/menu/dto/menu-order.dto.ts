import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsInt, Min } from 'class-validator';

/**
 * DTO for menu ordering/reordering operations
 */
@InputType()
export class MenuOrderDto {
  @Field(() => ID, { description: 'Menu ID' })
  @IsString()
  id!: string;

  @Field(() => Int, { description: 'New order/position' })
  @IsInt()
  @Min(0)
  order!: number;
}
