import { Component, computed, input } from '@angular/core';
import { WidgetContract } from 'widget-renderer';

@Component({
  selector: 'app-json-output',
  templateUrl: './json-output.html',
  styleUrl: './output-format.css',
})
export class JsonOutput {
  readonly modelContract = input.required<WidgetContract>();
  protected readonly value = computed(() => JSON.stringify(this.modelContract(), null, 2));
}
