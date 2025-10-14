import { ElementRef, FactoryProvider, inject, InjectionToken, Signal, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export interface NgpFocusTrapState {
  disabled: Signal<boolean>;
}

export interface NgpFocusTrapProps {
  disabled: Signal<boolean>;
  element?: ElementRef<HTMLElement>;
}

export function ngpFocusTrapPattern({
  disabled,
  element = injectElementRef(),
}: NgpFocusTrapProps): NgpFocusTrapState {
  // Setup host attribute bindings
  attrBinding(element, 'tabindex', () => '-1');
  dataBinding(element, 'data-focus-trap', () => (!disabled() ? '' : null));

  return {
    disabled,
  };
}

export const NgpFocusTrapPatternToken = new InjectionToken<NgpFocusTrapState>(
  'NgpFocusTrapPatternToken',
);

export function injectFocusTrapPattern(): NgpFocusTrapState {
  return inject(NgpFocusTrapPatternToken);
}

export function provideFocusTrapPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpFocusTrapState,
): FactoryProvider {
  return { provide: NgpFocusTrapPatternToken, useFactory: () => fn(inject(type)) };
}
