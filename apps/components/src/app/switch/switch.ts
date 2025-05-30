import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectSwitchState, NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-switch',
  hostDirectives: [
    {
      directive: NgpSwitch,
      inputs: ['ngpSwitchChecked:checked', 'ngpSwitchDisabled:disabled'],
      outputs: ['ngpSwitchCheckedChange:checkedChange'],
    },
  ],
  imports: [NgpSwitchThumb],
  template: `
    <span ngpSwitchThumb></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      width: 2.5rem;
      height: 1.5rem;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
      border: 1px solid var(--ngp-border);
      padding: 0;
      outline: none;
      transition-property:
        color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      box-sizing: border-box;
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    :host[data-checked] {
      background-color: var(--ngp-background-blue);
      border-color: var(--ngp-border-blue);
    }

    [ngpSwitchThumb] {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 999px;
      background-color: white;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(1px);
      box-sizing: border-box;
    }

    [ngpSwitchThumb][data-checked] {
      transform: translateX(17px);
    }
  `,
  providers: [provideValueAccessor(Switch)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Switch implements OnInit, ControlValueAccessor {
  /** Access the switch state. */
  private readonly switch = injectSwitchState();

  /** The on change callback */
  private onChange?: ChangeFn<boolean>;

  /** The on touched callback */
  protected onTouched?: TouchedFn;

  ngOnInit() {
    // Any time the switch changes, update the form value.
    this.switch().checkedChange.subscribe(value => this.onChange?.(value));
  }

  /** Write a new value to the switch. */
  writeValue(value: boolean): void {
    this.switch().checked.set(value);
  }

  /** Register a callback function to be called when the value changes. */
  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }

  /** Register a callback function to be called when the switch is touched. */
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  /** Set the disabled state of the switch. */
  setDisabledState(isDisabled: boolean): void {
    this.switch().disabled.set(isDisabled);
  }
}
