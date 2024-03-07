import { Observable } from 'rxjs';

/**
 * A simple helper function to create a resize observer as an RxJS Observable.
 */
export function fromResizeEvent(element: HTMLElement): Observable<ResizeEvent> {
  return new Observable(observer => {
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

export interface ResizeEvent {
  width: number;
  height: number;
}
