// src/app/components/display/display.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';

export interface Employee {
  name: string;
  link: string;
  wk: number;
}

export interface Link {
  link: string;
  wk?: string;
  employees: Employee[];
}

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './display.component.html'
})
export class DisplayComponent {
  @Input() links: Link[] = [];
  @Output() shiftsData = new EventEmitter<any>();

  filteredLinks: Link[] = [];
  employeeSearchCtrl = new FormControl('');

  // Date range
  startDate: Date | null = null;
  endDate: Date | null = null;
  rosterWC: string | null = null;
  isLoadingShifts: boolean = false;

  constructor(private http: HttpClient, private dateAdapter: DateAdapter<Date>) {}

  setUkLocale() {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit() {
    this.setUkLocale();
    this.extractRosterWC();
  }

  ngOnChanges() {
    this.filteredLinks = [...this.links];
    this.setupSearchFilter();
    this.extractRosterWC();
  }

  get hasEmployees(): boolean {
    return this.filteredLinks.some(link => link.employees.length > 0);
  }

  get searchTerm(): string {
    return this.employeeSearchCtrl.value || '';
  }

  setupSearchFilter() {
    this.employeeSearchCtrl.valueChanges
        .pipe(startWith(''))
        .subscribe(value => {
          const filter = (value || '').toLowerCase();
          this.filteredLinks = this.links.map(link => ({
            ...link,
            employees: link.employees.filter(e =>
                e.name.toLowerCase().includes(filter)
            )
          }));
        });
  }

  selectEmployee(emp: Employee, link: Link) {
    const payload = {
      name: emp.name,
      link: link.link,
      wk: emp.wk,
      startDate: this.startDate ? this.formatDate(this.startDate) : null,
      endDate: this.endDate ? this.formatDate(this.endDate) : null
    };

    this.isLoadingShifts = true;

    this.http.post('http://localhost:3000/api/selectEmployee', payload)
        .subscribe({
          next: (res: any) => {
            console.log('✅ Selected employee sent', res);
            this.isLoadingShifts = false;
            this.shiftsData.emit({
              ...res,
              employeeName: emp.name
            });
          },
          error: err => {
            console.error("❌ Error sending employee:", err);
            console.error("🧠 Server error body:", err.error);
            this.isLoadingShifts = false;
          }
        });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  extractRosterWC() {
    if (this.links.length > 0 && this.links[0].wk) {
      const date = new Date(this.links[0].wk);
      if (!isNaN(date.getTime())) {
        this.rosterWC = `${String(date.getDate()).padStart(2,'0')}/` +
            `${String(date.getMonth() + 1).padStart(2,'0')}/` +
            `${date.getFullYear()}`;
      }
    }
  }
}