// src/app/components/download-dialog/download-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface DialogData {
  type: 'all' | 'month';
  monthName?: string;
  year?: number;
  totalShifts: number;
  workingShifts: number;
  restDays: number;
}

export interface EventSettings {
  shiftReminderMinutes: number;
  restDayReminder: boolean;
  restDayReminderMinutes: number;
  eventNameFormat: 'reference' | 'custom' | 'detailed' | 'times' | 'timesWithRef';
  customPrefix?: string;
}

export interface DialogResult {
  confirmed: boolean;
  includeRestDays: boolean;
  eventSettings: EventSettings;
}

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>file_download</mat-icon>
      Download Calendar Events
    </h2>

    <mat-dialog-content>
      <div class="dialog-content">
        <p class="download-info">
          <strong *ngIf="data.type === 'all'">You are about to download all shifts</strong>
          <strong *ngIf="data.type === 'month'">
            You are about to download shifts for {{ data.monthName }} {{ data.year }}
          </strong>
        </p>

        <div class="stats-container">
          <div class="stat-item">
            <mat-icon color="primary">event</mat-icon>
            <span>{{ data.totalShifts }} total events</span>
          </div>
          <div class="stat-item working">
            <mat-icon>work</mat-icon>
            <span>{{ data.workingShifts }} working shifts</span>
          </div>
          <div class="stat-item rest">
            <mat-icon>beach_access</mat-icon>
            <span>{{ data.restDays }} rest days</span>
          </div>
        </div>

        <mat-checkbox
            [(ngModel)]="includeRestDays"
            color="primary"
            class="rest-days-checkbox">
          Include Rest Days (RD) in calendar
        </mat-checkbox>

        <!-- Advanced Settings -->
        <mat-expansion-panel class="advanced-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>tune</mat-icon>
              Advanced Event Settings
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="advanced-content">
            <!-- Shift Reminder -->
            <mat-form-field appearance="outline">
              <mat-label>Shift Reminder</mat-label>
              <mat-select [(ngModel)]="eventSettings.shiftReminderMinutes">
                <mat-option [value]="0">No reminder</mat-option>
                <mat-option [value]="15">15 minutes before</mat-option>
                <mat-option [value]="30">30 minutes before</mat-option>
                <mat-option [value]="60">1 hour before (default)</mat-option>
                <mat-option [value]="120">2 hours before</mat-option>
                <mat-option [value]="1440">1 day before</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Rest Day Reminder -->
            <div class="rest-reminder-section">
              <mat-checkbox
                  [(ngModel)]="eventSettings.restDayReminder"
                  color="primary">
                Add reminder for rest days
              </mat-checkbox>

              <mat-form-field appearance="outline" *ngIf="eventSettings.restDayReminder">
                <mat-label>Rest Day Reminder</mat-label>
                <mat-select [(ngModel)]="eventSettings.restDayReminderMinutes">
                  <mat-option [value]="480">8:00 AM on the day</mat-option>
                  <mat-option [value]="540">9:00 AM on the day</mat-option>
                  <mat-option [value]="600">10:00 AM on the day</mat-option>
                  <mat-option [value]="1440">1 day before</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Event Name Format -->
            <mat-form-field appearance="outline">
              <mat-label>Event Name Format</mat-label>
              <mat-select [(ngModel)]="eventSettings.eventNameFormat">
                <mat-option value="reference">Job Reference Only (e.g., "1601")</mat-option>
                <mat-option value="times">Times Only (e.g., "05:40-15:02")</mat-option>
                <mat-option value="timesWithRef">Times + Reference (e.g., "05:40-15:02 (1601)")</mat-option>
                <mat-option value="detailed">Detailed (e.g., "Shift 1601 (05:40-15:02)")</mat-option>
                <mat-option value="custom">Custom Prefix (for shifts only)</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="eventSettings.eventNameFormat === 'custom'">
              <mat-label>Custom Prefix (for shifts only)</mat-label>
              <input matInput [(ngModel)]="eventSettings.customPrefix" placeholder="e.g., Work - ">
              <mat-hint>Will show as "{{ eventSettings.customPrefix || 'Work - ' }}1601" (Rest days unchanged)</mat-hint>
            </mat-form-field>

            <div class="preview-box">
              <strong>Preview:</strong>
              <div class="preview-examples">
                <div class="preview-item">
                  <mat-icon>work</mat-icon>
                  <span>{{ getShiftPreview() }}</span>
                </div>
                <div class="preview-item" *ngIf="includeRestDays">
                  <mat-icon>beach_access</mat-icon>
                  <span>{{ getRestDayPreview() }}</span>
                </div>
              </div>
            </div>
          </div>
        </mat-expansion-panel>

        <p class="hint-text">
          <mat-icon>info</mat-icon>
          Rest days will be added as all-day events if included
        </p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        <mat-icon>download</mat-icon>
        Download
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #006a6a;
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    h2[mat-dialog-title] mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-dialog-content {
      padding: 24px !important;
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .download-info {
      margin: 0;
      font-size: 1rem;
      color: #333;
    }

    .stats-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: #2a2a2a;
      border-radius: 8px;
      border-left: 4px solid #006a6a;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      color: #e0e0e0;
    }

    .stat-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #b0b0b0;
    }

    .stat-item.working mat-icon {
      color: #00dddd;
    }

    .stat-item.rest mat-icon {
      color: #888;
    }

    .rest-days-checkbox {
      margin: 8px 0;
    }

    .advanced-panel {
      box-shadow: none;
      border: 1px solid #e0e0e0;
    }

    .advanced-panel mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #006a6a;
      font-weight: 500;
    }

    .advanced-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .advanced-content mat-form-field {
      width: 100%;
    }

    .rest-reminder-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-box {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 3px solid #006a6a;
    }

    .preview-box strong {
      color: #006a6a;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-examples {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .preview-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      font-size: 0.95rem;
      color: #333;
    }

    .preview-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #006a6a;
    }

    .hint-text {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #0277bd;
    }

    .hint-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: unset;
      }
    }
  `]
})
export class DownloadDialogComponent {
  includeRestDays = true;
  eventSettings: EventSettings = {
    shiftReminderMinutes: 60,
    restDayReminder: false,
    restDayReminderMinutes: 540,
    eventNameFormat: 'reference',
    customPrefix: ''
  };

  constructor(
      public dialogRef: MatDialogRef<DownloadDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  getShiftPreview(): string {
    const ref = '1601';
    const time = '05:40-15:02';
    switch (this.eventSettings.eventNameFormat) {
      case 'reference':
        return ref;
      case 'times':
        return time;
      case 'timesWithRef':
        return `${time} (${ref})`;
      case 'detailed':
        return `Shift ${ref} (${time})`;
      case 'custom':
        return `${this.eventSettings.customPrefix || 'Work - '}${ref}`;
      default:
        return ref;
    }
  }

  getRestDayPreview(): string {
    // Rest day name is NOT affected by custom prefix
    return 'Rest Day (RD)';
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false, includeRestDays: false, eventSettings: this.eventSettings });
  }

  onConfirm(): void {
    console.log('Dialog confirmed with settings:', this.eventSettings);
    this.dialogRef.close({
      confirmed: true,
      includeRestDays: this.includeRestDays,
      eventSettings: this.eventSettings
    });
  }
}