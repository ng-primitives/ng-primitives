import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck } from '@ng-icons/heroicons/outline';
import {
  NgpCheckboxDirective,
  NgpCheckboxIndicatorDirective,
  NgpCheckboxInputDirective,
  NgpCheckboxLabelDirective,
} from '@ng-primitives/ng-primitives/checkbox';

@Component({
  standalone: true,
  selector: 'app-checkbox',
  imports: [
    NgIcon,
    NgpCheckboxDirective,
    NgpCheckboxIndicatorDirective,
    NgpCheckboxLabelDirective,
    NgpCheckboxInputDirective,
  ],
  viewProviders: [provideIcons({ heroCheck })],
  template: `<div
    class="group flex select-none items-center gap-x-4"
    [(ngpCheckboxChecked)]="checked"
    ngpCheckbox
  >
    <input ngpCheckboxInput />

    <button
      class="flex size-6 cursor-pointer items-center justify-center rounded border border-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 group-hover:bg-blue-50/10 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 group-hover:data-[state=checked]:bg-blue-500"
      ngpCheckboxIndicator
    >
      @if (checked()) {
        <ng-icon class="text-lg text-white" name="heroCheck" />
      }
    </button>
    <label class="cursor-pointer text-white" ngpCheckboxLabel>Accept terms and conditions</label>
  </div>`,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(false);
}
