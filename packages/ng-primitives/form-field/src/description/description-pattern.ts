import {
  computed,
  effect,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { uniqueId } from '../../../utils/src';
import { injectFormFieldPattern } from '../form-field/form-field-pattern';

/**
 * The state interface for the Description pattern.
 */
export interface NgpDescriptionState {
  // Define state properties and methods
}

/**
 * The props interface for the Description pattern.
 */
export interface NgpDescriptionProps {
  /**
   * The element reference for the description.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
}

/**
 * The Description pattern function.
 */
export function ngpDescriptionPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-description')),
}: NgpDescriptionProps = {}): NgpDescriptionState {
  // Dependency injection
  const formField = injectFormFieldPattern({ optional: true });

  // Constructor logic
  effect(onCleanup => {
    formField?.addDescription(id());
    onCleanup(() => formField?.removeDescription(id()));
  });

  // Host bindings
  attrBinding(element, 'id', id);
  dataBinding(
    element,
    'data-invalid',
    computed(() => formField?.invalid() ?? null),
  );
  dataBinding(
    element,
    'data-valid',
    computed(() => formField?.valid() ?? null),
  );
  dataBinding(
    element,
    'data-touched',
    computed(() => formField?.touched() ?? null),
  );
  dataBinding(
    element,
    'data-pristine',
    computed(() => formField?.pristine() ?? null),
  );
  dataBinding(
    element,
    'data-dirty',
    computed(() => formField?.dirty() ?? null),
  );
  dataBinding(
    element,
    'data-pending',
    computed(() => formField?.pending() ?? null),
  );
  dataBinding(
    element,
    'data-disabled',
    computed(() => formField?.disabled() ?? null),
  );

  return {
    // Return state object
  };
}

/**
 * The injection token for the Description pattern.
 */
export const NgpDescriptionPatternToken = new InjectionToken<NgpDescriptionState>(
  'NgpDescriptionPatternToken',
);

/**
 * Injects the Description pattern.
 */
export function injectDescriptionPattern(): NgpDescriptionState {
  return inject(NgpDescriptionPatternToken);
}

/**
 * Provides the Description pattern.
 */
export function provideDescriptionPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpDescriptionState,
): FactoryProvider {
  return { provide: NgpDescriptionPatternToken, useFactory: () => fn(inject(type)) };
}
