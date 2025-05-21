import { Observable } from 'rxjs';

/**
 * A simple helper function to create a resize observer as an RxJS Observable.
 * @param element The element to observe for resize events.
 * @returns The resize event as an Observable.
 */
export function fromResizeEvent(element: HTMLElement): Observable<Dimensions> {
  return new Observable(observer => {
    // ResizeObserver may not be available in all environments, so check for its existence
    if (typeof ResizeObserver === 'undefined') {
      // if not available, we can return an empty observable
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

export interface Dimensions {
  width: number;
  height: number;
}
