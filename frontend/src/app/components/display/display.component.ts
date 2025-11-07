import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { startWith } from 'rxjs';

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
    ReactiveFormsModule
  ],
  templateUrl: './display.component.html'
})
export class DisplayComponent implements OnChanges {
  @Input() links: any[] = [];

  filteredLinks: any[] = [];
  employeeSearchCtrl = new FormControl('');
  hasUploaded = false; // track if links have been uploaded

  ngOnChanges(changes: SimpleChanges) {
    if (changes['links'] && this.links.length > 0) {
      this.hasUploaded = true;
      this.filteredLinks = [...this.links];
      this.setupSearchFilter();
    }
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
          employees: link.employees.filter((e: any) =>
            e.name.toLowerCase().includes(filter)
          )
        }));
      });
  }
}
