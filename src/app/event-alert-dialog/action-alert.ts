import { UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { ActionEventAlert } from './event-alert-dialog';

@Component({
  selector: 'app-action-alert',
  imports: [UpperCasePipe],
  templateUrl: './action-alert.html',
  styleUrl: './action-alert.css',
})
export class ActionAlertComponent {
  readonly alert = input.required<ActionEventAlert>();
}
