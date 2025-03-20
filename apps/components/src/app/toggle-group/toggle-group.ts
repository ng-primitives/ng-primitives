import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectToggleGroupState, NgpToggleGroup } from 'ng-primitives/toggle-group';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-toggle-group',
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      inputs: [
        'ngpToggleGroupOrientation:orientation',
        'ngpToggleGroupType:type',
        'ngpToggleGroupValue:value',
        'ngpToggleGroupDisabled:disabled',
      ],
      outputs: ['ngpToggleGroupValueChange:valueChange'],
    },
  ],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: inline-flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
      padding: 0.25rem;
    }
  `,
  providers: [provideValueAccessor(ToggleGroup)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class ToggleGroup implements ControlValueAccessor {
  /** Access the toggle state. */
  private readonly toggleGroup = injectToggleGroupState();

  /** The on change callback */
  private onChange?: ChangeFn<string[]>;

  /** The on touched callback */
  protected onTouched?: TouchedFn;

  constructor() {
    // Any time the toggle group changes, update the form value.
    this.toggleGroup.valueChange.subscribe(value => this.onChange?.(value));
  }

  /** Write a new value to the toggle group. */
  writeValue(value: string[]): void {
    this.toggleGroup.value.set(value);
  }

  /** Register a callback function to be called when the value changes. */
  registerOnChange(fn: ChangeFn<string[]>): void {
    this.onChange = fn;
  }

  /** Register a callback function to be called when the toggle group is touched. */
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  /** Set the disabled state of the toggle group. */
  setDisabledState(isDisabled: boolean): void {
    this.toggleGroup.disabled.set(isDisabled);
  }
}
