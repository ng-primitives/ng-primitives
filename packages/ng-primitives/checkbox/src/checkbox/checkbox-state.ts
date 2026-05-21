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
  emitter,
  listener,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Public state surface for the Checkbox primitive.
 */
export interface NgpCheckboxState {
  /**
   * The id of the checkbox.
   */
  readonly id: Signal<string>;
  /**
   * Whether the checkbox is checked.
   */
  readonly checked: WritableSignal<boolean>;
  /**
   * Whether the checkbox is indeterminate.
   */
  readonly indeterminate: WritableSignal<boolean>;
  /**
   * Whether the checkbox is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Emits when the checked state changes.
   */
  readonly checkedChange: Observable<boolean>;
  /**
   * Emits when the indeterminate state changes.
   */
  readonly indeterminateChange: Observable<boolean>;
  /**
   * Toggle the checkbox value.
   */
  toggle(event?: Event): void;
  /**
   * Update the checked value.
   */
  setChecked(value: boolean, options?: SetterOptions): void;
  /**
   * Set the default checked state.
   */
  setDefaultChecked(value: boolean): void;
  /**
   * Update the indeterminate value.
   */
  setIndeterminate(value: boolean): void;
  /**
   * Set the disabled value.
   */
  setDisabled(value: boolean): void;
}

/**
 * Inputs for configuring the Checkbox primitive.
 */
export interface NgpCheckboxProps {
  /**
   * The id of the checkbox.
   */
  readonly id?: Signal<string>;
  /**
   * Whether the checkbox is checked.
   */
  readonly checked?: Signal<boolean | undefined>;
  /**
   * The default checked state for uncontrolled usage.
   */
  readonly defaultChecked?: Signal<boolean>;
  /**
   * Whether the checkbox is indeterminate.
   */
  readonly indeterminate?: Signal<boolean>;
  /**
   * Whether the checkbox is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the checked state changes.
   */
  readonly onCheckedChange?: (checked: boolean) => void;
  /**
   * Callback fired when the indeterminate state changes.
   */
  readonly onIndeterminateChange?: (indeterminate: boolean) => void;
}

export const [NgpCheckboxStateToken, ngpCheckbox, injectCheckboxState, provideCheckboxState] =
  createPrimitive(
    'NgpCheckbox',
    ({
      id = signal(uniqueId('ngp-checkbox')),
      checked: _checked = signal<boolean | undefined>(undefined),
      defaultChecked: _defaultChecked,
      indeterminate: _indeterminate = signal(false),
      disabled: _disabled = signal(false),
      onCheckedChange,
      onIndeterminateChange,
    }: NgpCheckboxProps): NgpCheckboxState => {
      const element = injectElementRef();
      const defaultChecked = controlled(_defaultChecked, false);
      const [checked, setChecked, checkedChange] = controlledState({
        value: _checked,
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
      });
      const indeterminate = controlled(_indeterminate);
      const disabled = controlled(_disabled);
      const indeterminateChange = emitter<boolean>();
      const tabindex = computed(() => (disabled() ? -1 : 0));

      // Setup interactions and form control hooks
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });
      ngpFormControl({ id, disabled });

      // Host bindings
      attrBinding(element, 'role', 'checkbox');
      attrBinding(element, 'aria-checked', () => (indeterminate() ? 'mixed' : checked()));
      dataBinding(element, 'data-checked', checked);
      dataBinding(element, 'data-indeterminate', indeterminate);
      attrBinding(element, 'aria-disabled', disabled);
      attrBinding(element, 'tabindex', () => tabindex().toString());

      // Event listeners
      listener(element, 'click', event => toggle(event));
      listener(element, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          // According to WAI ARIA, checkboxes don't activate on enter keypress
          event.preventDefault();
          return;
        }

        if (event.key === ' ' || event.key === 'Spacebar') {
          toggle(event);
        }
      });

      function toggle(event?: Event): void {
        if (disabled()) {
          return;
        }

        // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
        event?.preventDefault();

        const nextChecked = indeterminate() ? true : !checked();
        setChecked(nextChecked);

        // if the checkbox was indeterminate, it isn't anymore
        if (indeterminate()) {
          setIndeterminate(false);
        }
      }

      function setIndeterminate(value: boolean): void {
        indeterminate.set(value);
        onIndeterminateChange?.(value);
        indeterminateChange.emit(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      return {
        id,
        checked: deprecatedSetter(checked, 'setChecked', setChecked),
        indeterminate: deprecatedSetter(indeterminate, 'setIndeterminate'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        checkedChange,
        indeterminateChange: indeterminateChange.asObservable(),
        toggle,
        setChecked,
        setDefaultChecked: defaultChecked.set,
        setIndeterminate,
        setDisabled,
      } satisfies NgpCheckboxState;
    },
  );
