import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';

@Component({
  selector: 'app-form-field-tailwind',
  imports: [NgpFormField, NgpLabel, NgpError, NgpDescription, NgpFormControl, ReactiveFormsModule],
  template: `
    <div class="flex w-[300px] flex-col gap-1.5" [formGroup]="formGroup" ngpFormField>
      <label class="m-0 text-sm leading-5 font-[510] text-zinc-900 dark:text-zinc-100" ngpLabel>
        Full Name
      </label>
      <p class="m-0 mb-1 text-xs/4! text-zinc-600 dark:text-zinc-300" ngpDescription>
        Please include any middle names, no matter how ridiculous.
      </p>
      <input
        class="h-[2.125rem] w-full min-w-0 rounded-lg border-none bg-white px-4 text-sm tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-hidden placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:focus:outline-blue-400"
        ngpFormControl
        type="text"
        placeholder="Enter your full name"
        formControlName="fullName"
      />
      <p
        class="m-0 hidden text-xs/4! text-[#f01e2b] data-[validator=fail]:data-dirty:block dark:text-[#ff4651]"
        ngpError
        ngpErrorValidator="required"
      >
        This field is required.
      </p>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class FormFieldTailwindExample {
  /** The Angular Form Group */
  readonly formGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
  });
}
