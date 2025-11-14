// src/app/components/upload/upload.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { Link } from '../display/display.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  @Output() linksChange = new EventEmitter<Link[]>();

  selectedFile?: File;
  uploadMessage = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
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
      const res = await this.http
          .post<{ result: { links: Link[] } }>('http://localhost:3000/api/upload', formData)
          .toPromise();

      const links = res?.result?.links ?? [];
      this.linksChange.emit(links);

      this.uploadMessage = `${this.selectedFile.name} uploaded successfully!`;
    } catch (err) {
      console.error('Upload failed', err);
      this.uploadMessage = 'Upload failed. See console for details.';
    } finally {
      this.isLoading = false;
    }
  }
}
