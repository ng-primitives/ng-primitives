import { inject, InjectionToken, Signal, ValueProvider } from '@angular/core';
import type { NgpToast, NgpToastSwipeDirection } from './toast';

const NgpToastContext = new InjectionToken<NgpToastContext>('NgpToastContext');

export function provideToastContext(context: NgpToastContext): ValueProvider {
  return { provide: NgpToastContext, useValue: context };
}

export function injectToastContext(): NgpToastContext {
  return inject(NgpToastContext);
}

export interface NgpToastContext {
  /**
   * The position of the toast.
   */
  placement:
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'top-center'
    | 'bottom-center';
  /**
   * The duration of the toast in milliseconds.
   */
  duration: number;

  /**
   * A function to register the toast instance with the manager.
   * @internal
   */
  register: (toast: NgpToast) => void;

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
