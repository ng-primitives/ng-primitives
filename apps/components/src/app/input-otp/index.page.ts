import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtp } from './input-otp';

@Component({
  selector: 'app-input-otp-example',
  imports: [InputOtp, FormsModule],
  template: `
    <div class="container">
      <h2>OTP Input Examples</h2>

      <div class="example">
        <h3>Basic OTP (6 digits)</h3>
        <app-input-otp
          [(ngModel)]="basicOtp"
          [maxLength]="6"
          pattern="[0-9]"
          inputMode="numeric"
          placeholder="------"
          (complete)="onBasicComplete($event)"
          aria-label="Enter 6-digit OTP" />
        <p class="value">Value: {{ basicOtp() || 'Empty' }}</p>
        @if (basicCompleted()) {
          <p class="complete">✅ OTP Complete!</p>
        }
      </div>

      <div class="example">
        <h3>Alphanumeric OTP (4 characters)</h3>
        <app-input-otp
          [(ngModel)]="alphaOtp"
          [maxLength]="4"
          pattern="[A-Z0-9]"
          inputMode="text"
          placeholder="____"
          textAlign="center"
          (complete)="onAlphaComplete($event)"
          aria-label="Enter 4-character code" />
        <p class="value">Value: {{ alphaOtp() || 'Empty' }}</p>
        @if (alphaCompleted()) {
          <p class="complete">✅ Code Complete!</p>
        }
      </div>

      <div class="example">
        <h3>Disabled State</h3>
        <app-input-otp
          [ngModel]="disabledValue"
          [maxLength]="5"
          [disabled]="true"
          placeholder="-----"
          aria-label="Disabled OTP input" />
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .example {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border: 1px solid var(--ngp-border);
      border-radius: 8px;
      background: var(--ngp-background);
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--ngp-text-primary);
    }

    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--ngp-text-primary);
      font-size: 1.125rem;
    }

    .value {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      text-align: center;
    }

    .complete {
      margin: 0.5rem 0 0 0;
      color: var(--ngp-text-success);
      font-weight: 600;
      text-align: center;
    }
  `,
})
export default class App {
  readonly basicOtp = signal<string>('');
  readonly alphaOtp = signal<string>('');
  readonly disabledValue = '12345';

  readonly basicCompleted = signal<boolean>(false);
  readonly alphaCompleted = signal<boolean>(false);

  protected onBasicComplete(value: string): void {
    this.basicCompleted.set(true);
    console.log('Basic OTP Complete:', value);

    setTimeout(() => {
      this.basicCompleted.set(false);
    }, 3000);
  }

  protected onAlphaComplete(value: string): void {
    this.alphaCompleted.set(true);
    console.log('Alpha OTP Complete:', value);

    setTimeout(() => {
      this.alphaCompleted.set(false);
    }, 3000);
  }
}
