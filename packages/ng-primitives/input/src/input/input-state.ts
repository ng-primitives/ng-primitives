import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSearchState } from 'ng-primitives/search';
import { attrBinding, controlled, createPrimitive } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { ngpAutofill } from 'ng-primitives/autofill';

/**
 * Public state surface for the Input primitive.
 */
export interface NgpInputState {
  /**
   * The id of the input.
   */
  readonly id: Signal<string>;
  /**
   * Whether the input is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
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

    return { id, disabled, status };
  },
);
