import { Resolver, Query } from '@nestjs/graphql';
import { SupportAnalyticsService } from '../services/support-analytics.service';
import { SupportAnalytics } from '../entities/support-analytics.entity';

@Resolver(() => SupportAnalytics)
export class SupportAnalyticsResolver {
  constructor(private analyticsService: SupportAnalyticsService) {}

  @Query(() => SupportAnalytics, { name: 'supportAnalytics' })
  async getSupportAnalytics() {
    return this.analyticsService.getAnalytics();
  }
}
