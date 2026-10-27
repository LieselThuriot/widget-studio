import { Component, computed, input } from '@angular/core';
import { WidgetContract } from '@lieselthuriot/widget-renderer';
import { generateCsharpContract } from './csharp-contract';
import { highlightCsharp } from './csharp-highlighting';

@Component({
  selector: 'app-csharp-output',
  templateUrl: './csharp-output.html',
  styleUrl: './output-format.css',
})
export class CsharpOutput {
  readonly modelContract = input.required<WidgetContract>();
  protected readonly value = computed(() => generateCsharpContract(this.modelContract()));
  protected readonly highlightedValue = computed(() => highlightCsharp(this.value()));
}
