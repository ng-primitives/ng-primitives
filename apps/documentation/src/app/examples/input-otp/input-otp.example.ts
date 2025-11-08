import { Component, signal } from '@angular/core';
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';

@Component({
  selector: 'app-input-otp',
  imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
  template: `
    <div [(ngpInputOtpValue)]="value" (ngpInputOtpComplete)="onComplete($event)" ngpInputOtp>
      <input ngpInputOtpInput />

      <div class="slots">
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
        <div ngpInputOtpSlot>
          <div class="caret"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpInputOtp] {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      position: relative;
    }

    .slots {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    [ngpInputOtpSlot] {
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
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ngp-text-primary);
    }

    [ngpInputOtp][data-disabled] [ngpInputOtpSlot] {
      cursor: default;
      opacity: 0.5;
    }

    [ngpInputOtpSlot]:hover {
      border-color: var(--ngp-border-hover);
    }

    [ngpInputOtpSlot][data-active] {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }

    [ngpInputOtpSlot][data-placeholder] {
      color: var(--ngp-text-placeholder);
    }

    .caret {
      position: absolute;
      width: 1px;
      height: 1.5rem;
      background-color: var(--ngp-focus-ring);
      opacity: 0;
    }

    [ngpInputOtpSlot][data-caret] .caret {
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
})
export default class InputOtpExample {
  readonly value = signal<string>('');

  protected onComplete(value: string): void {
    console.log('OTP Complete:', value);
  }
}
