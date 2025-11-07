// src/app/components/display/display.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { startWith } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface Employee {
  name: string;
  link: string;
  wk: number
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
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './display.component.html'
})
export class DisplayComponent {
  @Input() links: Link[] = [];
  filteredLinks: Link[] = [];
  employeeSearchCtrl = new FormControl('');

  constructor(private http: HttpClient) {}

  ngOnChanges() {
    this.filteredLinks = [...this.links];
    this.setupSearchFilter();
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

// display.component.ts
  selectEmployee(emp: { name: string; wk: number }, link: { link: string }) {
    const payload = {
      name: emp.name,
      link: link.link,
      wk: emp.wk
    };
    console.log("payload: " + JSON.stringify(payload));
    this.http.post('http://localhost:3000/api/selectEmployee', payload)
      .subscribe({
        next: res => console.log('Selected employees sent', res),
        error: err => console.error('Error sending employees', err)
      });
  }

}
