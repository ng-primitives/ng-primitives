import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'app-checkbox-form-control',
  imports: [NgIcon, NgpCheckbox, NgpFormField, NgpLabel, NgpDescription],
  providers: [provideIcons({ heroCheckMini })],
  template: `
    <div class="flex items-start gap-x-3" ngpFormField>
      <span
        class="mt-[0.0625rem] inline-flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-[0.4375rem] border-[1.5px] border-zinc-300 bg-white p-0 text-[0.8125rem] text-white transition-all duration-150 outline-none data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_1px_0_rgba(0,0,0,0.06)] data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-offset-2 data-hover:border-[#f01e2b] data-checked:data-hover:border-[#d81825] data-checked:data-hover:bg-[#d81825] dark:border-zinc-800 dark:bg-zinc-950 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-focus-visible:ring-blue-400 dark:data-focus-visible:ring-offset-zinc-950 dark:data-hover:border-[#ff4651] dark:data-checked:data-hover:border-[#ff5d67] dark:data-checked:data-hover:bg-[#ff5d67]"
        [(ngpCheckboxChecked)]="checked"
        ngpCheckbox
      >
        @if (checked()) {
          <ng-icon
            class="block! h-[0.8125rem]! w-[0.8125rem]!"
            name="heroCheckMini"
            aria-hidden="true"
          />
        }
      </span>

      <label
        class="flex cursor-pointer flex-col gap-y-0.5 text-sm/[1.4] font-[510] tracking-[-0.014em] text-zinc-900 dark:text-zinc-100"
        ngpLabel
      >
        <p>Enable notifications</p>
        <p
          class="text-[0.8125rem]/[1.5]! font-normal tracking-[-0.011em] text-zinc-600 dark:text-zinc-300"
          ngpDescription
        >
          Receive notifications when someone follows you.
        </p>
      </label>
    </div>
  `,
})
export default class CheckboxFormFieldExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}
