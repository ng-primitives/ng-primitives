import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { injectCheckboxState, NgpCheckbox } from 'ng-primitives/checkbox';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

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
  providers: [provideValueAccessor(Checkbox), provideIcons({ heroCheckMini, heroMinusMini })],
  imports: [NgIcon],
  template: `
    @if (state().indeterminate()) {
      <ng-icon name="heroMinusMini" />
    } @else if (state().checked()) {
      <ng-icon name="heroCheckMini" />
    }
  `,
  styles: `
    :host {
      display: flex;
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: 1px solid var(--ngp-border);
      background-color: transparent;
      padding: 0;
      outline: none;
      flex: none;
      color: var(--ngp-text-inverse);
      font-size: 0.75rem;
    }

    :host[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    :host[data-checked],
    :host[data-indeterminate] {
      border-color: var(--ngp-background-inverse);
      background-color: var(--ngp-background-inverse);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }
  `,
  host: {
    '(focusout)': 'onTouchedFn?.()',
  },
})
export class Checkbox implements ControlValueAccessor {
  /**
   * The checked state of the checkbox.
   */
  protected readonly state = injectCheckboxState();

  /**
   * The onChange function for the checkbox.
   */
  protected onChangeFn?: ChangeFn<boolean>;

  /**
   * The onTouched function for the checkbox.
   */
  protected onTouchedFn?: TouchedFn;

  constructor() {
    // Whenever the user interacts with the checkbox, call the onChange function with the new value.
    this.state().checkedChange.subscribe(checked => this.onChangeFn?.(checked));
  }

  writeValue(checked: boolean): void {
    this.state().checked.set(checked);
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
  }
}
