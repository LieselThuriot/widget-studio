import { Component, input } from '@angular/core';
import type { RefreshEventAlert } from './event-alert-dialog';

@Component({
  selector: 'app-refresh-alert',
  templateUrl: './refresh-alert.html',
  styleUrl: './refresh-alert.css',
})
export class RefreshAlertComponent {
  readonly alert = input.required<RefreshEventAlert>();
}
