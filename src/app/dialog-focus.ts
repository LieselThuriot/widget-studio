export function focusableElements(host: HTMLElement): HTMLElement[] {
  const elements = host.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  ) as NodeListOf<HTMLElement>;
  return Array.from(elements).filter((element) => !element.hasAttribute('disabled'));
}

export function focusFirstElement(host: HTMLElement): void {
  focusableElements(host)[0]?.focus();
}

export function trapTabFocus(event: KeyboardEvent, elements: HTMLElement[]): void {
  if (event.key !== 'Tab' || !elements.length) return;
  const first = elements[0];
  const last = elements[elements.length - 1];
  const focusBoundary = event.shiftKey ? first : last;
  if (document.activeElement !== focusBoundary) return;
  event.preventDefault();
  (event.shiftKey ? last : first).focus();
}
