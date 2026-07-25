import { Component, signal } from '@angular/core';
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';

@Component({
  selector: 'app-input-otp',
  imports: [NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot],
  template: `
    <div
      class="group relative flex flex-col items-center gap-4"
      [(ngpInputOtpValue)]="value"
      (ngpInputOtpComplete)="onComplete($event)"
      ngpInputOtp
    >
      <input ngpInputOtpInput />

      <div class="flex items-center gap-2">
        @for (i of [1, 2, 3, 4, 5, 6]; track i) {
          <div
            class="relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-[1.5px] border-gray-200 bg-white text-xl font-[590] text-zinc-900 transition-all duration-200 ease-in-out group-data-disabled:cursor-default group-data-disabled:opacity-50 hover:border-zinc-300 data-active:border-blue-500 data-active:ring-1 data-active:ring-blue-500 data-caret:after:absolute data-caret:after:h-6 data-caret:after:w-px data-caret:after:bg-blue-500 data-caret:after:content-[''] data-placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700 dark:data-active:border-blue-400 dark:data-active:ring-blue-400 dark:data-caret:after:bg-blue-400 dark:data-placeholder:text-zinc-500"
            ngpInputOtpSlot
          ></div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpInputOtpSlot][data-caret]::after {
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
