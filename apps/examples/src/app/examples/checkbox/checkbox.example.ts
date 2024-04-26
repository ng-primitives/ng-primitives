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
      class="border-primary-300 ring-primary-300/50 group-hover:bg-primary-50/10 data-[state=checked]:bg-primary-500 group-hover:data-[state=checked]:bg-primary-500 flex size-6 cursor-pointer items-center justify-center rounded border outline-none focus-visible:ring"
      ngpCheckboxIndicator
    >
      @if (checked()) {
        <ng-icon class="text-lg text-neutral-800" name="heroCheck" />
      }
    </button>
    <label class="text-primary-500 cursor-pointer" ngpCheckboxLabel
      >Accept terms and conditions</label
    >
  </div>`,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(false);
}
