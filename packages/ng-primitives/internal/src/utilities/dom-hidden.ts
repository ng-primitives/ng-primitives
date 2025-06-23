import { fromResizeEvent } from 'ng-primitives/resize';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * A utility function that observes when an element is hidden by listening
 * to changes in its size - a size of 0 means hidden whereas a size greater
 * than 0 suggests it is visible.
 * @internal
 */
export function onDomHidden(element: HTMLElement): Observable<void> {
  return fromResizeEvent(element).pipe(
    filter(({ width, height }) => width === 0 && height === 0),
    map(() => void 0),
  );
}
