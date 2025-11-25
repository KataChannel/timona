import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class OtpResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
