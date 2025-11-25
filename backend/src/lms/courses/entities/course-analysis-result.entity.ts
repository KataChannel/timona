import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CourseAnalysisResult {
  @Field({ description: 'AI-generated course title suggestion' })
  suggestedTitle: string;

  @Field({ description: 'AI-generated course description' })
  suggestedDescription: string;

  @Field({ description: 'Recommended difficulty level' })
  recommendedLevel: string;

  @Field(() => [String], { description: 'Aggregated keywords from documents' })
  aggregatedKeywords: string[];

  @Field(() => [String], { description: 'Main topics identified' })
  mainTopics: string[];

  @Field(() => [String], { description: 'Learning objectives based on content' })
  learningObjectives: string[];

  @Field(() => [String], { description: 'What students will learn' })
  whatYouWillLearn: string[];

  @Field(() => [String], { description: 'Prerequisites and requirements' })
  requirements: string[];

  @Field(() => [String], { description: 'Target audience' })
  targetAudience: string[];

  @Field(() => GraphQLJSON, { description: 'Suggested course structure (modules outline)' })
  suggestedStructure: any;

  @Field(() => Int, { description: 'Estimated duration in minutes' })
  estimatedDuration: number;

  @Field(() => [String], { description: 'Document IDs used for analysis' })
  sourceDocumentIds: string[];

  @Field({ description: 'Summary of the analysis' })
  analysisSummary: string;
}
