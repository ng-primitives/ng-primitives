import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';

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

    // Register with form field and cleanup on destroy
    formField()?.addDescription(id());
    onDestroy(() => formField()?.removeDescription(id()));

    onChange(id, (newId, oldId) => {
      if (oldId) {
        formField()?.removeDescription(oldId);
      }
      formField()?.addDescription(newId);
    });

    return { id } satisfies NgpDescriptionState;
  },
);
