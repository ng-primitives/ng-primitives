import { ElementRef, inject, Injector, signal, Signal } from '@angular/core';
import { attrBinding } from 'ng-primitives/state';
import { explicitEffect } from '../signals/explicit-effect';
import { fromMutationObserver } from './mutation-observer';

/**
 * Name an overlay by its trigger through `aria-labelledby`, unless the consumer gave it an
 * `aria-label` or `aria-labelledby` of its own.
 */
export function labelledByTrigger(
  element: ElementRef<HTMLElement>,
  trigger: () => HTMLElement | null | undefined,
): void {
  const triggerId = observedId(trigger);
  let ownLabel: boolean | undefined;

  attrBinding(element, 'aria-labelledby', () => {
    // Decided once: a label added later does not override the trigger name. In the browser the
    // first run is after render, so a label bound in the template is already set.
    ownLabel ??=
      element.nativeElement.hasAttribute('aria-label') ||
      element.nativeElement.hasAttribute('aria-labelledby');

    return ownLabel ? element.nativeElement.getAttribute('aria-labelledby') : triggerId() || null;
  });
}

/**
 * The element's `id`, kept current. The id is the consumer's to set, by any means, so the
 * attribute itself is what is watched.
 */
function observedId(element: () => HTMLElement | null | undefined): Signal<string | undefined> {
  const id = signal<string | undefined>(undefined);
  const injector = inject(Injector);

  explicitEffect([element], ([current], onCleanup) => {
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
