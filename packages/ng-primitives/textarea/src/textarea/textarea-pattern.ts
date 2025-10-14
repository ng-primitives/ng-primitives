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
import { setupFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export interface NgpTextareaState {
  id: Signal<string>;
  disabled: Signal<boolean>;
}

export interface NgpTextareaProps {
  id: Signal<string>;
  disabled: Signal<boolean>;
  element?: ElementRef<HTMLTextAreaElement>;
}

export function ngpTextareaPattern({
  id,
  disabled = signal(false),
  element = injectElementRef<HTMLTextAreaElement>(),
}: NgpTextareaProps): NgpTextareaState {
  // Setup form control
  const formControl = setupFormControl({ id, disabled });

  disabled = computed(() => formControl().disabled ?? disabled());

  // Setup interactions
  ngpInteractions({
    hover: true,
    press: true,
    focus: true,
    disabled,
  });

  // Setup host attribute bindings
  attrBinding(element, 'id', id);
  attrBinding(element, 'disabled', () => (disabled() ? '' : null));
  dataBinding(element, 'data-disabled', () => (disabled() ? '' : null));

  return {
    id,
    disabled,
  };
}

export const NgpTextareaPatternToken = new InjectionToken<NgpTextareaState>(
  'NgpTextareaPatternToken',
);

export function injectTextareaPattern(): NgpTextareaState {
  return inject(NgpTextareaPatternToken);
}

export function provideTextareaPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpTextareaState,
): FactoryProvider {
  return { provide: NgpTextareaPatternToken, useFactory: () => fn(inject(type)) };
}
