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

    // The id this description has registered: it may be destroyed before a changed id is seen,
    // and then `id()` is not the registration to undo.
    let registeredId: string | undefined;

    function registerDescription(): void {
      registeredId = id();
      formField()?.addDescription(registeredId);
    }

    function unregisterDescription(): void {
      if (registeredId === undefined) {
        return;
      }
      formField()?.removeDescription(registeredId);
      registeredId = undefined;
    }

    onChange(id, () => {
      unregisterDescription();
      registerDescription();
    });

    onDestroy(unregisterDescription);

    return { id } satisfies NgpDescriptionState;
  },
);
