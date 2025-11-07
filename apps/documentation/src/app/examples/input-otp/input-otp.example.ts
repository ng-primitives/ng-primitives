import { Component, signal } from '@angular/core';
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';

@Component({
  selector: 'app-input-otp',
  imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
  template: `
    <div
      [(value)]="value"
      [maxLength]="6"
      (complete)="onComplete($event)"
      pattern="[0-9]"
      inputMode="numeric"
      ngpInputOtp
    >
      <input ngpInputOtpInput />

      <div class="slot-container">
        <div class="slot" *ngpInputOtpSlot="let slot">
          <span class="slot-content">
            {{ slot.char }}
          </span>
          <div class="slot-caret" [class.active]="slot.hasFakeCaret"></div>
        </div>
      </div>
    </div>

    <div class="status">
      <p>Value: {{ value() || 'Empty' }}</p>
      @if (isComplete()) {
        <p class="complete">OTP Complete! ✅</p>
      }
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

    .status {
      margin-top: 1rem;
      text-align: center;
    }

    .status p {
      margin: 0.25rem 0;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }

    .complete {
      color: var(--ngp-text-success) !important;
      font-weight: 600;
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
  readonly isComplete = signal<boolean>(false);

  protected onComplete(value: string): void {
    this.isComplete.set(true);
    console.log('OTP Complete:', value);

    setTimeout(() => this.isComplete.set(false), 3000);
  }
}
