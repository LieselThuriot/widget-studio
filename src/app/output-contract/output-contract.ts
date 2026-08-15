import { Component, input } from '@angular/core';

@Component({
  selector: 'app-output-contract',
  templateUrl: './output-contract.html',
  styleUrl: './output-contract.css',
})
export class OutputContract {
  readonly modelJson = input.required<string>();
}
