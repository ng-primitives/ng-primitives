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
      class="inline-flex items-center overflow-hidden rounded-lg bg-white shadow-xs ring-1 ring-black/10 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500 dark:bg-zinc-950 dark:ring-white/10 dark:focus-within:outline-blue-400"
      [(ngpNumberFieldValue)]="value"
      [ngpNumberFieldMin]="0"
      [ngpNumberFieldMax]="100"
      ngpNumberField
    >
      <button
        class="flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center border-none bg-transparent text-base text-gray-600 transition-colors duration-150 select-none [-webkit-touch-callout:none] data-disabled:cursor-not-allowed data-disabled:opacity-40 data-hover:bg-gray-50 data-hover:text-gray-900 data-disabled:data-hover:bg-transparent data-disabled:data-hover:text-gray-600 data-press:bg-gray-100 dark:text-gray-300 dark:data-hover:bg-zinc-900 dark:data-hover:text-gray-100 dark:data-disabled:data-hover:bg-transparent dark:data-disabled:data-hover:text-gray-300 dark:data-press:bg-zinc-800"
        ngpNumberFieldDecrement
        aria-label="Decrement"
      >
        −
      </button>
      <input
        class="h-[2.125rem] w-16 border-none bg-transparent p-0 text-center text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
        ngpNumberFieldInput
      />
      <button
        class="flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center border-none bg-transparent text-base text-gray-600 transition-colors duration-150 select-none [-webkit-touch-callout:none] data-disabled:cursor-not-allowed data-disabled:opacity-40 data-hover:bg-gray-50 data-hover:text-gray-900 data-disabled:data-hover:bg-transparent data-disabled:data-hover:text-gray-600 data-press:bg-gray-100 dark:text-gray-300 dark:data-hover:bg-zinc-900 dark:data-hover:text-gray-100 dark:data-disabled:data-hover:bg-transparent dark:data-disabled:data-hover:text-gray-300 dark:data-press:bg-zinc-800"
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
