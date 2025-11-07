import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  injectInputOtpState,
  NgpInputOtp,
  NgpInputOtpInput,
  NgpInputOtpSlot,
} from 'ng-primitives/input-otp';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-input-otp',
  hostDirectives: [
    {
      directive: NgpInputOtp,
      inputs: [
        'maxLength',
        'pattern',
        'placeholder',
        'textAlign',
        'inputMode',
        'pasteTransformer',
        'disabled',
      ],
      outputs: ['valueChange', 'complete'],
    },
  ],
  imports: [NgpInputOtpInput, NgpInputOtpSlot],
  template: `
    <input ngpInputOtpInput />

    <div class="slot-container">
      <div
        class="slot"
        *ngpInputOtpSlot="let slot"
        [attr.data-active]="slot.isActive || null"
        [attr.data-filled]="slot.isFilled || null"
        [attr.data-caret]="slot.hasFakeCaret || null"
      >
        <span class="slot-content">
          {{ slot.char || slot.placeholderChar }}
        </span>
        <div class="slot-caret" [class.active]="slot.hasFakeCaret"></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    .slot-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .slot {
      position: relative;
      width: 3rem;
      height: 3rem;
      border: 2px solid var(--ngp-border);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--ngp-background);
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .slot:hover {
      border-color: var(--ngp-border-hover);
    }

    .slot[data-active] {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }

    .slot[data-filled] {
      border-color: var(--ngp-border-success);
    }

    .slot-content {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ngp-text-primary);
      z-index: 2;
    }

    .slot-content:empty::before {
      content: attr(data-placeholder);
      color: var(--ngp-text-placeholder);
    }

    .slot-caret {
      position: absolute;
      width: 1px;
      height: 1.5rem;
      background-color: var(--ngp-focus-ring);
      opacity: 0;
    }

    .slot-caret.active {
      opacity: 1;
      animation: blink 1s infinite;
    }

    .slot[data-caret] .slot-caret {
      opacity: 1;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%,
      50% {
        opacity: 1;
      }
      51%,
      100% {
        opacity: 0;
      }
    }
  `,
  providers: [provideValueAccessor(InputOtp)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class InputOtp implements ControlValueAccessor {
  /** Access the input-otp state. */
  private readonly inputOtp = injectInputOtpState();

  /** The on change callback */
  private onChange?: ChangeFn<string>;

  /** The on touched callback */
  protected onTouched?: TouchedFn;

  constructor() {
    // Any time the input-otp value changes, update the form value.
    this.inputOtp().valueChange.subscribe(value => this.onChange?.(value));
  }

  /** Write a new value to the input-otp. */
  writeValue(value: string): void {
    this.inputOtp().value.set(value || '');
  }

  /** Register a callback function to be called when the value changes. */
  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  /** Register a callback function to be called when the input-otp is touched. */
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  /** Set the disabled state of the input-otp. */
  setDisabledState(isDisabled: boolean): void {
    this.inputOtp().disabled.set(isDisabled);
  }
}
