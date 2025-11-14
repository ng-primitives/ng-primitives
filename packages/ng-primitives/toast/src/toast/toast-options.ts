import { inject, InjectionToken, Signal, ValueProvider } from '@angular/core';
import type { NgpToastPlacement, NgpToastSwipeDirection } from './toast';
import { NgpToastState } from './toast-pattern';

const NgpToastOptions = new InjectionToken<NgpToastOptions>('NgpToastOptions');

export function provideToastOptions(context: NgpToastOptions): ValueProvider {
  return { provide: NgpToastOptions, useValue: context };
}

export function injectToastOptions(): NgpToastOptions {
  return inject(NgpToastOptions);
}

export interface NgpToastOptions {
  /**
   * The position of the toast.
   */
  placement: NgpToastPlacement;

  /**
   * The duration of the toast in milliseconds.
   */
  duration: number;

  /**
   * A function to register the toast instance with the manager.
   * @internal
   */
  register: (toast: NgpToastState) => void;

  /**
   * Whether the toast region is expanded.
   * @internal
   */
  expanded: Signal<boolean>;

  /**
   * Whether the toast supports swipe dismiss.
   * @internal
   */
  dismissible: boolean;

  /**
   * The swipe directions supported by the toast.
   * @internal
   */
  swipeDirections: NgpToastSwipeDirection[];
}
