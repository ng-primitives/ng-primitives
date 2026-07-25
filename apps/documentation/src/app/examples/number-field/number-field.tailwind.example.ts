import { Component, signal } from '@angular/core';
import {
  NgpNumberField,
  NgpNumberFieldDecrement,
  NgpNumberFieldIncrement,
  NgpNumberFieldInput,
} from 'ng-primitives/number-field';

@Component({
  selector: 'app-number-field',
  imports: [NgpNumberField, NgpNumberFieldInput, NgpNumberFieldIncrement, NgpNumberFieldDecrement],
  host: {
    class: 'contents',
  },
  template: `
    <div
      class="inline-flex items-center overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:focus-within:outline-blue-400"
      [(ngpNumberFieldValue)]="value"
      [ngpNumberFieldMin]="0"
      [ngpNumberFieldMax]="100"
      ngpNumberField
    >
      <button
        class="flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center border-none bg-transparent text-base text-zinc-600 transition-colors duration-150 select-none [-webkit-touch-callout:none] data-disabled:cursor-not-allowed data-disabled:opacity-40 data-hover:bg-zinc-50 data-hover:text-zinc-900 data-disabled:data-hover:bg-transparent data-disabled:data-hover:text-zinc-600 data-press:bg-zinc-100 dark:text-zinc-300 dark:data-hover:bg-zinc-900 dark:data-hover:text-zinc-100 dark:data-disabled:data-hover:bg-transparent dark:data-disabled:data-hover:text-zinc-300 dark:data-press:bg-zinc-800"
        ngpNumberFieldDecrement
        aria-label="Decrement"
      >
        −
      </button>
      <input
        class="h-[2.125rem] w-16 border-none bg-transparent p-0 text-center text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        ngpNumberFieldInput
      />
      <button
        class="flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center border-none bg-transparent text-base text-zinc-600 transition-colors duration-150 select-none [-webkit-touch-callout:none] data-disabled:cursor-not-allowed data-disabled:opacity-40 data-hover:bg-zinc-50 data-hover:text-zinc-900 data-disabled:data-hover:bg-transparent data-disabled:data-hover:text-zinc-600 data-press:bg-zinc-100 dark:text-zinc-300 dark:data-hover:bg-zinc-900 dark:data-hover:text-zinc-100 dark:data-disabled:data-hover:bg-transparent dark:data-disabled:data-hover:text-zinc-300 dark:data-press:bg-zinc-800"
        ngpNumberFieldIncrement
        aria-label="Increment"
      >
        +
      </button>
    </div>
  `,
})
export default class NumberFieldExample {
  value = signal(0);
}
