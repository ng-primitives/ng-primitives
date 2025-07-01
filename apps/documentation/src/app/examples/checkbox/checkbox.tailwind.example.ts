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
      class="flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded border border-gray-300 bg-transparent text-xs text-white outline-none transition-colors data-[checked]:border-transparent data-[indeterminate]:border-transparent data-[checked]:bg-gray-900 data-[indeterminate]:bg-gray-900 data-[focus-visible]:ring-2 data-[focus-visible]:ring-blue-500 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-white dark:border-gray-700 dark:text-gray-900 dark:data-[checked]:bg-gray-50 dark:data-[indeterminate]:bg-gray-50 dark:data-[focus-visible]:ring-offset-black"
      [(ngpCheckboxChecked)]="checked"
      ngpCheckbox
    >
      @if (checked()) {
        <ng-icon name="heroCheckMini" aria-hidden="true" />
      }
    </span>
  `,
})
export default class CheckboxTailwind {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}
