import { Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * Public state surface for the Textarea primitive.
 */
export interface NgpTextareaState {
  /**
   * The id of the textarea.
   */
  readonly id: Signal<string>;
  /**
   * Whether the textarea is disabled.
   */
  readonly disabled: WritableSignal<boolean>;

  /**
   * Set the disabled state of the textarea.
   */
  setDisabled(disabled: boolean): void;
}

/**
 * Inputs for configuring the Textarea primitive.
 */
export interface NgpTextareaProps {
  /**
   * The id of the textarea.
   */
  readonly id?: Signal<string>;
  /**
   * Whether the textarea is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [NgpTextareaStateToken, ngpTextarea, injectTextareaState, provideTextareaState] =
  createPrimitive(
    'NgpTextarea',
    ({
      id = signal(uniqueId('ngp-textarea')),
      disabled: _disabled = signal(false),
    }: NgpTextareaProps) => {
      const element = injectElementRef();
      const disabled = controlled(_disabled);

      // Setup interactions and form control bindings
      ngpInteractions({ hover: true, press: true, focus: true, disabled });
      ngpFormControl({ id, disabled });

      // Host bindings
      attrBinding(element, 'id', id);
      attrBinding(element, 'disabled', () => (disabled() ? '' : null));
      dataBinding(element, 'data-disabled', disabled);

      function setDisabled(value: boolean) {
        disabled.set(value);
      }

      return { id, disabled, setDisabled } satisfies NgpTextareaState;
    },
  );
