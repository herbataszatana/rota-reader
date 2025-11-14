// src/app/components/shifts/shifts.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './shifts.component.html'
})
export class ShiftsComponent implements OnChanges {
  @Input() shiftsResponse: any = null;

  ngOnChanges() {
    if (this.shiftsResponse) {
      console.log('res from the shifts', this.shiftsResponse);
    }
  }

  get employeeName(): string {
    return this.shiftsResponse?.employeeName || '';
  }

  get shifts(): any[] {
    // Adjust this based on your actual API response structure
    // It could be shiftsResponse.shifts, shiftsResponse.data, or just shiftsResponse
    return this.shiftsResponse?.shifts ||
        this.shiftsResponse?.data ||
        (Array.isArray(this.shiftsResponse) ? this.shiftsResponse : []);
  }

  downloadCalendar(shift: any) {
    // Logic to download individual shift as .ics file
    console.log('Downloading calendar event for:', shift);
    // TODO: Implement .ics file generation and download
  }

  downloadAllShifts() {
    // Logic to download all shifts as a single .ics file
    console.log('Downloading all shifts for:', this.employeeName);
    // TODO: Implement .ics file generation for all shifts
  }
}