import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

// ==================== User Type (Simple) ====================

@ObjectType('ProjectUser')
export class ProjectUserType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  avatar?: string;
}

// ==================== Stats Type (Must be before ProjectType) ====================

@ObjectType('ProjectStats')
export class ProjectStats {
  @Field(() => Int)
  tasks: number;

  @Field(() => Int)
  chatMessages: number;

  @Field(() => Int)
  members: number;
}

// ==================== GraphQL Types ====================

@ObjectType('Project')
export class ProjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  isArchived: boolean;

  @Field(() => ID)
  ownerId: string;

  @Field(() => ProjectUserType)
  owner: ProjectUserType;

  @Field(() => [ProjectMemberType])
  members: ProjectMemberType[];

  @Field(() => ProjectStats, { nullable: true })
  _count?: ProjectStats;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('ProjectMember')
export class ProjectMemberType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  projectId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  role: string; // 'owner' | 'admin' | 'member'

  @Field(() => ProjectUserType)
  user: ProjectUserType;

  @Field()
  joinedAt: Date;
}

// ==================== Input Types ====================

@InputType('CreateProjectInput')
export class CreateProjectInput {
  @Field()
  @IsString()
  @MinLength(1, { message: 'Project name cannot be empty' })
  @MaxLength(200, { message: 'Project name is too long' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  avatar?: string;
}

@InputType('UpdateProjectInput')
export class UpdateProjectInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  isArchived?: boolean;
}

@InputType('AddMemberInput')
export class AddMemberInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field({ nullable: true, defaultValue: 'member' })
  @IsString()
  @IsOptional()
  role?: 'owner' | 'admin' | 'member';
}

@InputType('UpdateMemberRoleInput')
export class UpdateMemberRoleInput {
  @Field(() => ID)
  userId: string;

  @Field()
  role: 'owner' | 'admin' | 'member';
}
