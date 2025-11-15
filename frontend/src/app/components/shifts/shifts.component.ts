// src/app/components/shifts/shifts.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DownloadDialogComponent, DialogData, DialogResult } from '../download-dialog/download-dialog.component';

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
    MatChipsModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnChanges {
  @Input() shiftsResponse: any = null;

  monthsData: MonthData[] = [];
  currentMonthIndex: number = 0;

  constructor(
      private dialog: MatDialog,
      private http: HttpClient
  ) {}

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
    console.log('Downloading single shift:', shift);

    const payload = {
      employeeData: this.shiftsResponse.selectedEmployee,
      includeRestDays: shift.isRestDay,
      type: 'single',
      singleShift: shift
    };

    this.downloadICS(payload, `${shift.reference || 'shift'}_${shift.date}.ics`);
  }

  downloadAllShifts() {
    const allShifts = this.monthsData.flatMap(month => month.shifts);
    const workingShifts = allShifts.filter(s => !s.isRestDay);
    const restDays = allShifts.filter(s => s.isRestDay);

    const dialogData: DialogData = {
      type: 'all',
      totalShifts: allShifts.length,
      workingShifts: workingShifts.length,
      restDays: restDays.length
    };

    const dialogRef = this.dialog.open(DownloadDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.confirmed) {
        console.log('Downloading all shifts, include rest days:', result.includeRestDays);

        const payload = {
          employeeData: this.shiftsResponse.selectedEmployee,
          includeRestDays: result.includeRestDays,
          type: 'all'
        };

        this.downloadICS(payload);
      }
    });
  }

  downloadMonthShifts() {
    if (!this.currentMonth) return;

    const workingShifts = this.currentMonth.shifts.filter(s => !s.isRestDay);
    const restDays = this.currentMonth.shifts.filter(s => s.isRestDay);

    const dialogData: DialogData = {
      type: 'month',
      monthName: this.currentMonth.monthName,
      year: this.currentMonth.year,
      totalShifts: this.currentMonth.shifts.length,
      workingShifts: workingShifts.length,
      restDays: restDays.length
    };

    const dialogRef = this.dialog.open(DownloadDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.confirmed) {
        console.log(`Downloading ${this.currentMonth?.monthName} shifts, include rest days:`, result.includeRestDays);

        const monthDate = new Date(`${this.currentMonth!.monthName} 1, ${this.currentMonth!.year}`);

        const payload = {
          employeeData: this.shiftsResponse.selectedEmployee,
          includeRestDays: result.includeRestDays,
          type: 'month',
          monthFilter: {
            month: monthDate.getMonth(),
            year: this.currentMonth!.year
          }
        };

        this.downloadICS(payload);
      }
    });
  }

  private downloadICS(payload: any, customFilename?: string) {
    console.log('📤 Sending download request:', payload);

    this.http.post('http://localhost:3000/api/downloadShifts', payload, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        console.log('✅ Received response:', response);
        const blob = response.body;
        if (!blob) {
          console.error('❌ No blob in response');
          return;
        }

        // Get filename from Content-Disposition header or use custom/default
        let filename = customFilename || 'shifts.ics';
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ ICS file downloaded:', filename);
      },
      error: (err) => {
        console.error('❌ Error downloading ICS:', err);
        console.error('Error details:', err.error);
        alert('Failed to download calendar file. Please check console for details.');
      }
    });
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