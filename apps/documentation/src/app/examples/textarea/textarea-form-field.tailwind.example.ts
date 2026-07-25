import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  selector: 'app-textarea-form-field',
  imports: [NgpTextarea, NgpLabel, NgpDescription, NgpFormField],
  host: {
    class: 'contents',
  },
  template: `
    <div class="flex w-[90%] flex-col gap-1.5" ngpFormField>
      <label class="m-0 text-sm/5 font-[510] text-gray-900 dark:text-gray-100" ngpLabel>
        Message
      </label>
      <p class="m-0 mb-1 text-xs/4! text-gray-600 dark:text-gray-300" ngpDescription>
        Tell us about your favorite sandwich.
      </p>
      <textarea
        class="h-[72px] w-[90%] rounded-[0.625rem] border-none bg-white px-[14px] py-[10px] text-[0.875rem] tracking-[-0.006em] text-gray-900 shadow-xs ring-1 ring-black/10 outline-none placeholder:text-gray-400 data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:text-gray-100 dark:ring-white/10 dark:placeholder:text-gray-500 dark:data-focus:outline-blue-400"
        ngpTextarea
        placeholder="Enter your message"
      ></textarea>
    </div>
  `,
})
export default class TextareaFormFieldExample {}
