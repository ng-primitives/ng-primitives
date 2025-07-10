import { inject, InjectionToken, ValueProvider } from '@angular/core';

const NgpToastContext = new InjectionToken<unknown>('NgpToastContext');

export function provideToastContext<T>(context: T): ValueProvider {
  return { provide: NgpToastContext, useValue: context };
}

export function injectToastContext<T>(): T {
  return inject(NgpToastContext) as T;
}
