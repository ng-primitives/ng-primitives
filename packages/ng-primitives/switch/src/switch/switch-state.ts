import { Signal, signal, WritableSignal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  listener,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Public state surface for the Switch primitive.
 */
export interface NgpSwitchState {
  /**
   * The id of the switch.
   */
  readonly id: Signal<string>;
  /**
   * Whether the switch is checked.
   */
  readonly checked: WritableSignal<boolean>;
  /**
   * Whether the switch is disabled (includes form control state).
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Emits when the checked state changes.
   */
  readonly checkedChange: Observable<boolean>;
  /**
   * Toggle the switch state.
   */
  toggle(event?: Event): void;
  /**
   * Update the checked value.
   */
  setChecked(value: boolean): void;
  /**
   * Update the disabled value.
   */
  setDisabled(value: boolean): void;
}

/**
 * Inputs for configuring the Switch primitive.
 */
export interface NgpSwitchProps {
  /**
   * The id of the switch.
   */
  readonly id?: Signal<string>;
  /**
   * Whether the switch is checked.
   */
  readonly checked?: Signal<boolean>;
  /**
   * Whether the switch is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the checked state changes.
   */
  readonly onCheckedChange?: (checked: boolean) => void;
}

export const [NgpSwitchStateToken, ngpSwitch, injectSwitchState, provideSwitchState] =
  createPrimitive(
    'NgpSwitch',
    ({
      id = signal(uniqueId('ngp-switch')),
      checked: _checked = signal(false),
      disabled: _disabled = signal(false),
      onCheckedChange,
    }: NgpSwitchProps): NgpSwitchState => {
      const element = injectElementRef<HTMLElement>();
      const checked = controlled(_checked);
      const disabled = controlled(_disabled);

      // Form control and interactions
      ngpFormControl({ id, disabled });
      ngpButton({ disabled, role: 'switch', type: 'button' });

      const checkedChange = emitter<boolean>();

      // Host bindings
      attrBinding(element, 'id', id);
      attrBinding(element, 'aria-checked', checked);
      dataBinding(element, 'data-checked', checked);

      // Listeners
      listener(element, 'click', () => setChecked(!checked()));

      function setChecked(value: boolean): void {
        checked.set(value);
        onCheckedChange?.(value);
        checkedChange.emit(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      return {
        id,
        checked: deprecatedSetter(checked, 'setChecked'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        checkedChange: checkedChange.asObservable(),
        toggle: () => element.nativeElement.click(),
        setChecked,
        setDisabled,
      } satisfies NgpSwitchState;
    },
  );
