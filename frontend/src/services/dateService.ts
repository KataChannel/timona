/**
 * Date utility service for handling month/year inputs and date range calculations
 */
export class DateService {
  
  /**
   * Get date range for a specific month and year
   * @param month Month (1-12)
   * @param year Year (e.g., 2024)
   * @returns Object with fromDate and toDate in DD/MM/YYYY format
   */
  static getMonthDateRange(month: number, year: number): { fromDate: string; toDate: string } {
    // Validate input
    if (month < 1 || month > 12) {
      throw new Error('Tháng phải từ 1 đến 12');
    }
    
    if (year < 1900 || year > new Date().getFullYear() + 10) {
      throw new Error('Năm không hợp lệ');
    }

    // First day of month
    const firstDay = new Date(year, month - 1, 1);
    
    // Last day of month
    const lastDay = new Date(year, month, 0);

    return {
      fromDate: this.formatDate(firstDay),
      toDate: this.formatDate(lastDay)
    };
  }

  /**
   * Format date to DD/MM/YYYY
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Parse DD/MM/YYYY date string to Date object
   */
  static parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Get current month and year
   */
  static getCurrentMonthYear(): { month: number; year: number } {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }

  /**
   * Get previous month and year
   */
  static getPreviousMonthYear(): { month: number; year: number } {
    const now = new Date();
    let month = now.getMonth(); // 0-based
    let year = now.getFullYear();
    
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    
    return {
      month,
      year
    };
  }

  /**
   * Get month name in Vietnamese
   */
  static getMonthName(month: number): string {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    if (month < 1 || month > 12) {
      return 'Tháng không hợp lệ';
    }
    
    return monthNames[month - 1];
  }

  /**
   * Get list of months for select options
   */
  static getMonthOptions(): Array<{ value: number; label: string }> {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: this.getMonthName(i + 1)
    }));
  }

  /**
   * Get list of years for select options (current year - 10 to current year + 2)
   */
  static getYearOptions(): Array<{ value: number; label: string }> {
    const currentYear = new Date().getFullYear();
    const years: Array<{ value: number; label: string }> = [];
    
    for (let year = currentYear - 10; year <= currentYear + 2; year++) {
      years.push({
        value: year,
        label: year.toString()
      });
    }
    
    return years.reverse(); // Most recent years first
  }

  /**
   * Validate if a date range is valid
   */
  static validateDateRange(fromDate: string, toDate: string): { isValid: boolean; error?: string } {
    try {
      const from = this.parseDate(fromDate);
      const to = this.parseDate(toDate);
      const today = new Date();

      if (from > to) {
        return { isValid: false, error: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc' };
      }

      if (to > today) {
        return { isValid: false, error: 'Ngày kết thúc không thể lớn hơn ngày hiện tại' };
      }

      // Check if date range is too large (more than 365 days)
      const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return { isValid: false, error: 'Khoảng thời gian không được vượt quá 365 ngày' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Định dạng ngày không hợp lệ 123' };
    }
  }

  /**
   * Get predefined date range options
   */
  static getDateRangeOptions(): Array<{ value: string; label: string; getData: () => { fromDate: string; toDate: string } }> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return [
      {
        value: 'current_month',
        label: 'Tháng này',
        getData: () => this.getMonthDateRange(currentMonth, currentYear)
      },
      {
        value: 'previous_month',
        label: 'Tháng trước',
        getData: () => {
          const { month, year } = this.getPreviousMonthYear();
          return this.getMonthDateRange(month, year);
        }
      },
      {
        value: 'last_3_months',
        label: '3 tháng gần nhất',
        getData: () => {
          const threemonthsAgo = new Date();
          threemonthsAgo.setMonth(threemonthsAgo.getMonth() - 3);
          return {
            fromDate: this.formatDate(threemonthsAgo),
            toDate: this.formatDate(today)
          };
        }
      },
      {
        value: 'last_6_months',
        label: '6 tháng gần nhất',
        getData: () => {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return {
            fromDate: this.formatDate(sixMonthsAgo),
            toDate: this.formatDate(today)
          };
        }
      }
    ];
  }
}

export default DateService;