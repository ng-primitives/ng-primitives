import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromResizeEvent } from 'ng-primitives/resize';

/**
 * Whenever an element is removed from the DOM, we call the callback.
 * @param element The element to watch for removal.
 * @param callback The callback to call when the element is removed.
 */
export function onDomRemoval(element: HTMLElement, callback: () => void): void {
  const platform = inject(PLATFORM_ID);

  // Dont run this on the server
  if (isPlatformServer(platform)) {
    return;
  }

  // This is a bit of a hack, but it works. If the element dimensions become zero,
  // it's likely that the element has been removed from the DOM.
  fromResizeEvent(element)
    .pipe(takeUntilDestroyed())
    .subscribe(dimensions => {
      // we check the dimensions first to short-circuit the check as it's faster
      if (dimensions.width === 0 && dimensions.height === 0 && !document.body.contains(element)) {
        callback();
      }
    });
}
