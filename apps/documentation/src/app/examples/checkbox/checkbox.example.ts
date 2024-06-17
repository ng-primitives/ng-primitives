import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import {
  NgpCheckbox,
  NgpCheckboxIndicator,
  NgpCheckboxInput,
  NgpCheckboxLabel,
} from '@ng-primitives/ng-primitives/checkbox';

@Component({
  standalone: true,
  selector: 'app-checkbox',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxIndicator, NgpCheckboxLabel, NgpCheckboxInput],
  viewProviders: [provideIcons({ heroCheckMini })],
  template: `
    <div
      class="group flex select-none items-center gap-x-3"
      [(ngpCheckboxChecked)]="checked"
      ngpCheckbox
    >
      <input ngpCheckboxInput />

      <button
        class="flex size-5 cursor-pointer items-center justify-center rounded border border-neutral-200 bg-white shadow-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500 group-hover:bg-neutral-50 data-[state=checked]:border-neutral-950 data-[state=checked]:bg-neutral-950 data-[state=checked]:group-hover:bg-neutral-950"
        ngpCheckboxIndicator
      >
        @if (checked()) {
          <ng-icon class="text-xs text-white" name="heroCheckMini" />
        }
      </button>
      <label class="cursor-pointer text-sm font-medium text-neutral-950" ngpCheckboxLabel>
        Accept terms and conditions
      </label>
    </div>
  `,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(false);
}
