import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { controlState } from 'ng-primitives/forms';

@Component({
  selector: 'app-checkbox',
  hostDirectives: [
    {
      directive: NgpCheckbox,
      inputs: [
        'ngpCheckboxChecked:checked',
        'ngpCheckboxIndeterminate:indeterminate',
        'ngpCheckboxDisabled:disabled',
      ],
      outputs: [
        'ngpCheckboxCheckedChange:checkedChange',
        'ngpCheckboxIndeterminateChange:indeterminateChange',
      ],
    },
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: Checkbox, multi: true },
    provideIcons({ heroCheckMini, heroMinusMini }),
  ],
  imports: [NgIcon],
  template: `
    @if (indeterminate()) {
      <ng-icon name="heroMinusMini" />
    } @else if (state.value()) {
      <ng-icon name="heroCheckMini" />
    }
  `,
  styles: `
    :host {
    }

    :host[data-hover] {
    }

    :host[data-checked],
    :host[data-indeterminate] {
    }

    :host[data-focus-visible] {
    }
  `,
  host: {
    '(focusout)': 'state.markAsTouched()',
  },
})
export class Checkbox implements ControlValueAccessor {
  /** Defines whether the checkbox is checked. */
  readonly checked = model<boolean>(false);

  /** Defines whether the checkbox is indeterminate. */
  readonly indeterminate = model<boolean>(false);

  /** Defines whether the checkbox is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * This connects the state of the checkbox to the form control and host directives and keeps them in sync.
   * Use `state.value()` to get the current value of the checkbox and `state.disabled()` to get the current disabled state
   * rather than accessing the inputs directly.
   */
  protected readonly state = controlState({
    value: this.checked,
    disabled: this.disabled,
  });

  writeValue(checked: boolean): void {
    this.state.writeValue(checked);
  }

  registerOnChange(fn: (checked: boolean) => void): void {
    this.state.setOnChangeFn(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.state.setOnTouchedFn(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.state.setDisabled(isDisabled);
  }
}
