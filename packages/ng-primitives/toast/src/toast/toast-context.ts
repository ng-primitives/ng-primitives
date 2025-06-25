import { inject, InjectionToken, ValueProvider } from '@angular/core';
import type { NgpToast } from './toast';

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
  position:
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
}
