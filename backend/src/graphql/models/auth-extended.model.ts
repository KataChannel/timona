import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

registerEnumType($Enums.UserRoleType, {
  name: 'UserRole',
});

registerEnumType($Enums.AuthProvider, {
  name: 'AuthProvider',
});

registerEnumType($Enums.TokenType, {
  name: 'TokenType',
});

@ObjectType()
export class AuthMethod {
  @Field(() => ID)
  id: string;

  @Field(() => $Enums.AuthProvider)
  provider: $Enums.AuthProvider;

  @Field({ nullable: true })
  providerId?: string;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class VerificationToken {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field(() => $Enums.TokenType)
  type: $Enums.TokenType;

  @Field()
  expiresAt: Date;

  @Field()
  isUsed: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UserSession {
  @Field(() => ID)
  id: string;

  @Field()
  sessionId: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  isActive: boolean;

  @Field()
  expiresAt: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AuditLog {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  details?: string;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt: Date;
}
