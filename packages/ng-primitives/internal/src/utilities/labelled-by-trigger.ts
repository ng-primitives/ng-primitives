import { ElementRef, inject, Injector, signal, Signal } from '@angular/core';
import { attrBinding } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { explicitEffect } from '../signals/explicit-effect';
import { fromMutationObserver } from './mutation-observer';

/** How the consumer named the overlay itself, apart from the `aria-labelledby` written here. */
interface ConsumerName {
  readonly hasAriaLabel: boolean;
  readonly labelledBy: string | null;
}

/**
 * Name an overlay by its trigger through `aria-labelledby` while the consumer has not named it:
 * an overlay with an `aria-label` carries no trigger id, and an `aria-labelledby` of the
 * consumer's own is kept.
 */
export function labelledByTrigger(
  element: ElementRef<HTMLElement>,
  trigger: () => HTMLElement | null | undefined,
): void {
  const triggerId = observedId(trigger);
  // The one record of ownership: any other `aria-labelledby` on the overlay is the consumer's.
  let appliedId: string | null = null;

  const readConsumerName = (): ConsumerName => {
    const labelledBy = element.nativeElement.getAttribute('aria-labelledby');

    return {
      hasAriaLabel: element.nativeElement.hasAttribute('aria-label'),
      labelledBy: labelledBy === appliedId ? null : labelledBy,
    };
  };
  const consumerNameChanged = observedConsumerName(element, readConsumerName);

  attrBinding(element, 'aria-labelledby', () => {
    // Both read before any return, so every run depends on the trigger id and on the labels.
    const id = triggerId() || null;
    consumerNameChanged();

    // Read from the element: its observer reports a moment after the consumer writes.
    const { hasAriaLabel, labelledBy } = readConsumerName();

    if (labelledBy !== null) {
      appliedId = null;
      return labelledBy;
    }

    appliedId = hasAriaLabel ? null : id;
    return appliedId;
  });
}

/**
 * The consumer's naming of the overlay, kept current. A write of `labelledByTrigger` itself reads
 * as no consumer `aria-labelledby`, so it leaves the value equal and reruns nothing.
 */
function observedConsumerName(
  element: ElementRef<HTMLElement>,
  read: () => ConsumerName,
): Signal<ConsumerName> {
  const name = signal(read(), {
    equal: (a, b) => a.hasAriaLabel === b.hasAriaLabel && a.labelledBy === b.labelledBy,
  });

  fromMutationObserver(element.nativeElement, {
    attributes: true,
    attributeFilter: ['aria-label', 'aria-labelledby'],
  })
    .pipe(safeTakeUntilDestroyed())
    .subscribe(() => name.set(read()));

  return name;
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
