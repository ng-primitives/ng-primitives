import { ElementRef, inject, Injector, signal, Signal } from '@angular/core';
import { attrBinding } from 'ng-primitives/state';
import { explicitEffect } from '../signals/explicit-effect';
import { fromMutationObserver } from './mutation-observer';

/**
 * Name an overlay by its trigger through `aria-labelledby`, unless the consumer named it: with an
 * `aria-label` present when the overlay first renders, or with an `aria-labelledby` of their own,
 * whenever it is set.
 */
export function labelledByTrigger(
  element: ElementRef<HTMLElement>,
  trigger: () => HTMLElement | null | undefined,
): void {
  const triggerId = observedId(trigger);
  let hasOwnLabel: boolean | undefined;
  let appliedId: string | null = null;

  attrBinding(element, 'aria-labelledby', () => {
    // Decided once, so an `aria-label` added later does not freeze the overlay on the id it has.
    // In the browser the first run is after render, so a label bound in the template is already set.
    hasOwnLabel ??= element.nativeElement.hasAttribute('aria-label');

    // Read every run: a value other than the one written here is the consumer's, and is kept.
    const current = element.nativeElement.getAttribute('aria-labelledby');
    const hasOwnLabelledBy = current !== null && current !== appliedId;

    if (hasOwnLabel || hasOwnLabelledBy) {
      return current;
    }

    appliedId = triggerId() || null;
    return appliedId;
  });
}

/**
 * The trigger's `id`, kept current. The id is the consumer's to set, by any means, so the
 * attribute itself is what is watched.
 */
function observedId(trigger: () => HTMLElement | null | undefined): Signal<string | undefined> {
  const id = signal<string | undefined>(undefined);
  const injector = inject(Injector);

  explicitEffect([trigger], ([current], onCleanup) => {
    id.set(current?.id);

    if (!current) {
      return;
    }

    const subscription = fromMutationObserver(current, {
      attributes: true,
      attributeFilter: ['id'],
      injector,
    }).subscribe(() => id.set(current.id));

    onCleanup(() => subscription.unsubscribe());
  });

  return id;
}
