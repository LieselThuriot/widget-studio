import { Injectable, signal } from '@angular/core';

export interface ProgressTooltipState {
  x: number;
  y: number;
  label: string;
  value: number;
  color?: string;
}

@Injectable()
export class WidgetTooltip {
  readonly progress = signal<ProgressTooltipState | null>(null);
  private readonly overlay = signal<HTMLElement | null>(null);
  private progressOwner: object | null = null;

  setOverlay(overlay: HTMLElement): void {
    this.overlay.set(overlay);
  }

  overlayElement(): HTMLElement | null {
    return this.overlay();
  }

  showProgress(owner: object, state: ProgressTooltipState): void {
    this.progressOwner = owner;
    this.progress.set(state);
  }

  hideProgress(owner: object): void {
    if (this.progressOwner !== owner) return;
    this.progressOwner = null;
    this.progress.set(null);
  }

  clear(): void {
    this.progressOwner = null;
    this.progress.set(null);
    this.overlay.set(null);
  }
}
