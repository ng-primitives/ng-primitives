import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpCheckboxGroup } from 'ng-primitives/checkbox-group';

const checkboxClass =
  'inline-flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-[0.4375rem] border-[1.5px] border-gray-300 bg-white align-middle text-[0.8125rem] text-white outline-hidden transition-all data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_1px_1px_0_rgba(0,0,0,0.06)] data-focus-visible:ring-2 data-focus-visible:ring-blue-500/40 data-focus-visible:ring-offset-2 data-hover:border-[#f01e2b] data-indeterminate:border-[#f01e2b] data-indeterminate:bg-[#f01e2b] dark:border-zinc-800 dark:bg-zinc-950 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-focus-visible:ring-blue-400/45 dark:data-focus-visible:ring-offset-zinc-950 dark:data-hover:border-[#ff4651] dark:data-indeterminate:border-[#ff4651] dark:data-indeterminate:bg-[#ff4651]';

@Component({
  selector: 'app-checkbox-group',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxGroup],
  providers: [provideIcons({ heroCheckMini, heroMinusMini })],
  template: `
    <div
      class="grid w-56 gap-2.5"
      [ngpCheckboxGroupDefaultValue]="defaultValue"
      ngpCheckboxGroup
      aria-labelledby="checkbox-group-label"
    >
      <div
        class="text-[0.8125rem] font-semibold text-gray-600 dark:text-zinc-400"
        id="checkbox-group-label"
      >
        Fruits
      </div>

      <label
        class="flex cursor-pointer items-center gap-2 text-sm text-gray-900 dark:text-zinc-100"
      >
        <span
          class="${checkboxClass}"
          #fuji="ngpCheckbox"
          ngpCheckbox
          ngpCheckboxValue="fuji-apple"
        >
          @if (fuji.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Fuji
      </label>
      <label
        class="flex cursor-pointer items-center gap-2 text-sm text-gray-900 dark:text-zinc-100"
      >
        <span
          class="${checkboxClass}"
          #gala="ngpCheckbox"
          ngpCheckbox
          ngpCheckboxValue="gala-apple"
        >
          @if (gala.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Gala
      </label>
      <label
        class="flex cursor-pointer items-center gap-2 text-sm text-gray-900 dark:text-zinc-100"
      >
        <span
          class="${checkboxClass}"
          #granny="ngpCheckbox"
          ngpCheckbox
          ngpCheckboxValue="granny-smith-apple"
        >
          @if (granny.state.checked()) {
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          }
        </span>
        Granny Smith
      </label>
    </div>
  `,
})
export default class CheckboxGroupExample {
  readonly defaultValue = ['fuji-apple'];
}
