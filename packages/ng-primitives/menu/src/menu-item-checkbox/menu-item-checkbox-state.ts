import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { ngpMenuItem } from '../menu-item/menu-item-state';

export interface NgpMenuItemCheckboxState {
  /**
   * Whether the checkbox is checked.
   */
  readonly checked: Signal<boolean>;

  /**
   * Emits when the checked state changes.
   */
  readonly checkedChange: Observable<boolean>;

  /**
   * Toggle the checkbox value.
   */
  toggle(): void;

  /**
   * Set the default checked state used in uncontrolled mode.
   */
  setDefaultChecked(value: boolean): void;
}

export interface NgpMenuItemCheckboxProps {
  /**
   * Whether the checkbox is checked. When defined the checkbox is controlled.
   */
  readonly checked?: Signal<boolean | undefined>;

  /**
   * The default checked state for uncontrolled usage.
   */
  readonly defaultChecked?: Signal<boolean>;

  /**
   * Whether the checkbox is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Callback fired when the checked state changes.
   */
  readonly onCheckedChange?: (checked: boolean) => void;
}

export const [
  NgpMenuItemCheckboxStateToken,
  ngpMenuItemCheckbox,
  injectMenuItemCheckboxState,
  provideMenuItemCheckboxState,
] = createPrimitive(
  'NgpMenuItemCheckbox',
  ({
    checked: _checked = signal<boolean | undefined>(undefined),
    defaultChecked: _defaultChecked,
    disabled = signal(false),
    onCheckedChange,
  }: NgpMenuItemCheckboxProps): NgpMenuItemCheckboxState => {
    const element = injectElementRef();
    const defaultChecked = controlled(_defaultChecked, false);
    const [checked, setChecked, checkedChange] = controlledState({
      value: _checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });

    // Use base menu item behavior but don't close on select
    ngpMenuItem({ disabled, closeOnSelect: signal(false), role: 'menuitemcheckbox' });

    // Host bindings
    attrBinding(element, 'aria-checked', checked);
    dataBinding(element, 'data-checked', checked);

    // Toggle on click
    listener(element, 'click', () => toggle());

    function toggle(): void {
      if (disabled()) {
        return;
      }

      setChecked(!checked());
    }

    return {
      checked,
      checkedChange,
      toggle,
      setDefaultChecked: defaultChecked.set,
    } satisfies NgpMenuItemCheckboxState;
  },
);
