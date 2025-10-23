import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { ngpAutofillPattern } from 'ng-primitives/autofill';
import { ngpFormControlPattern } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSearchPattern } from 'ng-primitives/search';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export interface NgpInputState {
  id: Signal<string>;
  disabled: Signal<boolean>;
}

export interface NgpInputProps {
  id: Signal<string>;
  disabled: Signal<boolean>;
  element?: ElementRef<HTMLInputElement>;
}

export function ngpInputPattern({
  id,
  disabled = signal(false),
  element = injectElementRef<HTMLInputElement>(),
}: NgpInputProps): NgpInputState {
  // setup the form control
  const formControl = ngpFormControlPattern({ id, disabled });

  // derive the disabled state from the form control if available
  disabled = computed(() => formControl.disabled() ?? false);

  // Setup interactions
  ngpInteractions({
    hover: true,
    press: true,
    focus: true,
    disabled,
  });

  // Monitor autofill state
  ngpAutofillPattern({ element });

  // Register with search if available
  const search = injectSearchPattern({ optional: true });
  search?.registerInput(element.nativeElement);

  // Setup host attribute bindings
  attrBinding(element, 'id', id);
  attrBinding(element, 'disabled', () => (disabled() ? '' : null));
  dataBinding(element, 'data-disabled', () => (disabled() ? '' : null));

  return {
    id,
    disabled,
  };
}

export const NgpInputPatternToken = new InjectionToken<NgpInputState>('NgpInputPatternToken');

export function injectInputPattern(): NgpInputState {
  return inject(NgpInputPatternToken);
}

export function provideInputPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpInputState,
): FactoryProvider {
  return { provide: NgpInputPatternToken, useFactory: () => fn(inject(type)) };
}
