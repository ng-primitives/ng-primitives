import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
  SetterOptions,
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
  setChecked(value: boolean, options?: SetterOptions): void;
  /**
   * Set the default checked state used in uncontrolled mode.
   */
  setDefaultChecked(value: boolean): void;
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
   * Whether the switch is checked. When defined the switch is controlled.
   */
  readonly checked?: Signal<boolean | undefined>;
  /**
   * The default checked state for uncontrolled usage.
   */
  readonly defaultChecked?: Signal<boolean>;
  /**
   * Whether the switch is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Whether the switch is required.
   */
  readonly required?: Signal<boolean>;
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
      checked: _checked = signal<boolean | undefined>(undefined),
      defaultChecked: _defaultChecked,
      disabled: _disabled = signal(false),
      required: _required = signal(false),
      onCheckedChange,
    }: NgpSwitchProps): NgpSwitchState => {
      const element = injectElementRef<HTMLElement>();
      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';
      const defaultChecked = controlled(_defaultChecked, false);
      const [checked, setChecked, checkedChange] = controlledState({
        value: _checked,
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
      });
      const disabledInput = controlled(_disabled);

      // Form control and interactions
      const status = ngpFormControl({ id, disabled: disabledInput });
      const disabled = computed(() => status().disabled ?? disabledInput());
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      const tabindex = computed(() => (disabled() ? -1 : 0));

      // Host bindings
      attrBinding(element, 'role', 'switch');
      attrBinding(element, 'id', id);
      attrBinding(element, 'type', () => (isButton ? 'button' : null));
      attrBinding(element, 'aria-checked', checked);
      dataBinding(element, 'data-checked', checked);
      attrBinding(element, 'aria-disabled', disabled);
      dataBinding(element, 'data-disabled', disabled);
      attrBinding(element, 'aria-required', () => (_required() ? 'true' : null));
      attrBinding(element, 'disabled', () => (isButton && disabled() ? '' : null));
      attrBinding(element, 'tabindex', tabindex);

      // Listeners
      listener(element, 'click', event => toggle(event));
      listener(element, 'keydown', (event: KeyboardEvent) => {
        if (event.key === ' ' || event.key === 'Space') {
          event.preventDefault();
          if (!isButton) {
            toggle(event);
          }
        }
      });

      function toggle(event?: Event): void {
        if (disabled()) {
          return;
        }

        event?.preventDefault?.();
        setChecked(!checked());
      }

      function setDisabled(value: boolean): void {
        disabledInput.set(value);
      }

      return {
        id,
        checked: deprecatedSetter(checked, 'setChecked', setChecked),
        disabled: deprecatedSetter(disabledInput, 'setDisabled'),
        checkedChange,
        toggle,
        setChecked,
        setDefaultChecked: defaultChecked.set,
        setDisabled,
      } satisfies NgpSwitchState;
    },
  );
