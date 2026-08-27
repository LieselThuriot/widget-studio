import { Component, computed, input } from '@angular/core';
import { WidgetContract } from 'widget-renderer';
import { generateCsharpContract } from './csharp-contract';

@Component({
  selector: 'app-csharp-output',
  templateUrl: './csharp-output.html',
  styleUrl: './output-format.css',
})
export class CsharpOutput {
  readonly modelContract = input.required<WidgetContract>();
  protected readonly value = computed(() => generateCsharpContract(this.modelContract()));
}
