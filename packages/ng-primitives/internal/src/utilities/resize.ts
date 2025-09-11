import { DestroyRef, effect, inject, Injector, signal, Signal, untracked } from '@angular/core';
import { isUndefined, safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { explicitEffect } from '../signals/explicit-effect';
import { injectElementRef } from './element-ref';

interface NgpResizeObserverOptions {
  /**
   * Whether to listen for events.
   */
  disabled?: Signal<boolean>;

  /**
   * The injector to use when called from outside of the injector context.
   */
  injector?: Injector;
}

/**
 * A simple helper function to create a resize observer as an RxJS Observable.
 * @param element The element to observe for resize events.
 * @returns The resize event as an Observable.
 */
export function fromResizeEvent(
  element: HTMLElement,
  { disabled = signal(false), injector }: NgpResizeObserverOptions = {},
): Observable<Dimensions> {
  return new Observable(observable => {
    // ResizeObserver may not be available in all environments, so check for its existence
    if (isUndefined(window?.ResizeObserver)) {
      // ResizeObserver is not available (SSR or unsupported browser)
      // Complete the observable without emitting any values
      observable.complete();
      return;
    }

    let observer: ResizeObserver | null = null;

    function setupOrTeardownObserver() {
      if (disabled()) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        return;
      }

      if (!observer) {
        observer = new ResizeObserver(entries => {
          // if there are no entries, ignore the event
          if (!entries.length) {
            return;
          }

          // otherwise, take the first entry and emit the dimensions
          const entry = entries[0];

          if ('borderBoxSize' in entry) {
            const borderSizeEntry = entry['borderBoxSize'];
            // this may be different across browsers so normalize it
            const borderSize = Array.isArray(borderSizeEntry)
              ? borderSizeEntry[0]
              : borderSizeEntry;

            observable.next({ width: borderSize['inlineSize'], height: borderSize['blockSize'] });
          } else {
            // fallback for browsers that don't support borderBoxSize
            observable.next({ width: element.offsetWidth, height: element.offsetHeight });
          }
        });

        observer.observe(element);
      }
    }

    setupOrTeardownObserver();

    explicitEffect([disabled], () => setupOrTeardownObserver(), { injector });

    return () => observer?.disconnect();
  });
}

/**
 * A utility function to observe any element for resize events and return the dimensions as a signal.
 */
export function observeResize(elementFn: () => HTMLElement | undefined): Signal<Dimensions> {
  const dimensions = signal<Dimensions>({ width: 0, height: 0 });
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);

  // store the subscription to the resize event
  let subscription: Subscription | null = null;

  effect(() => {
    const targetElement = elementFn();

    untracked(() => {
      if (!targetElement) {
        return;
      }

      // if we already have a subscription, unsubscribe from it
      subscription?.unsubscribe();

      // create a new subscription to the resize event
      subscription = fromResizeEvent(targetElement, { injector })
        .pipe(safeTakeUntilDestroyed(destroyRef))
        .subscribe(event => dimensions.set({ width: event.width, height: event.height }));
    });
  });

  return dimensions;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * A simple utility to get the dimensions of an element as a signal.
 */
export function injectDimensions(): Signal<Dimensions> {
  const elementRef = injectElementRef<HTMLElement>();
  const destroyRef = inject(DestroyRef);
  const dimensions = signal<Dimensions>({ width: 0, height: 0 });

  fromResizeEvent(elementRef.nativeElement)
    .pipe(
      safeTakeUntilDestroyed(destroyRef),
      map(({ width, height }) => ({ width, height })),
    )
    .subscribe(event => dimensions.set(event));

  return dimensions;
}
