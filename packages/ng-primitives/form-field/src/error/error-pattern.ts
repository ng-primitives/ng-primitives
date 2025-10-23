import {
  computed,
  DestroyRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { onBooleanChange, uniqueId } from 'ng-primitives/utils';
import { injectFormFieldPattern } from '../form-field/form-field-pattern';

/**
 * The state interface for the Error pattern.
 */
export interface NgpErrorState {
  // Define state properties and methods
}

/**
 * The props interface for the Error pattern.
 */
export interface NgpErrorProps {
  /**
   * The element reference for the error.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
  /**
   * Validator signal input.
   */
  readonly validator?: Signal<string | null>;
}

/**
 * The Error pattern function.
 */
export function ngpErrorPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-error')),
  validator = signal(null),
}: NgpErrorProps = {}): NgpErrorState {
  // Dependency injection
  const formField = injectFormFieldPattern({ optional: true });
  const destroyRef = inject(DestroyRef);

  // Properties and computed values
  const hasError = computed(() => {
    const errors = formField?.errors() ?? [];
    const v = validator();

    return v ? errors?.includes(v) : errors?.length > 0;
  });
  const state = computed(() => (hasError() ? 'fail' : 'pass'));

  // Constructor logic
  // add or remove the error message when the error state changes
  onBooleanChange(
    hasError,
    () => formField?.addDescription(id()),
    () => formField?.removeDescription(id()),
  );

  let lastId: string | null = null;

  explicitEffect([id], ([id]) => {
    formField?.removeDescription(lastId!);
    if (hasError()) {
      formField?.addDescription(id);
    }
    lastId = id;
  });

  // Host bindings
  attrBinding(element, 'id', id);
  dataBinding(
    element,
    'data-invalid',
    computed(() => formField?.invalid() ?? false),
  );
  dataBinding(
    element,
    'data-valid',
    computed(() => formField?.valid() ?? false),
  );
  dataBinding(
    element,
    'data-touched',
    computed(() => formField?.touched() ?? false),
  );
  dataBinding(
    element,
    'data-pristine',
    computed(() => formField?.pristine() ?? false),
  );
  dataBinding(
    element,
    'data-dirty',
    computed(() => formField?.dirty() ?? false),
  );
  dataBinding(
    element,
    'data-pending',
    computed(() => formField?.pending() ?? false),
  );
  dataBinding(
    element,
    'data-disabled',
    computed(() => formField?.disabled() ?? false),
  );
  dataBinding(element, 'data-validator', state);

  // Lifecycle cleanup
  destroyRef.onDestroy(() => {
    formField?.removeDescription(id());
  });

  return {
    // Return state object
  };
}

/**
 * The injection token for the Error pattern.
 */
export const NgpErrorPatternToken = new InjectionToken<NgpErrorState>('NgpErrorPatternToken');

/**
 * Injects the Error pattern.
 */
export function injectErrorPattern(): NgpErrorState {
  return inject(NgpErrorPatternToken);
}

/**
 * Provides the Error pattern.
 */
export function provideErrorPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpErrorState,
): FactoryProvider {
  return { provide: NgpErrorPatternToken, useFactory: () => fn(inject(type)) };
}
