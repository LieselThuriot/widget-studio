export function eventValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
}

export function eventNumber(event: Event): number {
  return Number(eventValue(event));
}

export function eventChecked(event: Event): boolean {
  return (event.target as HTMLInputElement).checked;
}
