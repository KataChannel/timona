import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SystemReleaseService } from '../services/system-release.service';
import { SystemRelease } from '../entities/system-release.entity';
import {
  CreateSystemReleaseInput,
  UpdateSystemReleaseInput,
  SystemReleaseWhereInput,
} from '../dto/system-release.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { Int } from '@nestjs/graphql';

@Resolver(() => SystemRelease)
export class SystemReleaseResolver {
  constructor(private readonly releaseService: SystemReleaseService) {}

  @Query(() => [SystemRelease], { name: 'systemReleases' })
  async getSystemReleases(
    @Args('where', { type: () => SystemReleaseWhereInput, nullable: true })
    where?: SystemReleaseWhereInput,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take?: number,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip?: number,
  ) {
    return this.releaseService.findAll(where, take, skip);
  }

  @Query(() => SystemRelease, { name: 'systemRelease', nullable: true })
  async getSystemRelease(@Args('id') id: string) {
    return this.releaseService.findOne(id);
  }

  @Query(() => SystemRelease, { name: 'systemReleaseByVersion', nullable: true })
  async getSystemReleaseByVersion(@Args('version') version: string) {
    return this.releaseService.findByVersion(version);
  }

  @Query(() => SystemRelease, { name: 'systemReleaseBySlug', nullable: true })
  async getSystemReleaseBySlug(@Args('slug') slug: string) {
    return this.releaseService.findBySlug(slug);
  }

  @Query(() => SystemRelease, { name: 'latestSystemRelease', nullable: true })
  async getLatestSystemRelease() {
    return this.releaseService.getLatestRelease();
  }

  @Mutation(() => SystemRelease)
  @UseGuards(JwtAuthGuard)
  async createSystemRelease(
    @Args('input') input: CreateSystemReleaseInput,
    @CurrentUser() user: any,
  ) {
    return this.releaseService.create(input, user.id);
  }

  @Mutation(() => SystemRelease)
  @UseGuards(JwtAuthGuard)
  async updateSystemRelease(
    @Args('id') id: string,
    @Args('input') input: UpdateSystemReleaseInput,
    @CurrentUser() user: any,
  ) {
    return this.releaseService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteSystemRelease(@Args('id') id: string) {
    return this.releaseService.delete(id);
  }

  @Mutation(() => SystemRelease)
  @UseGuards(JwtAuthGuard)
  async publishSystemRelease(@Args('id') id: string) {
    return this.releaseService.publish(id);
  }

  @Mutation(() => Boolean)
  async incrementSystemReleaseDownloadCount(@Args('id') id: string) {
    await this.releaseService.incrementDownloadCount(id);
    return true;
  }
}
