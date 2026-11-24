import { Signal, computed, signal } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { onBooleanChange } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';

/**
 * The state interface for the Error primitive.
 */
export interface NgpErrorState {
  /**
   * The id of the error message.
   */
  readonly id: Signal<string>;
  /**
   * Determine if there is an error message.
   */
  readonly hasError: Signal<boolean>;
  /**
   * Determine whether the validator associated with this error is failing.
   */
  readonly state: Signal<'fail' | 'pass'>;
}

/**
 * The props interface for the Error primitive.
 */
export interface NgpErrorProps {
  /**
   * The id of the error message.
   */
  readonly id: Signal<string>;
  /**
   * The validator associated with the error message.
   */
  readonly validator?: Signal<string | null>;
}

export const [NgpErrorStateToken, ngpError, injectErrorState, provideErrorState] = createPrimitive(
  'NgpError',
  ({ id, validator = signal(null) }: NgpErrorProps) => {
    const element = injectElementRef();
    const formField = injectFormFieldState({ optional: true });

    // Determine if there is an error message
    const hasError = computed(() => {
      const errors = formField()?.errors() ?? [];
      const validatorValue = validator();

      return validatorValue ? errors?.includes(validatorValue) : errors?.length > 0;
    });

    // Determine whether the validator associated with this error is failing
    const state = computed(() => (hasError() ? 'fail' : 'pass'));

    // Host bindings
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-invalid', () => (formField()?.invalid() ? '' : null));
    dataBinding(element, 'data-valid', () => (formField()?.valid() ? '' : null));
    dataBinding(element, 'data-touched', () => (formField()?.touched() ? '' : null));
    dataBinding(element, 'data-pristine', () => (formField()?.pristine() ? '' : null));
    dataBinding(element, 'data-dirty', () => (formField()?.dirty() ? '' : null));
    dataBinding(element, 'data-pending', () => (formField()?.pending() ? '' : null));
    dataBinding(element, 'data-disabled', () => (formField()?.disabled() ? '' : null));
    dataBinding(element, 'data-validator', state);

    // The id this error has registered, if any: by the time it is destroyed `hasError()` may
    // already be false, so only this says whether there is a registration to undo.
    let registeredId: string | undefined;

    function registerError(): void {
      registeredId = id();
      formField()?.addDescription(registeredId);
    }

    function unregisterError(): void {
      if (registeredId === undefined) {
        return;
      }
      formField()?.removeDescription(registeredId);
      registeredId = undefined;
    }

    // Update error registration when hasError changes
    onBooleanChange(hasError, registerError, unregisterError);

    function updateIdRegistration(): void {
      unregisterError();
      if (hasError()) {
        registerError();
      }
    }

    // Watch for id changes to update registration
    explicitEffect([id], updateIdRegistration);

    onDestroy(unregisterError);

    return {
      id,
      hasError,
      state,
    } satisfies NgpErrorState;
  },
);
