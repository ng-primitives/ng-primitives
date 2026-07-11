import { Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { NgpRatingItemState } from '../rating/rating-state';

/**
 * Inputs for the rating item state function. The parent passes exactly what the
 * item needs - the item never reaches back into the rating state.
 */
export interface NgpRatingItemProps {
  /** The 1-based position of the item. */
  readonly index: number;
  /** Whether the item is fully filled. */
  readonly checked: Signal<boolean>;
  /** Whether the item is half filled. */
  readonly half: Signal<boolean>;
  /** The fill amount of the item, 0-1. */
  readonly fraction: Signal<number>;
  /** Whether the item is part of the current hover preview. */
  readonly highlighted: Signal<boolean>;
  /** Whether half values are allowed (for pointer half-detection). */
  readonly allowHalf: Signal<boolean>;
  /** Preview the value the pointer is over. */
  readonly preview: (value: number) => void;
  /** Commit the value the pointer selects. */
  readonly commit: (value: number) => void;
}

/**
 * The state function for a single rendered rating item. Reflects the item's
 * state onto the element as data attributes, wires the pointer interactions
 * (hover preview + click, with half-value detection), and returns the item's
 * render state - which `renderList` exposes as the `*ngpRatingItem` context.
 *
 * Runs inside the render-pass injection context provided by `renderList`, so its
 * element is available via `injectElementRef()` and its `dataBinding` effects and
 * listeners are cleaned up automatically.
 */
export const [
  NgpRatingItemStateToken,
  ngpRatingItem,
  injectRatingItemState,
  provideRatingItemState,
] = createPrimitive(
  'NgpRatingItem',
  ({
    index,
    checked,
    half,
    fraction,
    highlighted,
    allowHalf,
    preview,
    commit,
  }: NgpRatingItemProps): NgpRatingItemState => {
    const element = injectElementRef<HTMLElement>();

    dataBinding(element, 'data-checked', checked);
    dataBinding(element, 'data-half', half);
    dataBinding(element, 'data-highlighted', highlighted);

    listener(element, 'pointermove', event =>
      preview(valueAt(element.nativeElement, index, allowHalf(), event)),
    );
    listener(element, 'click', event =>
      commit(valueAt(element.nativeElement, index, allowHalf(), event)),
    );

    // Getters so each template read re-derives from the live signals.
    return {
      index,
      get checked() {
        return checked();
      },
      get half() {
        return half();
      },
      get fraction() {
        return fraction();
      },
      get highlighted() {
        return highlighted();
      },
    } satisfies NgpRatingItemState;
  },
);

/** Resolve the value the pointer is currently over, honouring half steps. */
function valueAt(
  element: HTMLElement,
  index: number,
  allowHalf: boolean,
  event: { clientX: number },
): number {
  if (!allowHalf) {
    return index;
  }

  const rect = element.getBoundingClientRect();
  const isRTL = getComputedStyle(element).direction === 'rtl';
  const ratio = isRTL
    ? (rect.right - event.clientX) / rect.width
    : (event.clientX - rect.left) / rect.width;
  return ratio <= 0.5 ? index - 0.5 : index;
}
