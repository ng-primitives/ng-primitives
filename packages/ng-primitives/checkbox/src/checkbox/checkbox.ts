import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, output } from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { checkboxState, provideCheckboxState } from './checkbox-state';

@Directive({
  selector: '[ngpCheckbox]',
  providers: [provideCheckboxState(), { provide: NgpDisabledToken, useExisting: NgpCheckbox }],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocusVisible, NgpPress],
  host: {
    role: 'checkbox',
    '[attr.aria-checked]': 'state.indeterminate() ? "mixed" : state.checked()',
    '[attr.data-checked]': 'state.checked() ? "" : null',
    '[attr.data-indeterminate]': 'state.indeterminate() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[tabindex]': 'state.disabled() ? -1 : 0',
  },
})
export class NgpCheckbox implements NgpCanDisable {
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

    this.state.checked.set(this.state.indeterminate() ? true : !this.state.checked());
    this.checkedChange.emit(this.state.checked());

    // if the checkbox was indeterminate, it isn't anymore
    if (this.state.indeterminate()) {
      this.state.indeterminate.set(false);
      this.indeterminateChange.emit(false);
    }
  }
}
