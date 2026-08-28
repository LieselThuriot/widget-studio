import { Component, input } from '@angular/core';
import type { LandscapeConfirmAlert } from './event-alert-dialog';

@Component({
  selector: 'app-landscape-confirm-alert',
  templateUrl: './landscape-confirm-alert.html',
  styleUrl: './landscape-confirm-alert.css',
})
export class LandscapeConfirmAlertComponent {
  readonly alert = input.required<LandscapeConfirmAlert>();
}
