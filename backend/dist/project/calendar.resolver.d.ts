import { CalendarService } from './calendar.service';
export declare class CalendarResolver {
    private readonly calendarService;
    constructor(calendarService: CalendarService);
    getCalendarTasks(userId: string, startDate: Date, endDate: Date, projectId?: string): Promise<string>;
    getMonthView(userId: string, year: number, month: number, projectId?: string): Promise<string>;
    getWeekView(userId: string, startDate: Date, projectId?: string): Promise<string>;
    exportICalendar(userId: string, projectId?: string): Promise<string>;
    getUpcomingTasks(userId: string, hours: number): Promise<string>;
    getCalendarStatistics(userId: string, startDate: Date, endDate: Date, projectId?: string): Promise<string>;
}
