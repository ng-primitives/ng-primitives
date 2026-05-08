import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, emitter } from 'ng-primitives/state';
import { Observable } from 'rxjs';

export interface NgpMenuItemRadioGroupState {
  /**
   * The current value of the radio group.
   */
  readonly value: Signal<string | null>;

  /**
   * Emits when the value changes.
   */
  readonly valueChange: Observable<string>;

  /**
   * Select a radio item by value.
   */
  select(value: string): void;
}

export interface NgpMenuItemRadioGroupProps {
  /**
   * The current value of the radio group.
   */
  readonly value?: Signal<string | null>;

  /**
   * Callback fired when the value changes.
   */
  readonly onValueChange?: (value: string) => void;
}

export const [
  NgpMenuItemRadioGroupStateToken,
  ngpMenuItemRadioGroup,
  injectMenuItemRadioGroupState,
  provideMenuItemRadioGroupState,
] = createPrimitive(
  'NgpMenuItemRadioGroup',
  ({
    value: _value = signal(null),
    onValueChange,
  }: NgpMenuItemRadioGroupProps): NgpMenuItemRadioGroupState => {
    const element = injectElementRef();
    const value = controlled(_value);
    const valueChange = emitter<string>();

    // Host bindings
    attrBinding(element, 'role', 'group');

    function select(newValue: string): void {
      if (value() === newValue) {
        return;
      }

      value.set(newValue);
      onValueChange?.(newValue);
      valueChange.emit(newValue);
    }

    return {
      value,
      valueChange: valueChange.asObservable(),
      select,
    } satisfies NgpMenuItemRadioGroupState;
  },
);
