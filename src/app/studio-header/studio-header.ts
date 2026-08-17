import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-studio-header',
  templateUrl: './studio-header.html',
  styleUrl: './studio-header.css',
})
export class StudioHeader {
  readonly darkMode = input(false);
  readonly darkModeToggled = output<void>();
  readonly previewRequested = output<void>();
  readonly shareRequested = output<void>();
}
