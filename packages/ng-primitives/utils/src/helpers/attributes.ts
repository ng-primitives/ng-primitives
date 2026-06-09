import { afterRenderEffect, Signal } from '@angular/core';

export function booleanAttributeBinding(
  element: HTMLElement,
  attribute: string,
  value: Signal<boolean> | undefined,
): void {
  // eslint-disable-next-line @angular-eslint/no-uncalled-signals -- checking whether the optional signal was provided, not its value
  if (value === undefined) {
    return;
  }

  afterRenderEffect({
    write: () =>
      value() ? element.setAttribute(attribute, '') : element.removeAttribute(attribute),
  });
}
