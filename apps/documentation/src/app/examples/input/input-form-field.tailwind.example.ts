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
      <label class="m-0 text-sm/5 font-[510] text-zinc-900 dark:text-zinc-100" ngpLabel>
        Email address
      </label>
      <p class="m-0 mb-1 text-xs/4! text-zinc-600 dark:text-zinc-300" ngpDescription>
        We'll never share your email with anyone else, unless they pay us.
      </p>
      <input
        class="h-[2.125rem] w-full min-w-0 rounded-lg border-none bg-white px-4 text-sm tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:focus:outline-blue-400"
        ngpInput
        type="email"
        placeholder="Enter your email address"
      />
    </div>
  `,
})
export default class InputFormFieldExample {}
