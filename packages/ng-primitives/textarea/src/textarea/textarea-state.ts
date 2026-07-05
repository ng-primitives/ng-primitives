import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive } from 'ng-primitives/state';
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

      // Setup form control bindings first so we can incorporate the form
      // control's disabled status (e.g. a disabled ReactiveForms control).
      const status = ngpFormControl({ id, disabled });
      const isDisabled = computed(() => status().disabled ?? disabled());

      ngpInteractions({ hover: true, press: true, focus: true, disabled: isDisabled });

      // Host bindings. `data-disabled` is bound by `ngpFormControl` using the
      // combined disabled state, so it is not duplicated here.
      attrBinding(element, 'id', id);
      attrBinding(element, 'disabled', () => (isDisabled() ? '' : null));

      function setDisabled(value: boolean) {
        disabled.set(value);
      }

      return { id, disabled, setDisabled } satisfies NgpTextareaState;
    },
  );
