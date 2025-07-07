import { DestroyRef, inject, Injector, Signal, signal } from '@angular/core';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { merge } from 'rxjs';
import { fromMutationObserver } from './mutation-observer';
import { fromResizeEvent } from './resize';

interface NgpOverflowListenerOptions {
  /**
   * Whether to listen for overflow changes.
   */
  disabled?: Signal<boolean>;
  /**
   * The injector to use when called from outside of the injector context.
   */
  injector?: Injector;
}

export function setupOverflowListener(
  element: HTMLElement,
  { disabled = signal(false), injector }: NgpOverflowListenerOptions,
): Signal<boolean> {
  const hasOverflow = signal<boolean>(false);
  const destroyRef = injector?.get(DestroyRef) ?? inject(DestroyRef);

  // Merge both observables and update hasOverflow on any event

  merge(
    fromResizeEvent(element, { disabled, injector }),
    fromMutationObserver(element, { disabled, injector, characterData: true }),
  )
    .pipe(safeTakeUntilDestroyed(destroyRef))
    .subscribe(() =>
      hasOverflow.set(
        element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
      ),
    );

  return hasOverflow;
}
