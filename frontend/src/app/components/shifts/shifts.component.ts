// src/app/components/shifts/shifts.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface MonthData {
  monthName: string;
  year: number;
  totalHours: number;
  shifts: any[];
}

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnChanges {
  @Input() shiftsResponse: any = null;

  monthsData: MonthData[] = [];
  currentMonthIndex: number = 0;

  ngOnChanges() {
    if (this.shiftsResponse) {
      console.log('res from the shifts', this.shiftsResponse);
      this.organizeShiftsByMonth();
    }
  }

  get employeeName(): string {
    return this.shiftsResponse?.employeeName || '';
  }

  get weeksData(): any[] {
    return this.shiftsResponse?.weeksData || [];
  }

  get hasShifts(): boolean {
    return this.monthsData.length > 0;
  }

  get currentMonth(): MonthData | null {
    return this.monthsData[this.currentMonthIndex] || null;
  }

  get canGoPrevious(): boolean {
    return this.currentMonthIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentMonthIndex < this.monthsData.length - 1;
  }

  organizeShiftsByMonth() {
    const monthsMap = new Map<string, any[]>();

    // Collect all shifts from all weeks
    this.weeksData.forEach(week => {
      week.shifts?.forEach((shift: any) => {
        if (shift.date) {
          const date = new Date(shift.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

          if (!monthsMap.has(monthKey)) {
            monthsMap.set(monthKey, []);
          }
          monthsMap.get(monthKey)?.push(shift);
        }
      });
    });

    // Convert to array and sort by date
    this.monthsData = Array.from(monthsMap.entries())
        .map(([key, shifts]) => {
          const [year, month] = key.split('-').map(Number);
          const date = new Date(year, month);

          // Calculate total hours for the month
          const totalHours = shifts
              .filter(s => !s.isRestDay && s.totalHours)
              .reduce((sum, s) => {
                const hours = parseFloat(s.totalHours.replace(':', '.')) || 0;
                return sum + hours;
              }, 0);

          return {
            monthName: date.toLocaleDateString('en-GB', { month: 'long' }),
            year: year,
            totalHours: totalHours,
            shifts: shifts.sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          };
        })
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          const monthA = new Date(`${a.monthName} 1, ${a.year}`).getMonth();
          const monthB = new Date(`${b.monthName} 1, ${b.year}`).getMonth();
          return monthA - monthB;
        });

    this.currentMonthIndex = 0;
  }

  previousMonth() {
    if (this.canGoPrevious) {
      this.currentMonthIndex--;
    }
  }

  nextMonth() {
    if (this.canGoNext) {
      this.currentMonthIndex++;
    }
  }

  downloadCalendar(shift: any) {
    console.log('Downloading calendar event for:', shift);
    // TODO: Implement .ics file generation and download
  }

  downloadAllShifts() {
    console.log('Downloading all shifts for:', this.employeeName);
    // TODO: Implement .ics file generation for all shifts
  }

  downloadMonthShifts() {
    console.log('Downloading shifts for current month:', this.currentMonth);
    // TODO: Implement .ics file generation for current month
  }

  formatTime(time: string | null): string {
    if (!time) return '--:--';
    return time;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short'
    };
    return date.toLocaleDateString('en-GB', options);
  }

  formatDateFull(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
    return `${weekday}, ${day} ${month} ${year}`;
  }
}