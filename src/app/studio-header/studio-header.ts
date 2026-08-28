import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-studio-header',
  imports: [NgOptimizedImage],
  templateUrl: './studio-header.html',
  styleUrl: './studio-header.css',
})
export class StudioHeader {
  readonly darkMode = input(false);
  readonly activeTab = input<'compose' | 'landscape'>('compose');
  readonly landscapeLoading = input(false);
  readonly landscapeSimulationDisabled = input(false);
  readonly darkModeToggled = output<void>();
  readonly previewRequested = output<void>();
  readonly shareRequested = output<void>();
  readonly simulateRequested = output<void>();
}
