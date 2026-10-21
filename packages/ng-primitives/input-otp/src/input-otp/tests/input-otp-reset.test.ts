import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';
import { describe, expect, it } from 'vitest';

/** Mirrors every value change back into the binding, as a forms adapter would. */
@Component({
  selector: 'app-otp',
  imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
  template: `
    <div [ngpInputOtpValue]="value()" (ngpInputOtpValueChange)="value.set($event)" ngpInputOtp>
      <input ngpInputOtpInput data-testid="input" />
      @for (slot of [0, 1, 2]; track slot) {
        <div [attr.data-testid]="'slot-' + slot" ngpInputOtpSlot></div>
      }
    </div>
  `,
})
class Otp {
  readonly value = signal('');
}

describe('NgpInputOtp reset', () => {
  it('should start from an empty input after a typed code is cleared through the binding', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(`<app-otp />`, { imports: [Otp] });
    const otp = fixture.debugElement.children[0].componentInstance as Otp;
    const input = screen.getByTestId('input') as HTMLInputElement;

    await user.click(input);
    await user.keyboard('123');
    expect(otp.value()).toBe('123');

    otp.value.set('');
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(screen.getByTestId('slot-0')).not.toHaveAttribute('data-filled');

    await user.keyboard('4');

    expect(otp.value()).toBe('4');
    expect(screen.getByTestId('slot-0')).toHaveTextContent('4');
    expect(screen.getByTestId('slot-1')).not.toHaveAttribute('data-filled');
  });
});
