import { Signal, isSignal } from '@angular/core';

/**
 * An overlay option that is either a fixed value or a signal the overlay re-reads.
 *
 * An overlay is created lazily on the first open and then reused, so an option passed
 * as a plain value is frozen at that moment - a trigger that hands over `offset()`
 * rather than `offset` pins the overlay to whatever the input held the first time it
 * opened. Passing the signal lets a consumer's binding keep working for the lifetime of
 * the overlay; passing a value stays available for the options a primitive fixes.
 */
export type NgpOverlayOption<T> = T | Signal<T>;

/**
 * Read the current value of an overlay option.
 *
 * A dismiss guard is a plain function rather than a signal, and `isSignal` tests for
 * Angular's signal brand rather than callability, so guards pass through untouched.
 * @internal
 */
export function resolveOverlayOption<T>(option: NgpOverlayOption<T>): T;
export function resolveOverlayOption<T>(option: NgpOverlayOption<T> | undefined): T | undefined;
export function resolveOverlayOption<T>(option: NgpOverlayOption<T> | undefined): T | undefined {
  return isSignal(option) ? option() : option;
}
