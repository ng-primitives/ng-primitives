import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  emitter,
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
}

export interface NgpMenuItemCheckboxProps {
  /**
   * Whether the checkbox is checked.
   */
  readonly checked?: Signal<boolean>;

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
    checked: _checked = signal(false),
    disabled = signal(false),
    onCheckedChange,
  }: NgpMenuItemCheckboxProps): NgpMenuItemCheckboxState => {
    const element = injectElementRef();
    const checked = controlled(_checked);
    const checkedChange = emitter<boolean>();

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

      const nextChecked = !checked();
      checked.set(nextChecked);
      onCheckedChange?.(nextChecked);
      checkedChange.emit(nextChecked);
    }

    return {
      checked,
      checkedChange: checkedChange.asObservable(),
      toggle,
    } satisfies NgpMenuItemCheckboxState;
  },
);
