import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, output } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { setupInteractions } from 'ng-primitives/interactions';
import { uniqueId } from 'ng-primitives/utils';
import { checkboxState, provideCheckboxState } from './checkbox-state';

/**
 * Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.
 */
@Directive({
  selector: '[ngpCheckbox]',
  providers: [provideCheckboxState()],
  host: {
    role: 'checkbox',
    '[attr.aria-checked]': 'state.indeterminate() ? "mixed" : state.checked()',
    '[attr.data-checked]': 'state.checked() ? "" : null',
    '[attr.data-indeterminate]': 'state.indeterminate() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[tabindex]': 'state.disabled() ? -1 : 0',
  },
})
export class NgpCheckbox {
  /**
   * The id of the checkbox.
   * @internal
   */
  readonly id = input(uniqueId('ngp-checkbox'));

  /**
   * Defines whether the checkbox is checked.
   */
  readonly checked = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxChecked',
    transform: booleanAttribute,
  });

  /**
   * The event that is emitted when the checkbox value changes.
   */
  readonly checkedChange = output<boolean>({
    alias: 'ngpCheckboxCheckedChange',
  });

  /**
   * Defines whether the checkbox is indeterminate.
   */
  readonly indeterminate = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxIndeterminate',
    transform: booleanAttribute,
  });

  /**
   * The event that is emitted when the indeterminate value changes.
   */
  readonly indeterminateChange = output<boolean>({
    alias: 'ngpCheckboxIndeterminateChange',
  });

  /**
   * Whether the checkbox is required.
   */
  readonly required = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxRequired',
    transform: booleanAttribute,
  });

  /**
   * Defines whether the checkbox is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the checkbox.
   */
  protected readonly state = checkboxState<NgpCheckbox>(this);

  constructor() {
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
    setupInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled: this.state.disabled,
    });
  }

  @HostListener('keydown.enter', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  @HostListener('keydown.space', ['$event'])
  toggle(event?: Event): void {
    if (this.state.disabled()) {
      return;
    }

    // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
    event?.preventDefault();

    const checked = this.state.indeterminate() ? true : !this.state.checked();
    this.state.checked.set(checked);
    this.checkedChange.emit(checked);

    // if the checkbox was indeterminate, it isn't anymore
    if (this.state.indeterminate()) {
      this.state.indeterminate.set(false);
      this.indeterminateChange.emit(false);
    }
  }
}
