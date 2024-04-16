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
      class="flex size-6 items-center justify-center rounded bg-white outline-none ring-blue-400 ring-offset-2 transition-shadow focus-visible:ring group-hover:bg-blue-50"
      ngpCheckboxIndicator
    >
      @if (checked()) {
        <ng-icon class="text-lg text-blue-500" name="heroCheck" />
      }
    </button>
    <label class="text-white" ngpCheckboxLabel>Accept terms and conditions</label>
  </div>`,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(false);
}
