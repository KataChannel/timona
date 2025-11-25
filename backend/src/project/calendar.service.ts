import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, TaskStatus } from '@prisma/client';

/**
 * Service for Calendar-related features
 * - Task calendar view
 * - iCal export
 * - Google Calendar integration (future)
 */
@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get tasks for calendar view
   * Returns tasks grouped by date
   */
  async getCalendarTasks(
    userId: string,
    startDate: Date,
    endDate: Date,
    projectId?: string,
  ) {
    const where: any = {
      OR: [
        { userId }, // Tasks owned by user
        { assignedTo: { has: userId } }, // Tasks assigned to user
      ],
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Group tasks by date
    const tasksByDate: Record<string, Task[]> = {};
    
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task as any);
      }
    });

    return {
      tasks,
      tasksByDate,
      summary: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
        overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== TaskStatus.COMPLETED).length,
      },
    };
  }

  /**
   * Get month view data
   * Returns tasks for each day in the month
   */
  async getMonthView(userId: string, year: number, month: number, projectId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return await this.getCalendarTasks(userId, startDate, endDate, projectId);
  }

  /**
   * Get week view data
   */
  async getWeekView(userId: string, startDate: Date, projectId?: string) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59);

    return await this.getCalendarTasks(userId, startDate, endDate, projectId);
  }

  /**
   * Generate iCal format for tasks
   * Can be imported to any calendar application
   */
  async generateICalExport(userId: string, projectId?: string): Promise<string> {
    const where: any = {
      OR: [
        { userId },
        { assignedTo: { has: userId } },
      ],
      dueDate: { not: null },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Generate iCal format
    let ical = 'BEGIN:VCALENDAR\r\n';
    ical += 'VERSION:2.0\r\n';
    ical += 'PRODID:-//Rausach Project Management//EN\r\n';
    ical += 'CALSCALE:GREGORIAN\r\n';
    ical += 'METHOD:PUBLISH\r\n';
    ical += 'X-WR-CALNAME:My Tasks\r\n';
    ical += 'X-WR-TIMEZONE:UTC\r\n';
    ical += 'X-WR-CALDESC:Tasks from Rausach Project Management\r\n';

    tasks.forEach((task) => {
      const uid = `task-${task.id}@rausach.com`;
      const summary = this.escapeICalText(task.title);
      const description = task.description ? this.escapeICalText(task.description) : '';
      const dueDate = task.dueDate ? this.formatICalDate(task.dueDate) : '';
      const createdDate = this.formatICalDate(task.createdAt);
      const status = task.status === TaskStatus.COMPLETED ? 'COMPLETED' : 'NEEDS-ACTION';
      const priority = this.mapPriorityToICal(task.priority);

      ical += 'BEGIN:VTODO\r\n';
      ical += `UID:${uid}\r\n`;
      ical += `DTSTAMP:${createdDate}\r\n`;
      ical += `SUMMARY:${summary}\r\n`;
      if (description) {
        ical += `DESCRIPTION:${description}\r\n`;
      }
      if (dueDate) {
        ical += `DUE:${dueDate}\r\n`;
      }
      ical += `STATUS:${status}\r\n`;
      ical += `PRIORITY:${priority}\r\n`;
      ical += `CATEGORIES:${task.category}\r\n`;
      ical += 'END:VTODO\r\n';
    });

    ical += 'END:VCALENDAR\r\n';

    return ical;
  }

  /**
   * Get upcoming tasks for notification/reminder
   */
  async getUpcomingTasks(userId: string, hours: number = 24) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { userId },
          { assignedTo: { has: userId } },
        ],
        status: {
          notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
        },
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tasks;
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
    projectId?: string,
  ) {
    const where: any = {
      OR: [
        { userId },
        { assignedTo: { has: userId } },
      ],
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const [total, completed, inProgress, pending, overdue] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({
        where: { ...where, status: TaskStatus.COMPLETED },
      }),
      this.prisma.task.count({
        where: { ...where, status: TaskStatus.IN_PROGRESS },
      }),
      this.prisma.task.count({
        where: { ...where, status: TaskStatus.PENDING },
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: TaskStatus.COMPLETED },
        },
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Escape special characters in iCal text
   */
  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Format date to iCal format (YYYYMMDDTHHMMSSZ)
   */
  private formatICalDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Map task priority to iCal priority (1-9)
   * 1 = highest, 9 = lowest
   */
  private mapPriorityToICal(priority: string): number {
    switch (priority) {
      case 'URGENT':
        return 1;
      case 'HIGH':
        return 3;
      case 'MEDIUM':
        return 5;
      case 'LOW':
        return 7;
      default:
        return 5;
    }
  }
}
