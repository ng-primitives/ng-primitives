import { ElementRef, FactoryProvider, inject, InjectionToken, Signal, Type } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export interface NgpButtonState {
  disabled: Signal<boolean>;
}

export interface NgpButtonProps {
  disabled: Signal<boolean>;
  element?: ElementRef<HTMLElement>;
}

export function ngpButtonPattern({
  disabled,
  element = injectElementRef(),
}: NgpButtonProps): NgpButtonState {
  const isButton = element.nativeElement.tagName.toLowerCase() === 'button';

  // Setup interactions (hover, press, focus-visible)
  ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

  // Setup host attribute bindings
  dataBinding(element, 'data-disabled', disabled);

  // Add the disabled attribute if it's a button element
  if (isButton) {
    attrBinding(element, 'disabled', () => (disabled() ? '' : null));
  }

  return { disabled };
}

export const NgpButtonPatternToken = new InjectionToken<NgpButtonState>('NgpButtonPatternToken');

export function injectButtonPattern(): NgpButtonState {
  return inject(NgpButtonPatternToken);
}

export function provideButtonPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpButtonState,
): FactoryProvider {
  return { provide: NgpButtonPatternToken, useFactory: () => fn(inject(type)) };
}
