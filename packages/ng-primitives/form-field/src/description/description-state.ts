import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';
import { keepIdRegistered } from '../form-field/keep-id-registered';

/**
 * The state interface for the Description primitive.
 */
export interface NgpDescriptionState {
  /**
   * The id of the description.
   */
  readonly id: Signal<string>;
}

/**
 * The props interface for the Description primitive.
 */
export interface NgpDescriptionProps {
  /**
   * The id of the description.
   */
  readonly id: Signal<string>;
}

export const [
  NgpDescriptionStateToken,
  ngpDescription,
  injectDescriptionState,
  provideDescriptionState,
] = createPrimitive(
  'NgpDescription',
  ({ id = signal(uniqueId('ngp-description')) }: NgpDescriptionProps) => {
    const element = injectElementRef();
    const formField = injectFormFieldState({ optional: true });

    // Host bindings
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-invalid', () => (formField()?.invalid() ? '' : null));
    dataBinding(element, 'data-valid', () => (formField()?.valid() ? '' : null));
    dataBinding(element, 'data-touched', () => (formField()?.touched() ? '' : null));
    dataBinding(element, 'data-pristine', () => (formField()?.pristine() ? '' : null));
    dataBinding(element, 'data-dirty', () => (formField()?.dirty() ? '' : null));
    dataBinding(element, 'data-pending', () => (formField()?.pending() ? '' : null));
    dataBinding(element, 'data-disabled', () => (formField()?.disabled() ? '' : null));

    keepIdRegistered({
      id,
      add: descriptionId => formField()?.addDescription(descriptionId),
      remove: descriptionId => formField()?.removeDescription(descriptionId),
    });

    return { id } satisfies NgpDescriptionState;
  },
);
