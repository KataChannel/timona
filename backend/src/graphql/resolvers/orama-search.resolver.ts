import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OramaService } from '../../search/orama.service';
import {
  OramaSearchResult,
  UniversalSearchResult,
  OramaSearchInput,
  OramaHealthCheck,
  ReindexResult,
} from '../models/orama-search.model';

@Resolver()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra fields for GraphQLJSON types
  })
)
export class OramaSearchResolver {
  constructor(private readonly oramaService: OramaService) {}

  // Search tasks
  @Query(() => OramaSearchResult, {
    description: 'Search tasks using Orama full-text search engine',
  })
  @UseGuards(JwtAuthGuard)
  async searchTasks(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<OramaSearchResult> {
    const user = context.req.user;
    
    // Add user filtering if needed
    const query = {
      ...input,
      where: {
        ...input.where,
        // Optionally filter by user access rights
        // This depends on your authorization logic
      },
    };

    return this.oramaService.searchTasks(query);
  }

  // Search users
  @Query(() => OramaSearchResult, {
    description: 'Search users using Orama full-text search engine',
  })
  @UseGuards(JwtAuthGuard)
  async searchUsers(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<OramaSearchResult> {
    return this.oramaService.searchUsers(input);
  }

  // Search projects
  @Query(() => OramaSearchResult, {
    description: 'Search projects using Orama full-text search engine',
  })
  @UseGuards(JwtAuthGuard)
  async searchProjects(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<OramaSearchResult> {
    return this.oramaService.searchProjects(input);
  }

  // Search affiliate campaigns
  @Query(() => OramaSearchResult, {
    description: 'Search affiliate campaigns using Orama full-text search engine',
  })
  @UseGuards(JwtAuthGuard)
  async searchAffiliateCampaigns(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<OramaSearchResult> {
    return this.oramaService.searchAffiliateCampaigns(input);
  }

  // Search affiliate links
  @Query(() => OramaSearchResult, {
    description: 'Search affiliate links using Orama full-text search engine',
  })
  @UseGuards(JwtAuthGuard)
  async searchAffiliateLinks(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<OramaSearchResult> {
    return this.oramaService.searchAffiliateLinks(input);
  }

  // Universal search across all entity types
  @Query(() => UniversalSearchResult, {
    description: 'Search across all entity types (tasks, users, projects, affiliate campaigns, affiliate links)',
  })
  // @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
  async universalSearch(
    @Args('input') input: OramaSearchInput,
    @Context() context: any,
  ): Promise<UniversalSearchResult> {
    return this.oramaService.searchAll(input);
  }

  // Health check
  @Query(() => OramaHealthCheck, {
    description: 'Check Orama search engine health status',
  })
  async oramaHealthCheck(): Promise<OramaHealthCheck> {
    return this.oramaService.healthCheck();
  }

  // Reindex all data
  @Mutation(() => ReindexResult, {
    description: 'Reindex all data from database into Orama search indexes',
  })
  @UseGuards(JwtAuthGuard)
  async reindexAllData(@Context() context: any): Promise<ReindexResult> {
    const user = context.req.user;
    
    // TODO: Add admin role check
    // if (user.role !== 'ADMIN') {
    //   throw new Error('Only admins can reindex data');
    // }

    try {
      await this.oramaService.reindexAll();
      return {
        success: true,
        message: 'Successfully reindexed all data',
      };
    } catch (error) {
      return {
        success: false,
        message: `Reindex failed: ${error.message}`,
      };
    }
  }
}
