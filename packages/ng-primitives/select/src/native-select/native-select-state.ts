import { signal, Signal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, deprecatedSetter } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

export interface NgpNativeSelectState {
  /**
   * Whether the select is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Set the disabled state of the select.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;
}

export interface NgpNativeSelectProps {
  /**
   * The id of the select. If not provided, a unique id will be generated.
   */
  readonly id?: Signal<string>;

  /**
   * Whether the select is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpNativeSelectStateToken,
  ngpNativeSelect,
  injectNativeSelectState,
  provideNativeSelectState,
] = createPrimitive(
  'NgpNativeSelect',
  ({
    disabled: _disabled = signal(false),
    id = signal(uniqueId('ngp-native-select')),
  }: NgpNativeSelectProps) => {
    const element = injectElementRef();
    const disabled = controlled(_disabled);
    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      focus: true,
      focusVisible: true,
      disabled: disabled,
    });
    ngpFormControl({ id: id, disabled: disabled });

    attrBinding(element, 'disabled', disabled);

    function setDisabled(value: boolean): void {
      disabled.set(value);
    }

    return {
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      setDisabled,
    } satisfies NgpNativeSelectState;
  },
);
