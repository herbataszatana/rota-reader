import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { startWith } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatDivider,
    MatProgressSpinner
  ],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  selectedFile?: File;
  uploadMessage = '';
  isLoading = false;

  links: any[] = []; // original links + employees
  filteredLinks: any[] = []; // links filtered by search
  employeeSearchCtrl = new FormControl('');

  constructor(private http: HttpClient) {}

  get hasEmployees(): boolean {
    return this.filteredLinks.some(link => link.employees.length > 0);
  }

  get searchTerm(): string {
    return this.employeeSearchCtrl.value || '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      this.uploadFile();
    }
  }

  async uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.isLoading = true;
    this.uploadMessage = '';

    try {
      const res: any = await this.http
        .post('http://localhost:3000/api/upload', formData)
        .toPromise();

      this.uploadMessage = `${this.selectedFile?.name} uploaded successfully!`;
      this.links = res?.result?.links ?? [];
      this.filteredLinks = [...this.links];

      this.setupSearchFilter();
    } catch (err) {
      console.error('Upload failed', err);
      this.uploadMessage = 'Upload failed. See console for details.';
    } finally {
      this.isLoading = false;
    }
  }

  setupSearchFilter() {
    this.employeeSearchCtrl.valueChanges
      .pipe(startWith(''))
      .subscribe(value => {
        const filter = (value || '').toLowerCase();

        // Map each link and filter its employees
        this.filteredLinks = this.links.map(link => ({
          ...link,
          employees: link.employees.filter((e: any) =>
            e.name.toLowerCase().includes(filter)
          )
        }));
      });
  }

}
