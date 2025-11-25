import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
@UseGuards(JwtAuthGuard)
export class CalendarResolver {
  constructor(private readonly calendarService: CalendarService) {}

  @Query(() => String, {
    name: 'calendarTasks',
    description: 'Get tasks for calendar view (returned as JSON string)',
  })
  async getCalendarTasks(
    @CurrentUser('id') userId: string,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ): Promise<string> {
    const data = await this.calendarService.getCalendarTasks(
      userId,
      startDate,
      endDate,
      projectId,
    );
    return JSON.stringify(data);
  }

  @Query(() => String, {
    name: 'calendarMonthView',
    description: 'Get month view for calendar',
  })
  async getMonthView(
    @CurrentUser('id') userId: string,
    @Args('year') year: number,
    @Args('month') month: number,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ): Promise<string> {
    const data = await this.calendarService.getMonthView(userId, year, month, projectId);
    return JSON.stringify(data);
  }

  @Query(() => String, {
    name: 'calendarWeekView',
    description: 'Get week view for calendar',
  })
  async getWeekView(
    @CurrentUser('id') userId: string,
    @Args('startDate') startDate: Date,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ): Promise<string> {
    const data = await this.calendarService.getWeekView(userId, startDate, projectId);
    return JSON.stringify(data);
  }

  @Query(() => String, {
    name: 'exportICalendar',
    description: 'Export tasks as iCal format (.ics file)',
  })
  async exportICalendar(
    @CurrentUser('id') userId: string,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ): Promise<string> {
    return await this.calendarService.generateICalExport(userId, projectId);
  }

  @Query(() => String, {
    name: 'upcomingTasks',
    description: 'Get upcoming tasks for reminders',
  })
  async getUpcomingTasks(
    @CurrentUser('id') userId: string,
    @Args('hours', { defaultValue: 24 }) hours: number,
  ): Promise<string> {
    const tasks = await this.calendarService.getUpcomingTasks(userId, hours);
    return JSON.stringify(tasks);
  }

  @Query(() => String, {
    name: 'calendarStatistics',
    description: 'Get calendar statistics for a period',
  })
  async getCalendarStatistics(
    @CurrentUser('id') userId: string,
    @Args('startDate') startDate: Date,
    @Args('endDate') endDate: Date,
    @Args('projectId', { type: () => ID, nullable: true }) projectId?: string,
  ): Promise<string> {
    const stats = await this.calendarService.getCalendarStatistics(
      userId,
      startDate,
      endDate,
      projectId,
    );
    return JSON.stringify(stats);
  }
}
