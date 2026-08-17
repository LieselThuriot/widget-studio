import { Component, ElementRef, inject, input, OnInit, output, signal } from '@angular/core';
import { encodeWidgetShareUrl } from '../widget-sharing';
import { focusFirstElement, focusableElements, trapTabFocus } from '../dialog-focus';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.html',
  styleUrl: './share-dialog.css',
})
export class ShareDialog implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly previouslyFocused = document.activeElement;
  readonly modelJson = input.required<string>();
  readonly closed = output<void>();
  protected readonly shareUrl = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly isCopying = signal(false);

  constructor() {
    queueMicrotask(() => focusFirstElement(this.elementRef.nativeElement));
  }

  ngOnInit(): void {
    void this.createShareUrl();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    trapTabFocus(event, focusableElements(this.elementRef.nativeElement));
  }

  protected close(): void {
    this.closed.emit();
    if (this.previouslyFocused instanceof HTMLElement) this.previouslyFocused.focus();
  }

  protected async copyLink(): Promise<void> {
    const url = this.shareUrl();
    if (!url || this.isCopying()) return;
    this.isCopying.set(true);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard is unavailable.');
      await navigator.clipboard.writeText(url);
      this.status.set('Link copied to clipboard.');
    } catch {
      this.status.set('Copy failed. Select the link and copy it manually.');
    } finally {
      this.isCopying.set(false);
    }
  }

  private async createShareUrl(): Promise<void> {
    try {
      this.shareUrl.set(await encodeWidgetShareUrl(this.modelJson()));
    } catch (error) {
      this.status.set(error instanceof Error ? error.message : 'Could not create a share link.');
    }
  }
}
