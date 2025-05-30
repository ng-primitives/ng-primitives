import { effect, signal, Signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/**
 * A simple helper function to create a resize observer as an RxJS Observable.
 * @param element The element to observe for resize events.
 * @returns The resize event as an Observable.
 */
export function fromResizeEvent(element: HTMLElement): Observable<Dimensions> {
  return new Observable(observer => {
    // ResizeObserver may not be available in all environments, so check for its existence
    if (typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      // ResizeObserver is not available (SSR or unsupported browser)
      // Complete the observable without emitting any values
      observer.complete();
      return;
    }

    const resizeObserver = new ResizeObserver(entries => {
      // if there are no entries, ignore the event
      if (!entries.length) {
        return;
      }

      // otherwise, take the first entry and emit the dimensions
      const entry = entries[0];

      if ('borderBoxSize' in entry) {
        const borderSizeEntry = entry['borderBoxSize'];
        // this may be different across browsers so normalize it
        const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;

        observer.next({ width: borderSize['inlineSize'], height: borderSize['blockSize'] });
      } else {
        // fallback for browsers that don't support borderBoxSize
        observer.next({
          width: element.offsetWidth,
          height: element.offsetHeight,
        });
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  });
}

/**
 * A utility function to observe any element for resize events and return the dimensions as a signal.
 */
export function observeResize(elementFn: () => HTMLElement | undefined): Signal<Dimensions> {
  const dimensions = signal<Dimensions>({ width: 0, height: 0 });

  // store the subscription to the resize event
  let subscription: Subscription | null = null;

  effect(() => {
    const targetElement = elementFn();

    if (!targetElement) {
      return;
    }

    // if we already have a subscription, unsubscribe from it
    subscription?.unsubscribe();

    // create a new subscription to the resize event
    subscription = fromResizeEvent(targetElement).subscribe(event =>
      dimensions.set({ width: event.width, height: event.height }),
    );
  });

  return dimensions;
}

export interface Dimensions {
  width: number;
  height: number;
}
