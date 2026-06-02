import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'app-checkbox',
  imports: [NgIcon, NgpCheckbox],
  providers: [provideIcons({ heroCheckMini })],
  template: `
    <span
      class="inline-flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-[0.4375rem] border-[1.5px] border-gray-300 bg-white align-middle text-[0.8125rem] text-white outline-hidden transition-all data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_1px_0_rgba(0,0,0,0.06)] data-focus-visible:ring-2 data-focus-visible:ring-blue-500/40 data-focus-visible:ring-offset-2 data-hover:border-[#f01e2b] data-indeterminate:border-[#f01e2b] data-indeterminate:bg-[#f01e2b] dark:border-zinc-800 dark:bg-zinc-950 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-focus-visible:ring-blue-400/45 dark:data-focus-visible:ring-offset-zinc-950 dark:data-hover:border-[#ff4651] dark:data-indeterminate:border-[#ff4651] dark:data-indeterminate:bg-[#ff4651]"
      [(ngpCheckboxChecked)]="checked"
      ngpCheckbox
    >
      @if (checked()) {
        <ng-icon name="heroCheckMini" aria-hidden="true" />
      }
    </span>
  `,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}
