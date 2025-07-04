import { afterNextRender, Signal } from '@angular/core';

export function booleanAttributeBinding(
  element: HTMLElement,
  attribute: string,
  value: Signal<boolean> | undefined,
): void {
  if (!value) {
    return;
  }

  afterNextRender({
    write: () =>
      value() ? element.setAttribute(attribute, '') : element.removeAttribute(attribute),
  });
}
