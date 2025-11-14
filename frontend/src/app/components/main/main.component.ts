// src/app/components/main/main.component.ts
import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { UploadComponent } from '../upload/upload.component';
import { DisplayComponent, Link } from '../display/display.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    UploadComponent,
    DisplayComponent
  ],
  templateUrl: './main.component.html'
})
export class MainComponent {
  links: Link[] = [];

  handleLinksUpdate(newLinks: Link[]) {
    this.links = newLinks;
  }
}
