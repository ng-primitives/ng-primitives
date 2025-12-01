import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Subject } from 'rxjs/internal/Subject';

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
  readonly checkedChange: Subject<boolean>;
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
      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';
      const checked = controlled(_checked);
      const disabledInput = controlled(_disabled);

      // Form control and interactions
      const status = ngpFormControl({ id, disabled: disabledInput });
      const disabled = computed(() => status().disabled ?? disabledInput());
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      const checkedChange = new Subject<boolean>();
      const tabindex = computed(() => (disabled() ? -1 : 0));

      // Host bindings
      attrBinding(element, 'role', 'switch');
      attrBinding(element, 'id', id);
      attrBinding(element, 'type', () => (isButton ? 'button' : null));
      attrBinding(element, 'aria-checked', checked);
      dataBinding(element, 'data-checked', checked);
      attrBinding(element, 'aria-disabled', disabled);
      dataBinding(element, 'data-disabled', disabled);
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

      function setChecked(value: boolean): void {
        checked.set(value);
        onCheckedChange?.(value);
        checkedChange.next(value);
      }

      function setDisabled(value: boolean): void {
        disabledInput.set(value);
      }

      return {
        id,
        checked: deprecatedSetter(checked, 'setChecked'),
        disabled: deprecatedSetter(disabledInput, 'setDisabled'),
        checkedChange,
        toggle,
        setChecked,
        setDisabled,
      };
    },
  );
