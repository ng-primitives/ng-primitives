import { NumberInput } from '@angular/cdk/coercion';
import {
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';
import { ChangeFn, TouchedFn } from 'ng-primitives/utils';

/**
 * Inline fixture mirroring the real reusable component at
 * `apps/components/src/app/pages/reusable-components/input-otp/input-otp.ts`.
 * Used by the reusable-component and forms test suites.
 */
@Component({
  selector: 'app-input-otp',
  imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOtpFixture),
      multi: true,
    },
  ],
  template: `
    <div
      [ngpInputOtpValue]="value()"
      [ngpInputOtpDisabled]="disabled() || formDisabled()"
      [ngpInputOtpPattern]="pattern()"
      [ngpInputOtpPlaceholder]="placeholder()"
      [ngpInputOtpInputMode]="inputMode()"
      (ngpInputOtpValueChange)="onValueChange($event)"
      (ngpInputOtpComplete)="onComplete()"
      ngpInputOtp
    >
      <input [attr.aria-label]="ariaLabel()" data-testid="hidden-input" ngpInputOtpInput />
      <div class="slots">
        @for (_ of slots(); track $index) {
          <div class="slot" [attr.data-testid]="'slot-' + $index" ngpInputOtpSlot></div>
        }
      </div>
    </div>
  `,
})
export class InputOtpFixture implements ControlValueAccessor {
  readonly length = input<number, NumberInput>(6, {
    transform: numberAttribute,
  });

  readonly disabled = input<boolean>(false);

  readonly pattern = input('[0-9]');

  readonly placeholder = input('');

  readonly ariaLabel = input('');

  readonly inputMode = input<'numeric' | 'text' | 'decimal' | 'tel' | 'search' | 'email' | 'url'>(
    'numeric',
  );

  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  readonly value = model<string>('');

  private onChange: ChangeFn<string> = () => {};
  private onTouched: TouchedFn = () => {};

  protected readonly formDisabled = signal(false);

  onValueChange(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  onComplete(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    // mirrors the real reusable component; the primitive coerces null/undefined to ''
    this.value.set(value);
  }

  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
