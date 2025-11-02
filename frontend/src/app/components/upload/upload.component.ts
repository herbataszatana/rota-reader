import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgIf],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  selectedFile?: File;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }
}
