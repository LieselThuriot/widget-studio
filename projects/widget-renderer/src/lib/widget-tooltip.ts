import { Injectable, signal, untracked } from '@angular/core';

export interface ChartTooltipState {
  x: number;
  y: number;
  label: string;
  value: number;
  color?: string;
}

@Injectable()
export class WidgetTooltip {
  readonly state = signal<ChartTooltipState | null>(null);
  private readonly overlay = signal<HTMLElement | null>(null);
  private readonly currentOwner = signal<object | null>(null);
  readonly owner = this.currentOwner.asReadonly();

  setOverlay(overlay: HTMLElement): void {
    this.overlay.set(overlay);
  }

  overlayElement(): HTMLElement | null {
    return this.overlay();
  }

  show(owner: object, state: ChartTooltipState): void {
    this.currentOwner.set(owner);
    this.state.set(state);
  }

  hide(owner: object): void {
    if (untracked(this.currentOwner) !== owner) return;
    this.currentOwner.set(null);
    this.state.set(null);
  }

  clear(): void {
    this.currentOwner.set(null);
    this.state.set(null);
    this.overlay.set(null);
  }
}
