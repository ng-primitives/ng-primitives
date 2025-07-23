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
  standalone: true,
  imports: [NgpFormField, NgpLabel, NgpError, NgpDescription, NgpFormControl, ReactiveFormsModule],
  template: `
    <div class="flex w-[90%] flex-col gap-1.5" [formGroup]="formGroup" ngpFormField>
      <label class="m-0 text-sm font-medium leading-5 text-gray-900 dark:text-gray-100" ngpLabel>
        Full Name
      </label>
      <p class="m-0 mb-1 text-xs leading-4 text-gray-500 dark:text-gray-400" ngpDescription>
        Please include any middle names, no matter how ridiculous.
      </p>
      <input
        class="h-9 w-full min-w-0 rounded-lg border-none px-4 shadow-sm outline-none ring-1 ring-black/10 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        ngpFormControl
        type="text"
        placeholder="Enter your full name"
        formControlName="fullName"
      />
      <p
        class="m-0 hidden text-xs leading-4 text-red-600 data-[validator=fail][data-dirty]:block"
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
