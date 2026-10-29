import { ElementRef } from '@angular/core';
import { attrBinding } from 'ng-primitives/state';

/**
 * Name an overlay by its trigger through `aria-labelledby`, unless the consumer gave it an
 * `aria-label` or `aria-labelledby` of its own.
 */
export function labelledByTrigger(
  element: ElementRef<HTMLElement>,
  triggerId: () => string | null | undefined,
): void {
  let appliedId: string | null = null;

  // In the browser this runs after render, so a label bound in the template is already set.
  attrBinding(element, 'aria-labelledby', () => {
    const current = element.nativeElement.getAttribute('aria-labelledby');
    const ownLabel =
      element.nativeElement.hasAttribute('aria-label') ||
      (current !== null && current !== appliedId);

    appliedId = ownLabel ? null : triggerId() || null;
    return ownLabel ? current : appliedId;
  });
}
