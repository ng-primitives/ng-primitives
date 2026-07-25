import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';

@Component({
  selector: 'app-focus-trap',
  imports: [NgpFocusTrap, NgpButton],
  template: `
    <div
      class="relative flex flex-col items-center gap-4 rounded-lg border border-dashed border-black/10 bg-gray-100 p-4 before:absolute before:-top-6 before:left-4 before:text-[0.75rem] before:text-gray-600 before:content-['Focus_Trap_Disabled'] data-focus-trap:before:content-['Focus_Trap_Enabled'] dark:border-zinc-800 dark:bg-zinc-800 dark:before:text-gray-300"
      [ngpFocusTrapDisabled]="disabled()"
      ngpFocusTrap
    >
      <button
        class="h-[2.125rem] rounded-lg border border-black/10 bg-white px-3.5 font-[510] text-gray-900 shadow-xs transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        (click)="disabled.set(false)"
        ngpButton
      >
        Enable Focus Trap
      </button>
      <button
        class="h-[2.125rem] rounded-lg border border-black/10 bg-white px-3.5 font-[510] text-gray-900 shadow-xs transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-100 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        (click)="disabled.set(true)"
        ngpButton
      >
        Disable Focus Trap
      </button>
    </div>
  `,
})
export default class FocusTrapExample {
  /**
   * Whether the focus trap is disabled.
   */
  disabled = signal(true);
}
