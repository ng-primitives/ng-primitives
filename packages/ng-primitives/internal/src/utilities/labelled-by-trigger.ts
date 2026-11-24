import { computed, ElementRef, inject, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { attrBinding } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { fromMutationObserver } from './mutation-observer';

/** The overlay's naming attributes as they stand, the `aria-labelledby` written here included. */
interface NamingAttributes {
  readonly hasAriaLabel: boolean;
  readonly labelledBy: string | null;
}

/**
 * Name an overlay by its trigger through `aria-labelledby` while the consumer has not named it:
 * an overlay with a non-blank `aria-label` carries no trigger id, and an `aria-labelledby` of the
 * consumer's own is kept.
 */
export function labelledByTrigger(
  element: ElementRef<HTMLElement>,
  trigger: () => HTMLElement | null | undefined,
): void {
  // The one record of ownership: any other `aria-labelledby` on the overlay is the consumer's.
  let appliedId: string | null = null;

  // The id is the consumer's to set, by any means, so the attribute itself is what is watched.
  const triggerId = observedAttributes(trigger, ['id'], current => current?.id || null);

  // The key keeps the id applied here, so removing it reruns the binding. The binding's own write
  // cannot loop: its rerun writes the same id, which reads as an equal key.
  const namingAttributes = observedAttributes(
    () => element.nativeElement,
    ['aria-label', 'aria-labelledby'],
    (overlay): NamingAttributes => ({
      hasAriaLabel: hasOwnAriaLabel(overlay),
      labelledBy: overlay.getAttribute('aria-labelledby'),
    }),
    (a, b) => a.hasAriaLabel === b.hasAriaLabel && a.labelledBy === b.labelledBy,
  );

  attrBinding(element, 'aria-labelledby', () => {
    const { hasAriaLabel, labelledBy } = namingAttributes();

    if (labelledBy !== null && labelledBy !== appliedId) {
      appliedId = null;
      return labelledBy;
    }

    appliedId = hasAriaLabel ? null : triggerId();
    return appliedId;
  });
}

/** Whether the overlay's `aria-label` names it: an empty or blank one gives no accessible name. */
function hasOwnAriaLabel(overlay: HTMLElement): boolean {
  return !!overlay.getAttribute('aria-label')?.trim();
}

/**
 * What `read` finds on the element, taken from the element on every call: its observer reports a
 * moment after a write. A reactive reader reruns once the named attributes change what `read`
 * finds.
 */
function observedAttributes<E extends HTMLElement | null | undefined, T>(
  element: () => E,
  attributeFilter: string[],
  read: (element: E) => T,
  equal?: (a: T, b: T) => boolean,
): () => T {
  const changes = signal(0);
  const injector = inject(Injector);

  toObservable(computed(element))
    .pipe(
      switchMap(current =>
        current
          ? fromMutationObserver(current, { attributeFilter, injector }).pipe(startWith(null))
          : of(null),
      ),
      map(() => read(element())),
      distinctUntilChanged(equal),
      safeTakeUntilDestroyed(),
    )
    .subscribe(() => changes.update(count => count + 1));

  return () => {
    changes();
    return read(element());
  };
}
