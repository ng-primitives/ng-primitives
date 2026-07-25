import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'app-input-form-field',
  imports: [NgpInput, NgpLabel, NgpDescription, NgpFormField],
  host: {
    class: 'contents',
  },
  template: `
    <div class="flex w-[300px] flex-col gap-1.5" ngpFormField>
      <label class="m-0 text-sm/5 font-[510] text-gray-900 dark:text-gray-100" ngpLabel>
        Email address
      </label>
      <p class="m-0 mb-1 text-xs/4! text-gray-600 dark:text-gray-300" ngpDescription>
        We'll never share your email with anyone else, unless they pay us.
      </p>
      <input
        class="h-[2.125rem] w-full min-w-0 rounded-lg border-none bg-white px-4 text-sm tracking-[-0.006em] text-gray-900 shadow-xs ring-1 ring-black/10 outline-none placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-gray-100 dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:outline-blue-400"
        ngpInput
        type="email"
        placeholder="Enter your email address"
      />
    </div>
  `,
})
export default class InputFormFieldExample {}
