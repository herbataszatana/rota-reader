import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgIf, HttpClientModule],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  selectedFile?: File;
  uploadMessage = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
      this.uploadFile();
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/api/upload', formData)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Upload response:', res);
          this.uploadMessage = 'File uploaded successfully!';
        },
        error: (err) => {
          console.error('❌ Upload error:', err);
          this.uploadMessage = 'Upload failed. See console for details.';
        }
      });
  }
}
