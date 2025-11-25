import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TechnicalSupportService } from '../services/technical-support.service';
import {
  TechnicalSupportTicket,
  TechnicalSupportMessage,
} from '../entities/technical-support.entity';
import {
  CreateTechnicalSupportTicketInput,
  UpdateTechnicalSupportTicketInput,
  CreateTechnicalSupportMessageInput,
  RateTicketInput,
  TechnicalSupportTicketWhereInput,
} from '../dto/technical-support.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => TechnicalSupportTicket)
export class TechnicalSupportResolver {
  constructor(private readonly supportService: TechnicalSupportService) {}

  @Query(() => [TechnicalSupportTicket], { name: 'technicalSupportTickets' })
  @UseGuards(JwtAuthGuard)
  async getTechnicalSupportTickets(
    @Args('where', { type: () => TechnicalSupportTicketWhereInput, nullable: true })
    where?: TechnicalSupportTicketWhereInput,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 })
    take?: number,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip?: number,
  ) {
    return this.supportService.findAll(where, take, skip);
  }

  @Query(() => TechnicalSupportTicket, { name: 'technicalSupportTicket', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getTechnicalSupportTicket(@Args('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Query(() => TechnicalSupportTicket, { name: 'technicalSupportTicketByNumber', nullable: true })
  async getTechnicalSupportTicketByNumber(@Args('ticketNumber') ticketNumber: string) {
    return this.supportService.findByTicketNumber(ticketNumber);
  }

  @Query(() => [TechnicalSupportTicket], { name: 'myTechnicalSupportTickets' })
  @UseGuards(JwtAuthGuard)
  async getMyTechnicalSupportTickets(
    @CurrentUser() user: any,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.supportService.getMyTickets(user.id, status);
  }

  @Mutation(() => TechnicalSupportTicket)
  async createTechnicalSupportTicket(
    @Args('input') input: CreateTechnicalSupportTicketInput,
  ) {
    return this.supportService.createTicket(input);
  }

  @Mutation(() => TechnicalSupportTicket)
  @UseGuards(JwtAuthGuard)
  async updateTechnicalSupportTicket(
    @Args('id') id: string,
    @Args('input') input: UpdateTechnicalSupportTicketInput,
  ) {
    return this.supportService.update(id, input);
  }

  @Mutation(() => TechnicalSupportTicket)
  @UseGuards(JwtAuthGuard)
  async assignTechnicalSupportTicket(
    @Args('ticketId') ticketId: string,
    @Args('assignedToId') assignedToId: string,
  ) {
    return this.supportService.assignTicket(ticketId, assignedToId);
  }

  @Mutation(() => TechnicalSupportTicket)
  @UseGuards(JwtAuthGuard)
  async resolveTechnicalSupportTicket(
    @Args('ticketId') ticketId: string,
    @Args('resolution') resolution: string,
    @CurrentUser() user: any,
  ) {
    return this.supportService.resolveTicket(ticketId, resolution, user.id);
  }

  @Mutation(() => TechnicalSupportMessage)
  async createTechnicalSupportMessage(
    @Args('input') input: CreateTechnicalSupportMessageInput,
  ) {
    return this.supportService.createMessage(input);
  }

  @Mutation(() => TechnicalSupportTicket)
  async rateTechnicalSupportTicket(@Args('input') input: RateTicketInput) {
    return this.supportService.rateTicket(input);
  }
}
