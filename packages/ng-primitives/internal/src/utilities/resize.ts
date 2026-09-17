import { isPlatformServer } from '@angular/common';
import {
  DestroyRef,
  effect,
  inject,
  Injector,
  PLATFORM_ID,
  signal,
  Signal,
  untracked,
} from '@angular/core';
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
  const platformId = injector?.get(PLATFORM_ID) ?? inject(PLATFORM_ID);

  return new Observable(observable => {
    // ResizeObserver may not be available in all environments, so check for its existence
    if (isPlatformServer(platformId) || isUndefined(window?.ResizeObserver)) {
      // ResizeObserver is not available (SSR or unsupported browser)
      // Complete the observable without emitting any values
      observable.complete();
      return;
    }

    let observer: ResizeObserver | null = null;
    let lastEmitted: Dimensions | null = null;

    // The deferred baseline below and the observer's own initial callback both report
    // the starting size, so a rendered element would otherwise announce it twice.
    // Consumers that treat every emission as a change — the thread viewport skips the
    // baseline to find real resizes — would act on that duplicate as if the element
    // had resized.
    function emit(dimensions: Dimensions): void {
      if (
        lastEmitted &&
        lastEmitted.width === dimensions.width &&
        lastEmitted.height === dimensions.height
      ) {
        return;
      }

      lastEmitted = dimensions;
      observable.next(dimensions);
    }

    function setupOrTeardownObserver() {
      if (disabled()) {
        if (observer) {
          observer.disconnect();
          observer = null;
          // Re-enabling should produce a fresh baseline even at an unchanged size.
          lastEmitted = null;
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
          emit(getElementDimensions(element, entry));
        });

        observer.observe(element);

        // Emit an initial measurement to avoid one-frame stale layout while waiting
        // for the first ResizeObserver callback, but defer it to a microtask.
        //
        // Measuring here synchronously would force a layout flush in the middle of
        // whatever is creating the element, so a framework creating N observed
        // elements in one pass pays N interleaved reflows — the cost grows with the
        // document, and on a dense page it blocks the main thread for seconds.
        // Microtasks run after the current task's DOM writes but still before paint,
        // so every element created in that pass shares a single layout flush and the
        // measurement is no less timely.
        //
        // The observer's own initial callback is not a substitute. It does fire for a
        // newly observed element, but it is delivered at rendering time — before paint,
        // yet after every microtask — so anything reading the measurement in the
        // current task still sees the pre-observation value. A tooltip hovered in the
        // same task it rendered would decide it has no overflow and never open.
        queueMicrotask(() => {
          // `observer` is nulled on teardown, so an unsubscribed observable performs no
          // measurement — the layout read is the cost this whole change exists to avoid.
          if (observer) {
            emit(getElementDimensions(element));
          }
        });
      }
    }

    setupOrTeardownObserver();

    const disabledEffect = explicitEffect([disabled], () => setupOrTeardownObserver(), {
      injector,
    });

    return () => {
      // The effect lives on its injector, not the subscription, so without this a later
      // `disabled` change would build a fresh observer — and schedule a fresh layout
      // read — for a subscription nobody is listening to.
      disabledEffect.destroy();
      observer?.disconnect();
      observer = null;
    };
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

function getElementDimensions(element: HTMLElement, entry?: ResizeObserverEntry): Dimensions {
  if (!entry) {
    // Match what the observer reports: an untransformed border-box size at full
    // precision. `offsetWidth`/`offsetHeight` are untransformed but round to whole
    // pixels, and `getBoundingClientRect()` is fractional but includes transforms —
    // either would describe the same unchanged element differently from the observer,
    // reporting the wrong number and defeating the de-duplication above.
    return measureBorderBox(element);
  }

  const borderSizeEntry = entry.borderBoxSize;
  // this may be different across browsers so normalize it
  const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
  const width = borderSize.inlineSize;
  const height = borderSize.blockSize;

  // For inline elements, ResizeObserver may report 0,0 dimensions
  // Use getBoundingClientRect as fallback for inline elements with zero dimensions
  if ((width === 0 || height === 0) && getComputedStyle(element).display === 'inline') {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  return { width, height };
}

/**
 * The element's border-box size, excluding any transform, in fractional pixels —
 * the same quantity a `ResizeObserver` entry reports.
 *
 * `width`/`height` resolve to whichever box `box-sizing` selects, so only the
 * content-box case has to add padding, borders and the scrollbar back on.
 */
function measureBorderBox(element: HTMLElement): Dimensions {
  const style = getComputedStyle(element);

  // Only a px length is a measurement: a non-rendered element keeps its units, so an
  // inline box resolves to `auto` and a hidden percentage width stays `50%`. Fall back
  // to the rect, which is what the observer path uses for inline elements too — the
  // observer reports 0x0 for an inline box, so measuring differently here would
  // announce an unchanged size twice, and inline triggers are the common case.
  // `transform` does not apply to non-replaced inline boxes, so the rect is the
  // untransformed border box for them.
  if (!style.width.endsWith('px') || !style.height.endsWith('px')) {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  const width = parseFloat(style.width);
  const height = parseFloat(style.height);

  if (style.boxSizing === 'border-box') {
    return { width, height };
  }

  const borderHorizontal = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const borderVertical = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  const paddingHorizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingVertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  // A scrollbar comes off the content box but is part of the border box the observer
  // reports, so it has to be added back or the same unchanged element measures a
  // scrollbar smaller here than it does there. Only a scroll container has one, and
  // `offsetWidth`/`clientWidth` cost layout, so the common case stays unmeasured; they
  // are whole pixels, so a fractional border can leave a sub-pixel remainder.
  const scrollable = style.overflowX !== 'visible' || style.overflowY !== 'visible';
  const scrollbarHorizontal = scrollable
    ? Math.max(0, element.offsetWidth - element.clientWidth - borderHorizontal)
    : 0;
  const scrollbarVertical = scrollable
    ? Math.max(0, element.offsetHeight - element.clientHeight - borderVertical)
    : 0;

  return {
    width: width + paddingHorizontal + borderHorizontal + scrollbarHorizontal,
    height: height + paddingVertical + borderVertical + scrollbarVertical,
  };
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
