import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpAutofill } from 'ng-primitives/autofill';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSearchState } from 'ng-primitives/search';
import { attrBinding, controlled, createPrimitive, deprecatedSetter } from 'ng-primitives/state';
import { NgpControlStatus, uniqueId } from 'ng-primitives/utils';

/**
 * Public state surface for the Input primitive.
 */
export interface NgpInputState {
  /**
   * The id of the input.
   */
  readonly id: Signal<string>;

  /**
   * The form control state.
   */
  readonly status: Signal<NgpControlStatus>;

  /**
   * Whether the input is disabled.
   */
  readonly disabled: WritableSignal<boolean>;

  /**
   * Set the disabled state of the input.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;
}

/**
 * Inputs for configuring the Input primitive.
 */
export interface NgpInputProps {
  /**
   * The id of the input.
   */
  readonly id?: Signal<string>;
  /**
   * Whether the input is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [NgpInputStateToken, ngpInput, injectInputState, provideInputState] = createPrimitive(
  'NgpInput',
  ({ id = signal(uniqueId('ngp-input')), disabled: _disabled = signal(false) }: NgpInputProps) => {
    const element = injectElementRef<HTMLInputElement>();
    const searchState = injectSearchState({ optional: true });
    const disabled = controlled(_disabled);

    // Setup autofill detection
    ngpAutofill({});

    // Setup interactions and form control bindings
    const status = ngpFormControl({ id, disabled });
    const isDisabled = computed(() => status().disabled ?? disabled());

    ngpInteractions({ hover: true, press: true, focus: true, disabled: isDisabled });

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'disabled', () => (isDisabled() ? '' : null));

    // Register the input with an enclosing search field if present
    const search = searchState();

    if (search) {
      search.registerInput(element.nativeElement);
    }

    function setDisabled(value: boolean): void {
      disabled.set(value);
    }

    return {
      id,
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      status,
      setDisabled,
    } satisfies NgpInputState;
  },
);
