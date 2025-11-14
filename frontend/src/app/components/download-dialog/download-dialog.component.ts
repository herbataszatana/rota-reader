// src/app/components/download-dialog/download-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface DialogData {
  type: 'all' | 'month';
  monthName?: string;
  year?: number;
  totalShifts: number;
  workingShifts: number;
  restDays: number;
}

export interface DialogResult {
  confirmed: boolean;
  includeRestDays: boolean;
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
      min-width: 400px;
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

    @media (max-width: 500px) {
      mat-dialog-content {
        min-width: unset;
      }
    }
  `]
})
export class DownloadDialogComponent {
  includeRestDays = true;

  constructor(
      public dialogRef: MatDialogRef<DownloadDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close({ confirmed: false, includeRestDays: false });
  }

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true, includeRestDays: this.includeRestDays });
  }
}